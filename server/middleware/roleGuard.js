/**
 * ZarooratSetu - Role & Tiered KYC Guards
 */

import { KYC_TIERS } from '../config/constants.js';

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        code: "UNAUTHORIZED"
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`,
        code: "FORBIDDEN_ROLE",
        currentRole: req.user.role
      });
    }

    next();
  };
}

/**
 * Enforces tiered KYC levels:
 * Level 1: Phone + Email OTP (Basic verified - can post basic requests)
 * Level 2: Additional ID check (Required for lending/donating)
 * Level 3: Verified NGO (Required for organizational lending)
 */
export function requireKycLevel(minLevel) {
  const levelRanks = {
    [KYC_TIERS.NONE]: 0,
    [KYC_TIERS.LEVEL_1]: 1,
    [KYC_TIERS.LEVEL_2]: 2,
    [KYC_TIERS.LEVEL_3]: 3
  };

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        code: "UNAUTHORIZED"
      });
    }

    const userRank = levelRanks[req.user.kycLevel] || 0;
    const requiredRank = levelRanks[minLevel] || 1;

    if (userRank < requiredRank) {
      return res.status(403).json({
        success: false,
        error: `Insufficient verification tier. Action requires KYC ${minLevel} (Current: ${req.user.kycLevel})`,
        code: "INSUFFICIENT_KYC",
        currentLevel: req.user.kycLevel,
        requiredLevel: minLevel
      });
    }

    next();
  };
}
