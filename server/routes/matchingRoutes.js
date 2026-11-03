/**
 * ZarooratSetu - Advanced AI-Based Smart Matching Routes
 */

import { Router } from 'express';
import { matchingController } from '../controllers/matchingController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();

// 1. AI Smart Matches for specific request ID
router.get('/smart/:requestId', optionalAuth, matchingController.getSmartMatches);

// 2. Interactive Need Match Discovery (Custom / On-the-fly)
router.post('/find', optionalAuth, matchingController.findCustomMatches);

// 3. Dispatch Assistance Request to Matched Donor
router.post('/send-request', authenticate, matchingController.sendAssistanceRequest);

// 4. Donor Response (Accept / Decline)
router.post('/respond', authenticate, matchingController.respondMatchRequest);

// 5. Smart Notifications
router.get('/notifications', authenticate, matchingController.getUserNotifications);
router.post('/notifications/:id/read', authenticate, matchingController.markNotificationRead);

// 6. Donor Willingness Preferences
router.post('/donor/willingness', authenticate, matchingController.updateDonorWillingness);

// 7. Admin Control Panel Analytics
router.get('/admin/analytics', authenticate, requireRole('admin'), matchingController.getAdminAnalytics);

// Legacy routes (Preserved for backwards compatibility)
router.get('/providers/:requestId', matchingController.findNearestProviders);
router.post('/assign', authenticate, matchingController.assignProvider);

export default router;
