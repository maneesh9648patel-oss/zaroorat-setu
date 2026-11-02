/**
 * ZarooratSetu - Aadhaar QR Controller
 * Manages mAadhaar Secure QR verification and checks for Give/Take item permissions
 */

import { aadhaarVerificationService } from '../modules/aadhaar/aadhaarVerificationService.js';
import { db } from '../config/store.js';
import { KYC_TIERS, KYC_STATUS } from '../config/constants.js';

export const aadhaarController = {
  /**
   * Verify an uploaded or scanned mAadhaar / UIDAI Secure QR code
   */
  async verifyQr(req, res) {
    try {
      const { qrData } = req.body;
      const user = req.user;

      if (!qrData || typeof qrData !== 'string') {
        return res.status(400).json({
          success: false,
          error: "QR code data is required (scanned text or image data).",
          code: "MISSING_QR_DATA"
        });
      }

      // 1. Run digital signature verification as per UIDAI specification
      const verifiedData = await aadhaarVerificationService.verify(qrData);

      // 2. Strict Privacy Rule: NEVER store full Aadhaar number or raw QR data
      // Store ONLY: verified = true, name, DOB, gender, and last 4 digits
      const aadhaarRecord = {
        verified: true,
        name: verifiedData.name,
        dob: verifiedData.dob,
        gender: verifiedData.gender,
        last4: verifiedData.last4,
        verifiedAt: new Date().toISOString(),
        issuer: "UIDAI Secure QR (RSA-2048 Digital Signature)"
      };

      const updatedUser = db.updateUser(user.uid, {
        aadhaarVerification: aadhaarRecord,
        kycLevel: KYC_TIERS.LEVEL_2,
        kycStatus: KYC_STATUS.FULLY_VERIFIED
      });

      // 3. Log audit event
      db.logAudit({
        action: "AADHAAR_SECURE_QR_VERIFIED",
        entityType: "user",
        entityId: user.uid,
        performedBy: user.uid,
        performerName: user.displayName,
        performerRole: user.role,
        details: `mAadhaar QR digitally verified for ${verifiedData.name}. Masked: XXXX XXXX ${verifiedData.last4}`
      });

      return res.json({
        success: true,
        message: `mAadhaar QR digitally verified for ${verifiedData.name} (XXXX XXXX ${verifiedData.last4})!`,
        verified: true,
        name: verifiedData.name,
        dob: verifiedData.dob,
        gender: verifiedData.gender,
        last4: verifiedData.last4,
        user: db.sanitizePrivateUser(updatedUser)
      });
    } catch (err) {
      console.warn("Aadhaar verification error:", err.message);
      return res.status(400).json({
        success: false,
        error: err.message || "Failed to verify mAadhaar QR code.",
        code: "INVALID_OR_TAMPERED_QR"
      });
    }
  },

  /**
   * Get current user's mAadhaar verification status
   */
  getStatus(req, res) {
    const user = req.user;
    const isVerified = Boolean(user.aadhaarVerification && user.aadhaarVerification.verified);
    
    return res.json({
      success: true,
      verified: isVerified,
      details: isVerified ? {
        name: user.aadhaarVerification.name,
        last4: user.aadhaarVerification.last4,
        dob: user.aadhaarVerification.dob,
        gender: user.aadhaarVerification.gender,
        verifiedAt: user.aadhaarVerification.verifiedAt
      } : null
    });
  },

  /**
   * Get authentic and tampered sample QR payloads for immediate 1-click testing
   */
  getSampleQrs(req, res) {
    const validQr = aadhaarVerificationService.createSampleSecureQr({
      name: req.user?.displayName || "Aarav Kumar",
      dob: "15-08-1995",
      gender: "M",
      last4: "9842",
      tampered: false
    });

    const tamperedQr = aadhaarVerificationService.createSampleSecureQr({
      name: "Hacked Forged Name",
      dob: "01-01-2000",
      gender: "F",
      last4: "0000",
      tampered: true
    });

    const binaryValidQr = aadhaarVerificationService.createSampleBinarySecureQr({
      name: req.user?.displayName || "Priya Verma",
      dob: "20-04-1992",
      gender: "F",
      last4: "7654",
      tampered: false
    });

    return res.json({
      success: true,
      validQr,
      tamperedQr,
      binaryValidQr
    });
  }
};
