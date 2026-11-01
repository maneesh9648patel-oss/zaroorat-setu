/**
 * ZarooratSetu - Matching Routes
 */

import { Router } from 'express';
import { matchingController } from '../controllers/matchingController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/providers/:requestId', matchingController.findNearestProviders);
router.post('/assign', authenticate, matchingController.assignProvider);

export default router;
