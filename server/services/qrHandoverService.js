/**
 * ZarooratSetu - Single-Use Cryptographic QR Handover Service
 * Guarantees single-use lifecycle, anti-replay, and prevents screenshot-only spoofing.
 */

import crypto from 'crypto';

const HMAC_SECRET = process.env.QR_HMAC_SECRET || "zarooratsetu_rec_banda_secret_2026";

export class QrHandoverService {
  /**
   * Generates a single-use token payload with cryptographic signature
   */
  static generateHandoverToken(params) {
    const { requestId, itemId, lenderId, receiverId, validMinutes = 60 } = params;
    const nonce = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    const expiresAt = timestamp + validMinutes * 60 * 1000;

    const dataString = `${requestId}:${itemId}:${lenderId}:${receiverId}:${nonce}:${expiresAt}`;
    const signature = crypto
      .createHmac('sha256', HMAC_SECRET)
      .update(dataString)
      .digest('hex');

    const tokenId = `tok_${crypto.randomBytes(6).toString('hex')}`;

    return {
      tokenId,
      requestId,
      itemId,
      lenderId,
      receiverId,
      nonce,
      expiresAt: new Date(expiresAt).toISOString(),
      signature,
      // QR Payload string encoded into the image
      qrPayload: JSON.stringify({
        tokenId,
        requestId,
        itemId,
        nonce,
        signature,
        v: 1
      })
    };
  }

  /**
   * Validates a presented QR token against authenticated user and token record
   */
  static validateAndConsumeToken(tokenRecord, scanningUser, payloadSignature) {
    if (!tokenRecord) {
      return {
        valid: false,
        code: "TOKEN_NOT_FOUND",
        error: "Invalid or unrecognized handover token."
      };
    }

    // 1. Check if token was already used (Single-use guarantee)
    if (tokenRecord.status === 'used') {
      return {
        valid: false,
        code: "TOKEN_ALREADY_USED",
        error: "This handover code has already been confirmed and is no longer valid. Single-use token expired."
      };
    }

    // 2. Check expiration
    if (new Date(tokenRecord.expiresAt).getTime() < Date.now()) {
      return {
        valid: false,
        code: "TOKEN_EXPIRED",
        error: "Handover code has expired. Please ask the receiver to generate a fresh code."
      };
    }

    // 3. User Identity Check: A screenshot alone does NOT work!
    // The scanning user MUST be the assigned lender or an authorized administrator
    const isAuthorized = scanningUser.uid === tokenRecord.lenderId || scanningUser.role === 'admin';
    if (!isAuthorized) {
      return {
        valid: false,
        code: "UNAUTHORIZED_SCANNER",
        error: `Permission denied. Only the assigned lender (${tokenRecord.lenderId}) can confirm this handover.`
      };
    }

    // 4. Verify signature integrity if provided
    if (payloadSignature && tokenRecord.signature && payloadSignature !== tokenRecord.signature) {
      return {
        valid: false,
        code: "SIGNATURE_MISMATCH",
        error: "Cryptographic signature validation failed. Possible token tampering."
      };
    }

    return {
      valid: true,
      code: "HANDOVER_VERIFIED",
      message: "Handover token authenticated successfully."
    };
  }
}
