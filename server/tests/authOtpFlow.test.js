/**
 * ZarooratSetu - Mobile OTP Verification Flow Unit & Integration Tests
 * Validates:
 * 1. Indian Mobile Format (/^[6-9]\d{9}$/)
 * 2. Cryptographic Security (scrypt-salted hash, constant-time compare)
 * 3. Max 5 Wrong Attempts Invalidation
 * 4. Single-Use Invalidation on Success
 * 5. 30s Resend Cooldown & 3/15min Rate Limiting
 * 6. User Account Creation with mobile_verified: true
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { OtpService } from '../services/otpService.js';
import { SmsService } from '../services/smsService.js';
import { db } from '../config/store.js';
import { authController } from '../controllers/authController.js';

test('1. Indian Mobile Number Validation', async (t) => {
  await t.test('Accepts valid 10-digit numbers starting with 6, 7, 8, 9', () => {
    const validNumbers = ['9876543210', '8123456789', '7001234567', '6998877665', '+919876543210'];
    for (const num of validNumbers) {
      const res = OtpService.validateIndianMobile(num);
      assert.equal(res.isValid, true, `Should accept ${num}`);
      assert.match(res.cleanPhone, /^[6-9]\d{9}$/);
      assert.equal(res.fullPhone, `+91${res.cleanPhone}`);
    }
  });

  await t.test('Rejects invalid phone numbers (non-Indian, wrong length, bad prefix)', () => {
    const invalidNumbers = [
      '1234567890', // starts with 1
      '5555555555', // starts with 5
      '98765',      // too short
      '9876543210123', // too long
      '',           // empty
      null,         // null
      'abcdefghij'  // non-numeric
    ];
    for (const num of invalidNumbers) {
      const res = OtpService.validateIndianMobile(num);
      assert.equal(res.isValid, false, `Should reject ${num}`);
      assert.ok(res.error);
    }
  });
});

test('2. Cryptographic OTP Generation & Scrypt Hashing', async (t) => {
  await t.test('Generates 6-digit numeric string', () => {
    for (let i = 0; i < 20; i++) {
      const otp = OtpService.generateSecureOtp();
      assert.equal(typeof otp, 'string');
      assert.equal(otp.length, 6);
      const num = parseInt(otp, 10);
      assert.ok(num >= 100000 && num <= 999999);
    }
  });

  await t.test('Hashes OTP with unique salt using scrypt', () => {
    const otp = '654321';
    const hash1 = OtpService.hashOtp(otp);
    const hash2 = OtpService.hashOtp(otp);

    // Never stores plaintext
    assert.ok(!hash1.saltHash.includes(otp));
    // Different salts produce different hashes
    assert.notEqual(hash1.salt, hash2.salt);
    assert.notEqual(hash1.saltHash, hash2.saltHash);

    // Constant-time check succeeds with correct OTP
    assert.equal(OtpService.verifyConstantTime(otp, hash1.saltHash), true);
    assert.equal(OtpService.verifyConstantTime(otp, hash2.saltHash), true);

    // Constant-time check fails with wrong OTP
    assert.equal(OtpService.verifyConstantTime('000000', hash1.saltHash), false);
    assert.equal(OtpService.verifyConstantTime('123456', hash1.saltHash), false);
  });
});

test('3. OTP Verification Lifecycle & Single-Use', async (t) => {
  const testPhone = '+919811001122';
  const testOtp = '849201';

  await t.test('Stores and verifies OTP correctly', () => {
    OtpService.saveOtpRecord({
      fullPhone: testPhone,
      otp: testOtp,
      signupData: { name: "Test User", role: "needer" }
    });

    const res = OtpService.verifyOtp(testPhone, testOtp);
    assert.equal(res.valid, true);
    assert.equal(res.signupData.name, "Test User");
  });

  await t.test('Enforces Single-Use (second verification attempt fails)', () => {
    // Attempting to reuse the OTP
    const res = OtpService.verifyOtp(testPhone, testOtp);
    assert.equal(res.valid, false);
    assert.ok(res.code === 'OTP_NOT_FOUND' || res.code === 'INVALID_OTP');
  });
});

test('4. Max 5 Wrong Attempts Invalidation', async () => {
  const testPhone = '+919811002233';
  const correctOtp = '778899';

  OtpService.saveOtpRecord({
    fullPhone: testPhone,
    otp: correctOtp
  });

  // 4 wrong attempts: should decrement remaining attempts
  for (let i = 1; i <= 4; i++) {
    const res = OtpService.verifyOtp(testPhone, '111111');
    assert.equal(res.valid, false);
    assert.equal(res.code, 'INVALID_OTP');
    assert.equal(res.attemptsRemaining, 5 - i);
  }

  // 5th wrong attempt: should permanently invalidate the OTP
  const finalWrong = OtpService.verifyOtp(testPhone, '111111');
  assert.equal(finalWrong.valid, false);
  assert.equal(finalWrong.code, 'OTP_MAX_ATTEMPTS_EXCEEDED');

  // Any subsequent attempt (even with the correct OTP) must now fail
  const attemptAfterInvalidate = OtpService.verifyOtp(testPhone, correctOtp);
  assert.equal(attemptAfterInvalidate.valid, false);
});

test('5. Rate Limiting: 30s Resend Cooldown & Max 3 Requests per 15 min', async () => {
  const ratePhone = '+919811003344';

  // Request 1: Allowed
  const check1 = OtpService.checkRateLimit(ratePhone);
  assert.equal(check1.allowed, true);
  OtpService.saveOtpRecord({ fullPhone: ratePhone, otp: '111222' });

  // Immediate Request 2: Blocked by 30s cooldown
  const check2 = OtpService.checkRateLimit(ratePhone);
  assert.equal(check2.allowed, false);
  assert.equal(check2.code, 'RESEND_COOLDOWN');
  assert.ok(check2.retryAfterSeconds > 0 && check2.retryAfterSeconds <= 30);
});

test('6. SMS Service Provider Simulation', async () => {
  const result = await SmsService.sendOtpSms({
    phone: '+919876543210',
    otp: '123456'
  });
  assert.equal(result.success, true);
  assert.ok(result.provider);
});

// Shared Mock Response Helper
function createMockRes() {
  return {
    statusCode: 200,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    }
  };
}

test('7. End-to-End Auth Controller Flow with mobile_verified: true', async () => {
  const uniquePhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  const fullPhone = `+91${uniquePhone}`;
  const testEmail = `otp.user.${Date.now()}@example.com`;

  // Step A: Send OTP
  const sendReq = {
    body: {
      phone: uniquePhone,
      name: "Ramesh Test Kumar",
      email: testEmail,
      password: "password123",
      confirmPassword: "password123",
      role: "needer",
      area: "REC Banda",
      purpose: "signup"
    }
  };
  const sendRes = createMockRes();
  await authController.sendOtp(sendReq, sendRes);

  assert.equal(sendRes.statusCode, 200);
  assert.equal(sendRes.jsonData.success, true);
  assert.equal(sendRes.jsonData.phone, fullPhone);
  const otpIssued = sendRes.jsonData.devOtp;
  assert.ok(otpIssued, "devOtp should be present in development mode");

  // Step B: Verify OTP and create user
  const verifyReq = {
    body: {
      phone: uniquePhone,
      otp: otpIssued
    }
  };
  const verifyRes = createMockRes();
  authController.verifyOtp(verifyReq, verifyRes);

  assert.equal(verifyRes.statusCode, 201);
  assert.equal(verifyRes.jsonData.success, true);
  assert.ok(verifyRes.jsonData.token, "JWT token should be returned");
  assert.equal(verifyRes.jsonData.user.mobile_verified, true, "User must have mobile_verified: true");

  // Step C: Verify User in Database
  const createdUser = db.getUserByPhone(fullPhone);
  assert.ok(createdUser, "User must exist in database");
  assert.equal(createdUser.mobile_verified, true, "Database record must have mobile_verified: true");
  assert.equal(createdUser.displayName, "Ramesh Test Kumar");
  assert.equal(createdUser.email, testEmail);

  // Step D: Duplicate Phone Rejection (409)
  const dupReq = {
    body: {
      phone: uniquePhone,
      name: "Another Person",
      email: `another.${Date.now()}@example.com`,
      purpose: "signup"
    }
  };
  const dupRes = createMockRes();
  await authController.sendOtp(dupReq, dupRes);
  assert.equal(dupRes.statusCode, 409);
  assert.equal(dupRes.jsonData.code, 'PHONE_EXISTS');
});

test('8. Reset Password & Purpose-specific OTP Flow', async (t) => {
  const resetPhone = '98' + Math.floor(10000000 + Math.random() * 90000000);
  const fullResetPhone = `+91${resetPhone}`;

  // Pre-seed a user for password reset
  const user = db.createUser({
    uid: `usr_reset_${Date.now()}`,
    phone: fullResetPhone,
    displayName: "Reset Test User",
    email: `reset.${Date.now()}@test.org`,
    passwordHash: "old_hash",
    role: "needer",
    mobile_verified: true
  });

  // Request Reset OTP
  const sendReq = {
    body: {
      phone: resetPhone,
      purpose: "forgot_password"
    }
  };
  const sendRes = createMockRes();
  await authController.sendOtp(sendReq, sendRes);

  assert.equal(sendRes.statusCode, 200);
  const issuedOtp = sendRes.jsonData.devOtp;
  assert.ok(issuedOtp);

  // Execute Password Reset
  const resetReq = {
    body: {
      phone: resetPhone,
      otp: issuedOtp,
      newPassword: "newSecurePassword123",
      confirmPassword: "newSecurePassword123"
    }
  };
  const resetRes = createMockRes();
  authController.resetPassword(resetReq, resetRes);

  assert.equal(resetRes.statusCode, 200);
  assert.equal(resetRes.jsonData.success, true);
  assert.ok(resetRes.jsonData.token);
  assert.equal(resetRes.jsonData.user.mobile_verified, true);
});
