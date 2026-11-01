/**
 * ZarooratSetu - Request Routes
 */

import { Router } from 'express';
import { requestController } from '../controllers/requestController.js';
import { authenticate } from '../middleware/auth.js';
import { requireKycLevel } from '../middleware/roleGuard.js';
import { KYC_TIERS } from '../config/constants.js';

const router = Router();

// Public sanitized requests feed
router.get('/', requestController.getRequests);
router.get('/:id', requestController.getRequestById);

// Create need: Requires Authentication and minimum Level 1 KYC (Phone OTP)
router.post('/', authenticate, requireKycLevel(KYC_TIERS.LEVEL_1), requestController.createRequest);

export default router;
