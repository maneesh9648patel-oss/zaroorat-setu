/**
 * ZarooratSetu - Auth & Tiered KYC Controller
 */

import { db } from '../config/store.js';
import { DEMO_OTP, KYC_TIERS, KYC_STATUS, USER_ROLES } from '../config/constants.js';
import { hashPassword, verifyPassword, generateToken } from '../utils/security.js';
import { OtpService } from '../services/otpService.js';
import { SmsService } from '../services/smsService.js';

export const authController = {
  // Step 0A: Password-based Signup
  signup(req, res) {
    try {
      const { name, phone, email, password, role, area } = req.body;

      // 1. Validate Name
      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: "Full name is required (minimum 2 characters).",
          code: "INVALID_NAME"
        });
      }

      // 2. Validate Phone
      if (!phone || typeof phone !== 'string') {
        return res.status(400).json({
          success: false,
          error: "10-digit mobile phone number is required.",
          code: "INVALID_PHONE"
        });
      }
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      if (cleanPhone.length !== 10) {
        return res.status(400).json({
          success: false,
          error: "Please enter a valid 10-digit Indian mobile number.",
          code: "INVALID_PHONE_LENGTH"
        });
      }
      const fullPhone = `+91${cleanPhone}`;

      // 3. Validate Email
      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          success: false,
          error: "Email address is required.",
          code: "INVALID_EMAIL"
        });
      }
      const cleanEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({
          success: false,
          error: "Please enter a valid email address.",
          code: "INVALID_EMAIL_FORMAT"
        });
      }

      // 4. Validate Password
      if (!password || typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({
          success: false,
          error: "Password must be at least 6 characters long.",
          code: "INVALID_PASSWORD_LENGTH"
        });
      }

      // Check confirm password if provided
      const confirmPassword = req.body.confirmPassword;
      if (confirmPassword && password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: "Passwords do not match.",
          code: "PASSWORDS_MISMATCH"
        });
      }

      // 5. Check duplicate phone
      const existingByPhone = db.getUserByPhone(fullPhone);
      if (existingByPhone) {
        return res.status(409).json({
          success: false,
          error: "An account with this mobile number already exists. Please log in.",
          code: "PHONE_EXISTS"
        });
      }

      // 6. Check duplicate email
      const existingByEmail = db.getUserByEmail(cleanEmail);
      if (existingByEmail) {
        return res.status(409).json({
          success: false,
          error: "An account with this email address already exists. Please log in.",
          code: "EMAIL_EXISTS"
        });
      }

      // 7. Hash password securely with salt
      const passwordHash = hashPassword(password);

      // 8. Determine public name
      const trimmedName = name.trim();
      const nameParts = trimmedName.split(/\s+/);
      const publicName = nameParts.length > 1 
        ? `${nameParts[0]} ${nameParts[1][0]}.` 
        : trimmedName;

      // 9. Assign user role
      const validRole = (role && Object.values(USER_ROLES).includes(role)) 
        ? role 
        : USER_ROLES.NEEDER;

      const uid = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const newUser = db.createUser({
        uid,
        phone: fullPhone,
        email: cleanEmail,
        passwordHash,
        displayName: trimmedName,
        publicName,
        role: validRole,
        kycLevel: KYC_TIERS.LEVEL_1,
        kycStatus: KYC_STATUS.BASIC_VERIFIED,
        mobile_verified: true,
        area: area || "Civil Lines",
        city: "Banda",
        coordinates: { lat: 25.4764, lng: 80.3344 },
        idDocumentPlaceholder: {
          status: "not_submitted",
          provider: "Authorized Partner (Coming Soon)"
        }
      });

      // 10. Generate JWT token
      const token = generateToken({
        uid: newUser.uid,
        role: newUser.role,
        email: newUser.email,
        phone: newUser.phone
      });

      db.logAudit({
        action: "USER_SIGNUP",
        entityType: "user",
        entityId: newUser.uid,
        performedBy: newUser.uid,
        performerName: newUser.displayName,
        performerRole: newUser.role,
        details: `New account registered: ${newUser.displayName} (${newUser.phone})`
      });

      return res.status(201).json({
        success: true,
        message: "Account created successfully! Welcome to ZarooratSetu.",
        token,
        user: db.sanitizePrivateUser(newUser)
      });
    } catch (err) {
      console.error("Signup error:", err);
      return res.status(500).json({
        success: false,
        error: "Server error during registration. Please try again.",
        code: "SERVER_ERROR"
      });
    }
  },

  // Step 0B: Password-based Login (Supports Email OR Phone)
  login(req, res) {
    try {
      const identifier = req.body.identifier || req.body.email || req.body.phone;
      const { password } = req.body;

      if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
        return res.status(400).json({
          success: false,
          error: "Please enter your registered email or 10-digit mobile number.",
          code: "MISSING_IDENTIFIER"
        });
      }

      if (!password || typeof password !== 'string') {
        return res.status(400).json({
          success: false,
          error: "Password is required.",
          code: "MISSING_PASSWORD"
        });
      }

      const cleanInput = identifier.trim();

      // Find user by email or by phone
      let user = null;
      if (cleanInput.includes('@')) {
        user = db.getUserByEmail(cleanInput.toLowerCase());
      } else {
        user = db.getUserByPhone(cleanInput);
      }

      // Fallback cross-check in case user entered email without @ or phone with letters
      if (!user) {
        user = db.getUserByEmail(cleanInput.toLowerCase()) || db.getUserByPhone(cleanInput);
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "No account found matching this email or mobile number. Please check or sign up.",
          code: "USER_NOT_FOUND"
        });
      }

      // Verify password
      const storedHash = user.passwordHash || hashPassword('password123'); // Default demo fallback
      const isMatch = verifyPassword(password, storedHash);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: "Incorrect password. Please verify your credentials and try again.",
          code: "INVALID_CREDENTIALS"
        });
      }

      // Generate signed JWT token
      const token = generateToken({
        uid: user.uid,
        role: user.role,
        email: user.email,
        phone: user.phone
      });

      db.logAudit({
        action: "USER_LOGIN",
        entityType: "user",
        entityId: user.uid,
        performedBy: user.uid,
        performerName: user.displayName,
        performerRole: user.role,
        details: `User logged in successfully via ${cleanInput.includes('@') ? 'email' : 'phone'}`
      });

      return res.json({
        success: true,
        message: `Welcome back, ${user.displayName}!`,
        token,
        user: db.sanitizePrivateUser(user)
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({
        success: false,
        error: "Server error during login. Please try again.",
        code: "SERVER_ERROR"
      });
    }
  },

  // Step 0C: Logout
  logout(req, res) {
    return res.json({
      success: true,
      message: "Logged out successfully."
    });
  },
  // Step 1: Send Mobile OTP (Indian Numbers, Rate-Limited, Scrypt Hashed)
  async sendOtp(req, res) {
    try {
      const { phone, name, email, password, confirmPassword, role, area, purpose } = req.body;

      // 1. Validate Indian mobile format
      const validation = OtpService.validateIndianMobile(phone);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: validation.error,
          code: validation.code || "INVALID_PHONE"
        });
      }
      const fullPhone = validation.fullPhone;

      // 2. If for signup, pre-validate fields and check existing users (409)
      let cleanEmail = null;
      const isSignup = purpose === 'signup' || Boolean(name) || Boolean(password);
      if (isSignup) {
        if (name && (typeof name !== 'string' || name.trim().length < 2)) {
          return res.status(400).json({
            success: false,
            error: "कृपया पूरा नाम दर्ज करें (कम से कम 2 अक्षर) - Name must be at least 2 characters.",
            code: "INVALID_NAME"
          });
        }

        if (email) {
          cleanEmail = email.trim().toLowerCase();
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({
              success: false,
              error: "कृपया वैध ईमेल पता दर्ज करें - Invalid email format.",
              code: "INVALID_EMAIL"
            });
          }
          const existingEmail = db.getUserByEmail(cleanEmail);
          if (existingEmail) {
            return res.status(409).json({
              success: false,
              error: "इस ईमेल पते पर पहले से एक खाता मौजूद है। कृपया लॉगिन करें। (Account with this email already exists).",
              code: "EMAIL_EXISTS"
            });
          }
        }

        if (password) {
          if (typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({
              success: false,
              error: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए (Password must be at least 6 characters).",
              code: "INVALID_PASSWORD_LENGTH"
            });
          }
          if (confirmPassword && password !== confirmPassword) {
            return res.status(400).json({
              success: false,
              error: "पासवर्ड मेल नहीं खा रहे हैं (Passwords do not match).",
              code: "PASSWORDS_MISMATCH"
            });
          }
        }

        // Check duplicate phone
        const existingPhone = db.getUserByPhone(fullPhone);
        if (existingPhone) {
          return res.status(409).json({
            success: false,
            error: "इस मोबाइल नंबर पर पहले से एक खाता मौजूद है। कृपया लॉगिन करें। (Account with this mobile number already exists).",
            code: "PHONE_EXISTS"
          });
        }
      } else if (purpose === 'login' || purpose === 'forgot_password') {
        const existingUser = db.getUserByPhone(fullPhone);
        if (!existingUser) {
          return res.status(404).json({
            success: false,
            error: "इस मोबाइल नंबर पर कोई खाता पंजीकृत नहीं मिला। कृपया पहले नया खाता बनाएं (No registered account found with this mobile number. Please sign up).",
            code: "USER_NOT_FOUND"
          });
        }
      }

      // 3. Rate limiting check (30s cooldown, max 3 per 15 min)
      const rateCheck = OtpService.checkRateLimit(fullPhone);
      if (!rateCheck.allowed) {
        return res.status(429).json({
          success: false,
          error: rateCheck.error,
          code: rateCheck.code,
          retryAfterSeconds: rateCheck.retryAfterSeconds
        });
      }

      // 4. Generate cryptographically secure 6-digit OTP (never Math.random)
      const otp = OtpService.generateSecureOtp();

      // 5. Hash and store OTP record with 5-minute expiry
      OtpService.saveOtpRecord({
        fullPhone,
        otp,
        signupData: {
          name: name ? name.trim() : '',
          phone: fullPhone,
          email: cleanEmail || '',
          password: password || '',
          role: role || USER_ROLES.NEEDER,
          area: area || 'Civil Lines'
        },
        purpose
      });

      // 6. Dispatch SMS via Provider (Fast2SMS / MSG91 / Twilio / Dev Console)
      const originDomain = (typeof req.get === 'function' ? req.get('host') : req.headers?.host) || '';
      const smsResult = await SmsService.sendOtpSms({ phone: fullPhone, otp, originDomain }).catch((smsErr) => {
        console.warn("SMS dispatch warning:", smsErr.message);
        return { success: false, provider: 'error', realSmsSent: false };
      });

      return res.status(200).json({
        success: true,
        message: smsResult.realSmsSent
          ? `वास्तविक SMS OTP सफलतापूर्वक +91 ${validation.cleanPhone} पर भेज दिया गया है (Real SMS delivered).`
          : `OTP सफलतापूर्वक +91 ${validation.cleanPhone} पर भेज दिया गया है (OTP sent).`,
        phone: fullPhone,
        expiresInSeconds: 300,
        resendAvailableInSeconds: 30,
        provider: smsResult.provider || process.env.SMS_PROVIDER || 'console',
        realSmsSent: Boolean(smsResult.realSmsSent),
        demoOtp: process.env.NODE_ENV !== 'production' ? DEMO_OTP : undefined,
        devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
      });
    } catch (err) {
      console.error("sendOtp error:", err);
      return res.status(500).json({
        success: false,
        error: "OTP भेजने में सर्वर त्रुटि हुई। कृपया पुनः प्रयास करें। (Server error sending OTP)",
        code: "SERVER_ERROR"
      });
    }
  },

  // Step 1B: Resend Mobile OTP with 30s Cooldown
  async resendOtp(req, res) {
    try {
      const { phone } = req.body;

      const validation = OtpService.validateIndianMobile(phone);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: validation.error,
          code: "INVALID_PHONE"
        });
      }
      const fullPhone = validation.fullPhone;

      // Rate limit check
      const rateCheck = OtpService.checkRateLimit(fullPhone);
      if (!rateCheck.allowed) {
        return res.status(429).json({
          success: false,
          error: rateCheck.error,
          code: rateCheck.code,
          retryAfterSeconds: rateCheck.retryAfterSeconds
        });
      }

      // Retrieve previous session data if available
      const existing = OtpService.getRecord(fullPhone);
      const signupData = existing ? existing.signupData : null;
      const purpose = existing ? existing.purpose : 'signup';

      // Generate new secure OTP
      const otp = OtpService.generateSecureOtp();
      OtpService.saveOtpRecord({
        fullPhone,
        otp,
        signupData,
        purpose
      });

      const originDomain = (typeof req.get === 'function' ? req.get('host') : req.headers?.host) || '';
      const smsResult = await SmsService.sendOtpSms({ phone: fullPhone, otp, originDomain }).catch((smsErr) => {
        console.warn("SMS dispatch warning:", smsErr.message);
        return { success: false, provider: 'error', realSmsSent: false };
      });

      return res.status(200).json({
        success: true,
        message: smsResult.realSmsSent
          ? `नया वास्तविक SMS OTP +91 ${validation.cleanPhone} पर भेज दिया गया है (New real SMS sent).`
          : `नया OTP सफलतापूर्वक +91 ${validation.cleanPhone} पर भेज दिया गया है (New OTP sent).`,
        phone: fullPhone,
        expiresInSeconds: 300,
        resendAvailableInSeconds: 30,
        provider: smsResult.provider || process.env.SMS_PROVIDER || 'console',
        realSmsSent: Boolean(smsResult.realSmsSent),
        demoOtp: process.env.NODE_ENV !== 'production' ? DEMO_OTP : undefined,
        devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
      });
    } catch (err) {
      console.error("resendOtp error:", err);
      return res.status(500).json({
        success: false,
        error: "OTP पुनः भेजने में त्रुटि हुई। (Server error resending OTP)",
        code: "SERVER_ERROR"
      });
    }
  },

  // Step 1C: Verify OTP with Constant-Time Check & Account Creation
  verifyOtp(req, res) {
    try {
      const { phone, otp, signupData } = req.body;

      if (!phone || !otp) {
        return res.status(400).json({
          success: false,
          error: "मोबाइल नंबर और 6-अंकों का OTP दोनों आवश्यक हैं (Phone number and OTP are required).",
          code: "MISSING_FIELDS"
        });
      }

      const validation = OtpService.validateIndianMobile(phone);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: validation.error,
          code: "INVALID_PHONE"
        });
      }
      const fullPhone = validation.fullPhone;

      // Verify OTP (scrypt-salted constant-time check, max 5 attempts, single-use invalidation)
      const verifyResult = OtpService.verifyOtp(fullPhone, otp);
      if (!verifyResult.valid) {
        const statusCode = verifyResult.code === 'OTP_MAX_ATTEMPTS_EXCEEDED' ? 429 : 400;
        return res.status(statusCode).json({
          success: false,
          error: verifyResult.error,
          code: verifyResult.code,
          attemptsRemaining: verifyResult.attemptsRemaining
        });
      }

      // Verification passed!
      const mergedSignupData = {
        ...(verifyResult.signupData || {}),
        ...(signupData || {})
      };

      // Check existing user or create new user
      let user = db.getUserByPhone(fullPhone);
      let isNewUser = false;

      if (!user) {
        isNewUser = true;
        const cleanEmail = mergedSignupData.email ? mergedSignupData.email.trim().toLowerCase() : null;
        if (cleanEmail) {
          const emailExists = db.getUserByEmail(cleanEmail);
          if (emailExists) {
            return res.status(409).json({
              success: false,
              error: "An account with this email address already exists. Please log in.",
              code: "EMAIL_EXISTS"
            });
          }
        }

        const rawPassword = mergedSignupData.password || 'password123';
        const passwordHash = hashPassword(rawPassword);
        const trimmedName = mergedSignupData.name?.trim() || 'New Member';
        const nameParts = trimmedName.split(/\s+/);
        const publicName = nameParts.length > 1 
          ? `${nameParts[0]} ${nameParts[1][0]}.` 
          : trimmedName;

        const validRole = (mergedSignupData.role && Object.values(USER_ROLES).includes(mergedSignupData.role)) 
          ? mergedSignupData.role 
          : USER_ROLES.NEEDER;

        const uid = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
        user = db.createUser({
          uid,
          phone: fullPhone,
          email: cleanEmail,
          passwordHash,
          displayName: trimmedName,
          publicName,
          role: validRole,
          kycLevel: KYC_TIERS.LEVEL_1,
          kycStatus: KYC_STATUS.BASIC_VERIFIED,
          mobile_verified: true,
          area: mergedSignupData.area || "Civil Lines",
          city: "Banda",
          coordinates: { lat: 25.4764, lng: 80.3344 },
          idDocumentPlaceholder: {
            status: "not_submitted",
            provider: "Authorized Partner (Coming Soon)"
          }
        });

        db.logAudit({
          action: "USER_SIGNUP_OTP_VERIFIED",
          entityType: "user",
          entityId: user.uid,
          performedBy: user.uid,
          performerName: user.displayName,
          performerRole: user.role,
          details: `Account verified and created via mobile OTP: ${user.displayName} (${user.phone})`
        });
      } else {
        // Existing user: ensure mobile_verified is true
        if (!user.mobile_verified) {
          user = db.updateUser(user.uid, { mobile_verified: true }) || user;
        }
      }

      // Generate JWT token
      const token = generateToken({
        uid: user.uid,
        role: user.role,
        email: user.email,
        phone: user.phone
      });

      return res.status(isNewUser ? 201 : 200).json({
        success: true,
        message: isNewUser 
          ? "मोबाइल नंबर सफलतापूर्वक सत्यापित! आपका खाता तैयार हो गया है (Mobile verified! Account created)."
          : "सफलतापूर्वक लॉगिन हो गया! (Logged in successfully)",
        token,
        user: db.sanitizePrivateUser(user),
        isNewUser,
        kycBadge: "Basic verified"
      });
    } catch (err) {
      console.error("verifyOtp error:", err);
      return res.status(500).json({
        success: false,
        error: "OTP सत्यापन में सर्वर त्रुटि हुई। (Server error verifying OTP)",
        code: "SERVER_ERROR"
      });
    }
  },

  // Step 1D: Reset Password via Verified Mobile OTP
  resetPassword(req, res) {
    try {
      const { phone, otp, newPassword, confirmPassword } = req.body;

      if (!phone || !otp || !newPassword) {
        return res.status(400).json({
          success: false,
          error: "मोबाइल नंबर, OTP और नया पासवर्ड आवश्यक हैं (Phone, OTP, and new password are required).",
          code: "MISSING_FIELDS"
        });
      }

      const validation = OtpService.validateIndianMobile(phone);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: validation.error,
          code: "INVALID_PHONE"
        });
      }
      const fullPhone = validation.fullPhone;

      if (typeof newPassword !== 'string' || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: "नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए (New password must be at least 6 characters).",
          code: "INVALID_PASSWORD_LENGTH"
        });
      }

      if (confirmPassword && newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: "पासवर्ड मेल नहीं खा रहे हैं (Passwords do not match).",
          code: "PASSWORDS_MISMATCH"
        });
      }

      // Verify OTP (scrypt-salted constant-time check, max 5 attempts, single-use invalidation)
      const verifyResult = OtpService.verifyOtp(fullPhone, otp);
      if (!verifyResult.valid) {
        const statusCode = verifyResult.code === 'OTP_MAX_ATTEMPTS_EXCEEDED' ? 429 : 400;
        return res.status(statusCode).json({
          success: false,
          error: verifyResult.error,
          code: verifyResult.code,
          attemptsRemaining: verifyResult.attemptsRemaining
        });
      }

      let user = db.getUserByPhone(fullPhone);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "उपयोगकर्ता खाता नहीं मिला (User not found).",
          code: "USER_NOT_FOUND"
        });
      }

      const passwordHash = hashPassword(newPassword);
      user = db.updateUser(user.uid, { passwordHash, mobile_verified: true }) || user;

      const token = generateToken({
        uid: user.uid,
        role: user.role,
        email: user.email,
        phone: user.phone
      });

      db.logAudit({
        action: "PASSWORD_RESET_OTP_VERIFIED",
        entityType: "user",
        entityId: user.uid,
        performedBy: user.uid,
        performerName: user.displayName,
        performerRole: user.role,
        details: `Password reset successfully via verified mobile OTP for ${user.displayName} (${user.phone})`
      });

      return res.status(200).json({
        success: true,
        message: "पासवर्ड सफलतापूर्वक बदल दिया गया है! आपका नया पासवर्ड सक्रिय है।",
        token,
        user: db.sanitizePrivateUser(user)
      });
    } catch (err) {
      console.error("resetPassword error:", err);
      return res.status(500).json({
        success: false,
        error: "पासवर्ड बदलने में सर्वर त्रुटि हुई।",
        code: "SERVER_ERROR"
      });
    }
  },

  // Step 2: Email verification
  verifyEmail(req, res) {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: "Valid email address is required.",
        code: "INVALID_EMAIL"
      });
    }

    const user = req.user;
    const updated = db.updateUser(user.uid, {
      email,
      emailVerified: true
    });

    return res.json({
      success: true,
      message: "Email address verified successfully (Demo verification).",
      user: db.sanitizeUser(updated)
    });
  },

  // Step 3: Basic Profile Setup
  updateProfile(req, res) {
    const { displayName, area, role, ngoRegNumber } = req.body;
    const user = req.user;

    const updates = {};
    if (displayName) {
      updates.displayName = displayName.trim();
      const parts = displayName.trim().split(' ');
      updates.publicName = parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
    }
    if (area) updates.area = area;
    if (role && Object.values(USER_ROLES).includes(role)) {
      updates.role = role;
    }
    if (ngoRegNumber && (role === USER_ROLES.NGO || user.role === USER_ROLES.NGO)) {
      updates.ngoDetails = {
        regNumber: ngoRegNumber,
        verifiedByAdmin: true
      };
      updates.kycLevel = KYC_TIERS.LEVEL_3;
      updates.kycStatus = KYC_STATUS.FULLY_VERIFIED;
    }

    const updated = db.updateUser(user.uid, updates);

    return res.json({
      success: true,
      message: "Profile updated successfully.",
      user: db.sanitizeUser(updated)
    });
  },

  // Step 4: Additional Identity Verification Placeholder (Honesty rule)
  uploadIdPlaceholder(req, res) {
    const { documentType, notes } = req.body;
    const user = req.user;

    // We do NOT claim real Aadhaar verification
    const idData = {
      status: "pending_review",
      documentType: documentType || "Government Photo ID",
      notes: notes || "Submitted for manual verifier review (rule-based authorized process)",
      submittedAt: new Date().toISOString(),
      provider: "Authorized Partner (Coming Soon)"
    };

    // For demo convenience, automatically grant Level 2 after submission so lenders/donors can test
    const updated = db.updateUser(user.uid, {
      idDocumentPlaceholder: idData,
      kycLevel: KYC_TIERS.LEVEL_2,
      kycStatus: KYC_STATUS.FULLY_VERIFIED
    });

    db.logAudit({
      action: "KYC_TIER2_SUBMITTED",
      entityType: "user",
      entityId: user.uid,
      performedBy: user.uid,
      performerName: user.displayName,
      performerRole: user.role,
      details: "Additional identity check submitted. Basic manual verifier tier granted for demo."
    });

    return res.json({
      success: true,
      message: "Additional verification details received (as per applicable rules and authorized integration). Level 2 identity verified for demo.",
      disclaimer: "Feature marked 'Coming soon' for production Aadhaar/DigiLocker API integration.",
      user: db.sanitizeUser(updated)
    });
  },

  // Current session & privacy-safe profile
  getMe(req, res) {
    return res.json({
      success: true,
      user: db.sanitizePrivateUser(req.user)
    });
  },

  // Demo Switcher for fast evaluation during hackathon
  switchDemoUser(req, res) {
    const { role } = req.body;
    let targetUid = "usr_aarav";

    if (role === USER_ROLES.NGO) targetUid = "usr_ngo_01";
    else if (role === USER_ROLES.DONOR) targetUid = "usr_donor_priya";
    else if (role === USER_ROLES.VERIFIER) targetUid = "usr_verifier_01";
    else if (role === USER_ROLES.ADMIN) targetUid = "usr_admin";

    const user = db.getUserByUid(targetUid);
    if (!user) {
      return res.status(404).json({ success: false, error: "Demo user not found" });
    }

    return res.json({
      success: true,
      token: `tok_${user.uid}`,
      user: db.sanitizeUser(user),
      message: `Switched demo identity to ${user.displayName} (${user.role})`
    });
  }
};
