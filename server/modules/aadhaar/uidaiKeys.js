/**
 * ZarooratSetu - UIDAI Key Manager Module
 * Manages UIDAI RSA-2048 public certificate and demo issuing keypair
 * Pluggable architecture: easily swapped with production UIDAI certificates
 */

import crypto from 'crypto';

// Generate or persist a deterministic RSA-2048 keypair for UIDAI Secure QR verification
// In production, the public certificate is downloaded directly from uidai.gov.in
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

export const UIDAI_KEYS = {
  publicKey,
  privateKey,
  algorithm: 'SHA256',
  issuer: 'UIDAI - Unique Identification Authority of India',
  certSerial: 'UIDAI-PILOT-2026-BANDA'
};
