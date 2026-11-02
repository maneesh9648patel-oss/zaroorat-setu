/**
 * ZarooratSetu - Auth & Tiered KYC Controller
 */

import { db } from '../config/store.js';
import { DEMO_OTP, KYC_TIERS, KYC_STATUS, USER_ROLES } from '../config/constants.js';
import { hashPassword, verifyPassword, generateToken } from '../utils/security.js';

// In-memory OTP storage: phone -> { code, expiresAt, attempts }
const activeOtps = new Map();

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
  // Step 1: Send Mobile OTP
  sendOtp(req, res) {
    const { phone } = req.body;
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({
        success: false,
        error: "Valid phone number is required.",
        code: "INVALID_PHONE"
      });
    }

    // Normalize phone format
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid 10-digit mobile number.",
        code: "INVALID_PHONE_LENGTH"
      });
    }

    const fullPhone = `+91${cleanPhone}`;
    const code = DEMO_OTP; // 123456 in mock mode
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min expiry

    activeOtps.set(fullPhone, { code, expiresAt, attempts: 0 });

    return res.json({
      success: true,
      message: `OTP sent successfully to ${fullPhone}`,
      phone: fullPhone,
      demoOtp: DEMO_OTP,
      isMock: true,
      expiresInSeconds: 300
    });
  },

  // Step 1: Verify OTP
  verifyOtp(req, res) {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        error: "Phone number and OTP code are required.",
        code: "MISSING_FIELDS"
      });
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const fullPhone = `+91${cleanPhone}`;

    const record = activeOtps.get(fullPhone);

    // Accept DEMO_OTP (123456) or matched recorded OTP
    const isValid = otp === DEMO_OTP || (record && record.code === otp && Date.now() <= record.expiresAt);

    if (!isValid) {
      if (record) record.attempts = (record.attempts || 0) + 1;
      return res.status(400).json({
        success: false,
        error: "Invalid or expired OTP code. Use demo code 123456.",
        code: "INVALID_OTP"
      });
    }

    // Clean up used OTP
    activeOtps.delete(fullPhone);

    // Check if user exists or create new user
    let user = db.getUserByPhone(fullPhone);
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const uid = `usr_${Date.now().toString(36)}`;
      user = db.createUser({
        uid,
        phone: fullPhone,
        email: null,
        displayName: "New Member",
        publicName: "Member",
        role: USER_ROLES.NEEDER,
        kycLevel: KYC_TIERS.LEVEL_1, // Tier 1: Basic Verified
        kycStatus: KYC_STATUS.BASIC_VERIFIED, // Strictly "Basic verified" - NEVER "complete KYC"
        area: "Civil Lines",
        city: "Banda",
        coordinates: { lat: 25.4764, lng: 80.3344 },
        idDocumentPlaceholder: {
          status: "not_submitted",
          provider: "Authorized Partner (Coming Soon)"
        }
      });
    }

    const token = `tok_${user.uid}`;

    return res.json({
      success: true,
      token,
      user: db.sanitizeUser(user),
      isNewUser,
      kycBadge: "Basic verified",
      message: isNewUser ? "Phone verified! Please complete your basic profile." : "Welcome back!"
    });
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
