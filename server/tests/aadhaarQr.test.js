/**
 * Unit Test: mAadhaar Secure QR Digital Signature Verification & Privacy Guarantee
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { aadhaarVerificationService } from '../modules/aadhaar/aadhaarVerificationService.js';
import { aadhaarController } from '../controllers/aadhaarController.js';
import { borrowController } from '../controllers/borrowController.js';
import { db } from '../config/store.js';

test('mAadhaar Secure QR Verification & Digital Signature Specification', async (t) => {
  await t.test('Verifies authentic signed UIDAI Secure QR and extracts ONLY name, dob, gender, and last4', async () => {
    const validQr = aadhaarVerificationService.createSampleSecureQr({
      name: "Aarav Kumar",
      dob: "15-08-1995",
      gender: "M",
      last4: "9842",
      tampered: false
    });

    const result = await aadhaarVerificationService.verify(validQr);

    assert.equal(result.verified, true);
    assert.equal(result.name, "Aarav Kumar");
    assert.equal(result.dob, "15-08-1995");
    assert.equal(result.gender, "M");
    assert.equal(result.last4, "9842");

    // Strict privacy rule: NEVER contain full 12 digits or raw QR payload
    assert.equal(result.fullAadhaar, undefined);
    assert.equal(result.rawQrData, undefined);
    assert.equal(result.uid, undefined);
  });

  await t.test('Verifies authentic binary compressed GZIP UIDAI Secure QR V2', async () => {
    const binaryQr = aadhaarVerificationService.createSampleBinarySecureQr({
      name: "Priya Verma",
      dob: "20-04-1992",
      gender: "F",
      last4: "7654",
      tampered: false
    });

    const result = await aadhaarVerificationService.verify(binaryQr);

    assert.equal(result.verified, true);
    assert.equal(result.name, "Priya Verma");
    assert.equal(result.last4, "7654");
  });

  await t.test('Rejects tampered or forged QR code where payload was altered after signing', async () => {
    const tamperedQr = aadhaarVerificationService.createSampleSecureQr({
      name: "Legit User",
      dob: "01-01-1990",
      gender: "M",
      last4: "1111",
      tampered: true
    });

    await assert.rejects(
      async () => {
        await aadhaarVerificationService.verify(tamperedQr);
      },
      /डिजिटल हस्ताक्षर अमान्य या छेड़छाड़ किया गया है|Cryptographic signature mismatch|tampered/i
    );
  });

  await t.test('Rejects invalid, random, or generic non-Aadhaar QR codes', async () => {
    const randomUrlQr = "https://example.com/some/random/link";

    await assert.rejects(
      async () => {
        await aadhaarVerificationService.verify(randomUrlQr);
      },
      /अमान्य QR कोड|not a recognized UIDAI/i
    );
  });
});

test('Aadhaar Controller & Permission Enforcement: Unverified Users Cannot Give or Take Items', async (t) => {
  const mockRes = () => {
    const res = {
      statusCode: 200,
      jsonData: null,
      status(code) { this.statusCode = code; return this; },
      json(data) { this.jsonData = data; return this; }
    };
    return res;
  };

  const testUid = `usr_test_aadhaar_${Date.now()}`;
  const testUser = db.createUser({
    uid: testUid,
    displayName: "Anil Verma",
    phone: `+919811${Math.floor(100000 + Math.random() * 900000)}`,
    email: `anil_${Date.now()}@test.com`,
    role: "needer",
    kycLevel: "level_1",
    kycStatus: "basic_verified",
    aadhaarVerification: null // Not yet verified!
  });

  await t.test('Unverified user is BLOCKED from giving/lending items', () => {
    const res = mockRes();
    borrowController.createItem({
      user: testUser,
      body: { name: "Study Books", category: "Education" }
    }, res);

    assert.equal(res.statusCode, 403);
    assert.equal(res.jsonData.code, "AADHAAR_VERIFICATION_REQUIRED");
  });

  await t.test('Unverified user is BLOCKED from taking/borrowing items', () => {
    const res = mockRes();
    borrowController.generateHandoverToken({
      user: testUser,
      body: { itemId: "itm_501" }
    }, res);

    assert.equal(res.statusCode, 403);
    assert.equal(res.jsonData.code, "AADHAAR_VERIFICATION_REQUIRED");
  });

  await t.test('verifyQr successfully marks user as verified and stores ONLY name and last 4 digits', async () => {
    const validQr = aadhaarVerificationService.createSampleSecureQr({
      name: "Anil Verma",
      dob: "10-10-1998",
      gender: "M",
      last4: "3344"
    });

    const res = mockRes();
    await aadhaarController.verifyQr({
      user: testUser,
      body: { qrData: validQr }
    }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonData.success, true);
    assert.equal(res.jsonData.verified, true);
    assert.equal(res.jsonData.name, "Anil Verma");
    assert.equal(res.jsonData.last4, "3344");

    // Check user in database
    const refreshedUser = db.getUserByUid(testUid);
    assert.equal(refreshedUser.aadhaarVerification.verified, true);
    assert.equal(refreshedUser.aadhaarVerification.name, "Anil Verma");
    assert.equal(refreshedUser.aadhaarVerification.last4, "3344");
    assert.equal(refreshedUser.aadhaarVerification.fullAadhaar, undefined, "Full Aadhaar MUST NEVER be stored");
  });

  await t.test('Verified user is now PERMITTED to give/lend items', () => {
    const verifiedUser = db.getUserByUid(testUid);
    const res = mockRes();
    borrowController.createItem({
      user: verifiedUser,
      body: { name: "Study Books", category: "Education", loanPeriodDays: 14 }
    }, res);

    assert.equal(res.statusCode, 201);
    assert.equal(res.jsonData.success, true);
    assert.equal(res.jsonData.item.name, "Study Books");
  });

  await t.test('Verified user is now PERMITTED to take/borrow items', () => {
    const verifiedUser = db.getUserByUid(testUid);
    const res = mockRes();
    borrowController.generateHandoverToken({
      user: verifiedUser,
      body: { itemId: "itm_501" }
    }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonData.success, true);
    assert.ok(res.jsonData.token);
  });
});
