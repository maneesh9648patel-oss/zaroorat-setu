/**
 * ZarooratSetu - Auth Middleware
 * Validates bearer token or session header and attaches user to req.user
 * Supports signed JWT session tokens and legacy demo tokens
 */

import { db } from '../config/store.js';
import { verifyToken } from '../utils/security.js';

function extractUserFromToken(token) {
  if (!token) return null;

  // 1. Check if token is a signed JWT
  const decoded = verifyToken(token);
  if (decoded && decoded.uid) {
    return db.getUserByUid(decoded.uid);
  }

  // 2. Fallback check for legacy mock tokens (tok_<uid> or raw uid)
  const uid = token.startsWith('tok_') ? token.replace('tok_', '') : token;
  return db.getUserByUid(uid);
}

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
      code: "AUTH_REQUIRED"
    });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const user = extractUserFromToken(token);

  if (!user) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired session token. Please log in again.",
      code: "INVALID_TOKEN"
    });
  }

  req.user = user;
  next();
}

/**
 * Optional authentication: attaches user if token is provided, does not fail if anonymous
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    req.user = null;
    return next();
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const user = extractUserFromToken(token);
  req.user = user || null;
  next();
}
