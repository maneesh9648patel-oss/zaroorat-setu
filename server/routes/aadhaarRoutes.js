/**
 * ZarooratSetu - Aadhaar QR Routes
 */

import { Router } from 'express';
import { aadhaarController } from '../controllers/aadhaarController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All mAadhaar verification endpoints require active session authentication
router.post('/verify-qr', authenticate, aadhaarController.verifyQr);
router.get('/status', authenticate, aadhaarController.getStatus);
router.get('/sample-qrs', authenticate, aadhaarController.getSampleQrs);

export default router;
