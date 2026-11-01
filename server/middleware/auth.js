/**
 * ZarooratSetu - Auth Middleware
 * Validates bearer token or session header and attaches user to req.user
 */

import { db } from '../config/store.js';

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

  // In mock/demo mode, token is user's UID or prefixed mock token e.g. "tok_usr_aarav" or "usr_aarav"
  const uid = token.startsWith('tok_') ? token.replace('tok_', '') : token;
  const user = db.getUserByUid(uid);

  if (!user) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired session token",
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
  const uid = token.startsWith('tok_') ? token.replace('tok_', '') : token;
  const user = db.getUserByUid(uid);
  req.user = user || null;
  next();
}
