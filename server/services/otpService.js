/**
 * ZarooratSetu - OTP Cryptographic Security & Lifecycle Service
 * Enforces scrypt-salted hashing, constant-time verification,
 * rate-limiting (3 per 15 min, 30s cooldown), max 5 attempts, and single-use invalidation.
 */

import crypto from 'crypto';
import { DEMO_OTP } from '../config/constants.js';

// In-memory OTP Store: phone -> { otpHash, salt, expiresAt, attempts, signupData, lastSentAt, purpose }
const activeOtps = new Map();

// Rate Limit Tracking: phone -> Array of request timestamps in ms
const rateLimitHistory = new Map();

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MIN_RESEND_INTERVAL_MS = 30 * 1000; // 30 seconds
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 3; // Max 3 OTPs per number per 15 minutes
const MAX_ATTEMPTS = 5; // Max 5 wrong attempts before invalidation

export class OtpService {
  /**
   * Validate and normalize Indian mobile number
   * Format: 10 digits starting with 6, 7, 8, or 9
   * @param {string} phone
   * @returns {{ isValid: boolean, cleanPhone: string, fullPhone: string, error?: string }}
   */
  static validateIndianMobile(phone) {
    if (!phone || typeof phone !== 'string') {
      return {
        isValid: false,
        cleanPhone: '',
        fullPhone: '',
        error: "कृपया 10-अंकों का वैध मोबाइल नंबर दर्ज करें (Mobile number is required)."
      };
    }

    const rawDigits = phone.replace(/\D/g, '');
    let clean = rawDigits;

    // Handle standard +91 / 91 country code prefix (12 digits) or trunk 0 prefix (11 digits)
    if (rawDigits.length === 12 && rawDigits.startsWith('91')) {
      clean = rawDigits.slice(2);
    } else if (rawDigits.length === 11 && rawDigits.startsWith('0')) {
      clean = rawDigits.slice(1);
    }

    // Must be exactly 10 digits starting with 6, 7, 8, or 9
    if (clean.length !== 10) {
      return {
        isValid: false,
        cleanPhone: clean,
        fullPhone: clean ? `+91${clean}` : '',
        code: "INVALID_PHONE_LENGTH",
        error: "कृपया वैध 10-अंकों का भारतीय मोबाइल नंबर दर्ज करें (Valid 10-digit Indian mobile required)."
      };
    }

    const indianRegex = /^[6-9]\d{9}$/;
    if (!indianRegex.test(clean)) {
      return {
        isValid: false,
        cleanPhone: clean,
        fullPhone: `+91${clean}`,
        code: "INVALID_PHONE",
        error: "कृपया वैध भारतीय मोबाइल नंबर दर्ज करें (10 अंक, 6-9 से शुरू) - Valid 10-digit Indian mobile required."
      };
    }

    return {
      isValid: true,
      cleanPhone: clean,
      fullPhone: `+91${clean}`
    };
  }

  /**
   * Generates cryptographically secure 6-digit random numeric OTP
   * Uses crypto.randomInt (never Math.random)
   */
  static generateSecureOtp() {
    return crypto.randomInt(100000, 1000000).toString();
  }

  /**
   * Hashes plain text OTP using crypto.scryptSync with random salt
   * @param {string} otp
   * @returns {{ salt: string, hashHex: string, saltHash: string }}
   */
  static hashOtp(otp) {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.scryptSync(otp.toString(), salt, 32);
    const hashHex = derivedKey.toString('hex');
    return {
      salt,
      hashHex,
      saltHash: `${salt}:${hashHex}`
    };
  }

  /**
   * Constant-time comparison between entered OTP and stored salt:hash
   * @param {string} enteredOtp
   * @param {string} storedSaltHash
   * @returns {boolean}
   */
  static verifyConstantTime(enteredOtp, storedSaltHash) {
    if (!enteredOtp || !storedSaltHash || typeof storedSaltHash !== 'string') {
      return false;
    }
    const parts = storedSaltHash.split(':');
    if (parts.length !== 2) return false;

    const [salt, storedHash] = parts;
    try {
      const computedKey = crypto.scryptSync(enteredOtp.toString(), salt, 32);
      const storedKey = Buffer.from(storedHash, 'hex');
      return crypto.timingSafeEqual(computedKey, storedKey);
    } catch (err) {
      console.warn("Constant-time comparison warning:", err.message);
      return false;
    }
  }

  /**
   * Check rate limits for an Indian phone number:
   * 1. Minimum 30s cooldown between sends
   * 2. Max 3 OTP requests per 15 minutes window
   * @param {string} fullPhone
   * @returns {{ allowed: boolean, error?: string, code?: string, retryAfterSeconds?: number }}
   */
  static checkRateLimit(fullPhone) {
    const now = Date.now();
    const existing = activeOtps.get(fullPhone);

    // 1. Check 30s resend cooldown
    if (existing && existing.lastSentAt) {
      const elapsed = now - existing.lastSentAt;
      if (elapsed < MIN_RESEND_INTERVAL_MS) {
        const remainingSec = Math.ceil((MIN_RESEND_INTERVAL_MS - elapsed) / 1000);
        return {
          allowed: false,
          error: `कृपया नया OTP मंगाने के लिए ${remainingSec} सेकंड प्रतीक्षा करें (Please wait ${remainingSec}s before requesting a new OTP).`,
          code: "RESEND_COOLDOWN",
          retryAfterSeconds: remainingSec
        };
      }
    }

    // 2. Check 15-minute window count (Max 3)
    const history = (rateLimitHistory.get(fullPhone) || []).filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
    if (history.length >= MAX_REQUESTS_PER_WINDOW) {
      const oldest = history[0];
      const remainingSec = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000);
      return {
        allowed: false,
        error: `इस नंबर के लिए OTP अनुरोध सीमा (15 मिनट में अधिकतम 3) समाप्त हो चुकी है। कृपया कुछ समय बाद पुनः प्रयास करें। (Too many OTP requests. Please wait ${Math.ceil(remainingSec / 60)} minutes).`,
        code: "RATE_LIMITED_PHONE",
        retryAfterSeconds: remainingSec
      };
    }

    return { allowed: true };
  }

  /**
   * Record a rate limit attempt
   * @param {string} fullPhone
   */
  static recordRateLimitHit(fullPhone) {
    const now = Date.now();
    const history = (rateLimitHistory.get(fullPhone) || []).filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
    history.push(now);
    rateLimitHistory.set(fullPhone, history);
  }

  /**
   * Store a pending OTP record
   * @param {Object} params
   */
  static saveOtpRecord({ fullPhone, otp, signupData = null, purpose = 'signup' }) {
    const { saltHash } = this.hashOtp(otp);
    const now = Date.now();

    const record = {
      phone: fullPhone,
      otpHash: saltHash,
      expiresAt: now + OTP_EXPIRY_MS,
      attempts: 0,
      signupData,
      purpose,
      lastSentAt: now
    };

    activeOtps.set(fullPhone, record);
    this.recordRateLimitHit(fullPhone);
    return record;
  }

  /**
   * Retrieve active OTP record
   * @param {string} fullPhone
   */
  static getRecord(fullPhone) {
    return activeOtps.get(fullPhone) || null;
  }

  /**
   * Invalidate / delete OTP record
   * @param {string} fullPhone
   */
  static invalidateRecord(fullPhone) {
    activeOtps.delete(fullPhone);
  }

  /**
   * Verify an entered OTP against stored hashed record
   * @param {string} fullPhone
   * @param {string} enteredOtp
   * @returns {{ valid: boolean, error?: string, code?: string, signupData?: any, attemptsRemaining?: number }}
   */
  static verifyOtp(fullPhone, enteredOtp) {
    const record = activeOtps.get(fullPhone);
    const cleanOtp = (enteredOtp || '').toString().trim();

    if (!record) {
      if (process.env.NODE_ENV !== 'production' && cleanOtp === DEMO_OTP) {
        return {
          valid: true,
          signupData: null
        };
      }
      return {
        valid: false,
        error: "गलत OTP कोड दर्ज किया गया है या समय सीमा समाप्त हो चुकी है (Invalid or expired OTP code).",
        code: "INVALID_OTP"
      };
    }

    // Check expiry
    if (Date.now() > record.expiresAt) {
      activeOtps.delete(fullPhone);
      return {
        valid: false,
        error: "यह OTP समाप्त (Expired) हो चुका है (5 मिनट की अवधि बीत गई)। कृपया 'OTP पुनः भेजें' पर टैप करें।",
        code: "OTP_EXPIRED"
      };
    }

    // Check attempts limit (Max 5)
    if (record.attempts >= MAX_ATTEMPTS) {
      activeOtps.delete(fullPhone);
      return {
        valid: false,
        error: "अधिकतम गलत प्रयास (5 बार) पूरे हो चुके हैं। सुरक्षा कारणों से यह OTP रद्द कर दिया गया है। कृपया नया OTP मंगाएं।",
        code: "OTP_MAX_ATTEMPTS_EXCEEDED"
      };
    }

    // Constant-time check against hashed OTP (plus DEMO_OTP fallback in mock mode)
    const isHashMatch = this.verifyConstantTime(cleanOtp, record.otpHash);
    const isDemoMatch = cleanOtp === DEMO_OTP && process.env.NODE_ENV !== 'production';
    const isCorrect = isHashMatch || isDemoMatch;

    if (!isCorrect) {
      record.attempts = (record.attempts || 0) + 1;
      const remaining = MAX_ATTEMPTS - record.attempts;

      if (remaining <= 0) {
        activeOtps.delete(fullPhone);
        return {
          valid: false,
          error: "अधिकतम गलत प्रयास पूरे हो चुके हैं। यह OTP रद्द कर दिया गया है। कृपया नया OTP मंगाएं।",
          code: "OTP_MAX_ATTEMPTS_EXCEEDED"
        };
      }

      return {
        valid: false,
        error: `गलत OTP कोड दर्ज किया गया है (Incorrect OTP code). शेष प्रयास: ${remaining}`,
        code: "INVALID_OTP",
        attemptsRemaining: remaining
      };
    }

    // Verification succeeded: Single-use invalidation
    const signupData = record.signupData;
    activeOtps.delete(fullPhone);

    return {
      valid: true,
      signupData
    };
  }
}
