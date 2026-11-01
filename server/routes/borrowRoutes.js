/**
 * ZarooratSetu - Borrow & Return Routes
 */

import { Router } from 'express';
import { borrowController } from '../controllers/borrowController.js';
import { authenticate } from '../middleware/auth.js';
import { requireKycLevel } from '../middleware/roleGuard.js';
import { KYC_TIERS } from '../config/constants.js';

const router = Router();

// Public item list
router.get('/items', borrowController.getItems);

// Authenticated item & handover endpoints
router.post('/items', authenticate, requireKycLevel(KYC_TIERS.LEVEL_2), borrowController.createItem);
router.post('/generate-token', authenticate, borrowController.generateHandoverToken);
router.post('/confirm-handover', authenticate, borrowController.confirmHandover);
router.post('/confirm-return', authenticate, borrowController.confirmReturn);
router.post('/dispute', authenticate, borrowController.raiseDispute);

export default router;
