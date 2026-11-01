/**
 * ZarooratSetu - Auth & Tiered KYC Controller
 */

import { db } from '../config/store.js';
import { DEMO_OTP, KYC_TIERS, KYC_STATUS, USER_ROLES } from '../config/constants.js';

// In-memory OTP storage: phone -> { code, expiresAt, attempts }
const activeOtps = new Map();

export const authController = {
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
      user: db.sanitizeUser(req.user)
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
