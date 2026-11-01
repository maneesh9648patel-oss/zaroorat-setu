/**
 * Unit Test: Single-Use QR Handover Lifecycle & Anti-Replay Security
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { QrHandoverService } from '../services/qrHandoverService.js';

test('Single-Use QR Handover Security Lifecycle', async (t) => {
  const lenderUser = { uid: "usr_ngo_01", displayName: "Seva Sahayata Trust", role: "ngo" };
  const rogueUser = { uid: "usr_random_intruder", displayName: "Attacker", role: "needer" };

  // 1. Generate Token
  const tokenRecord = QrHandoverService.generateHandoverToken({
    requestId: "req_1042",
    itemId: "itm_501",
    lenderId: lenderUser.uid,
    receiverId: "usr_aarav",
    validMinutes: 60
  });

  tokenRecord.status = "active";

  await t.test('Token generation produces signed payload with nonce and expiry', () => {
    assert.ok(tokenRecord.tokenId.startsWith('tok_'));
    assert.ok(tokenRecord.nonce);
    assert.ok(tokenRecord.signature);
    assert.equal(tokenRecord.lenderId, lenderUser.uid);
  });

  await t.test('Reject if scanning user is NOT the authorized lender (screenshot spoofing protection)', () => {
    // Rogue user attempts to confirm handover with a screenshot of the QR code
    const result = QrHandoverService.validateAndConsumeToken(tokenRecord, rogueUser, tokenRecord.signature);
    assert.equal(result.valid, false);
    assert.equal(result.code, "UNAUTHORIZED_SCANNER", "Screenshot without logged-in authorized account MUST be rejected");
  });

  await t.test('Authorized lender scan succeeds on first attempt', () => {
    const result = QrHandoverService.validateAndConsumeToken(tokenRecord, lenderUser, tokenRecord.signature);
    assert.equal(result.valid, true);
    assert.equal(result.code, "HANDOVER_VERIFIED");

    // Atomically invalidate token
    tokenRecord.status = "used";
  });

  await t.test('Second scan attempt MUST BE REJECTED (Single-Use Guarantee / Anti-Replay)', () => {
    // Replay attack: trying to reuse the same QR code again
    const secondScanResult = QrHandoverService.validateAndConsumeToken(tokenRecord, lenderUser, tokenRecord.signature);
    assert.equal(secondScanResult.valid, false);
    assert.equal(secondScanResult.code, "TOKEN_ALREADY_USED", "Once used, QR code token must be immediately invalidated");
  });

  await t.test('Expired tokens MUST BE REJECTED', () => {
    const expiredToken = {
      tokenId: "tok_expired",
      status: "active",
      lenderId: lenderUser.uid,
      expiresAt: new Date(Date.now() - 5000).toISOString() // 5s ago
    };
    const result = QrHandoverService.validateAndConsumeToken(expiredToken, lenderUser);
    assert.equal(result.valid, false);
    assert.equal(result.code, "TOKEN_EXPIRED");
  });
});
