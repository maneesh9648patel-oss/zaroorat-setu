/**
 * ZarooratSetu - Rate Limiter for Phone OTP and Sensitive Endpoints
 */

import rateLimit from 'express-rate-limit';

// Strict rate limit for OTP generation: max 5 requests per 10 minutes per IP
export const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: "Too many OTP attempts. Please wait 10 minutes before requesting another code.",
    code: "OTP_RATE_LIMITED"
  },
  standardHeaders: true,
  legacyHeaders: false
});

// General API rate limiter: max 120 requests per minute
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: {
    success: false,
    error: "Too many requests. Please slow down.",
    code: "API_RATE_LIMITED"
  },
  standardHeaders: true,
  legacyHeaders: false
});
