/**
 * ZarooratSetu - Offline / Webhook Routes
 */

import { Router } from 'express';
import { offlineController } from '../controllers/offlineController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Webhook endpoints for telecom carriers / simulators
router.post('/webhook/missed-call', offlineController.handleMissedCall);
router.post('/webhook/sms', offlineController.handleIncomingSms);

// Volunteer-assisted portal
router.get('/pending', offlineController.getPendingQueue);
router.post('/volunteer-submit', optionalAuth, offlineController.volunteerSubmit);

export default router;
