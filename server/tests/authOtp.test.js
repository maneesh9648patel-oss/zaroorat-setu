/**
 * Unit Test: Phone OTP & Tiered KYC Level 1
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { authController } from '../controllers/authController.js';
import { db } from '../config/store.js';

test('Auth OTP Flow & Tiered KYC Validation', async (t) => {
  await t.test('sendOtp should reject invalid phone numbers', () => {
    let statusCode = 200;
    let jsonResult = null;
    const res = {
      status(c) { statusCode = c; return this; },
      json(d) { jsonResult = d; return this; }
    };

    authController.sendOtp({ body: { phone: "123" } }, res);
    assert.equal(statusCode, 400);
    assert.equal(jsonResult.code, "INVALID_PHONE_LENGTH");
  });

  await t.test('sendOtp should succeed for valid 10-digit Indian phone number', () => {
    let statusCode = 200;
    let jsonResult = null;
    const res = {
      status(c) { statusCode = c; return this; },
      json(d) { jsonResult = d; return this; }
    };

    authController.sendOtp({ body: { phone: "9876543210" } }, res);
    assert.equal(statusCode, 200);
    assert.equal(jsonResult.success, true);
    assert.equal(jsonResult.demoOtp, "123456");
    assert.equal(jsonResult.phone, "+919876543210");
  });

  await t.test('verifyOtp should reject invalid OTP', () => {
    let statusCode = 200;
    let jsonResult = null;
    const res = {
      status(c) { statusCode = c; return this; },
      json(d) { jsonResult = d; return this; }
    };

    authController.verifyOtp({ body: { phone: "9876543210", otp: "000000" } }, res);
    assert.equal(statusCode, 400);
    assert.equal(jsonResult.code, "INVALID_OTP");
  });

  await t.test('verifyOtp should succeed with demo OTP 123456 and assign Basic Verified tier', () => {
    let statusCode = 200;
    let jsonResult = null;
    const res = {
      status(c) { statusCode = c; return this; },
      json(d) { jsonResult = d; return this; }
    };

    const testPhone = "9811122233";
    authController.verifyOtp({ body: { phone: testPhone, otp: "123456" } }, res);
    assert.equal(statusCode, 200);
    assert.equal(jsonResult.success, true);
    assert.equal(jsonResult.kycBadge, "Basic verified");
    assert.equal(jsonResult.user.kycLevel, "level_1");
    assert.notEqual(jsonResult.user.kycStatus, "complete_kyc", "MUST NEVER be called Complete KYC for OTP-only");
    assert.equal(jsonResult.user.kycStatus, "basic_verified");
  });

  await t.test('Public user representation MUST NOT leak full phone or address', () => {
    const rawUser = db.getUserByUid("usr_aarav");
    const sanitized = db.sanitizeUser(rawUser);

    assert.equal(sanitized.phone, undefined, "Phone number must be omitted from public profile");
    assert.ok(sanitized.publicName, "Must have public display name");
    assert.ok(sanitized.area, "Can show general area e.g. Civil Lines");
  });
});
