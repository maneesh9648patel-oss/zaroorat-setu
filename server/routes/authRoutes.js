/**
 * ZarooratSetu - Auth Routes
 */

import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { otpRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public auth endpoints
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/send-otp', otpRateLimiter, authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/switch-demo-user', authController.switchDemoUser);

// Authenticated auth & KYC endpoints
router.post('/verify-email', authenticate, authController.verifyEmail);
router.post('/profile', authenticate, authController.updateProfile);
router.post('/kyc-tier2-upload', authenticate, authController.uploadIdPlaceholder);
router.get('/me', authenticate, authController.getMe);

export default router;
