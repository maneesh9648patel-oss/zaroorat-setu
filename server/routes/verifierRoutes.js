/**
 * ZarooratSetu - Human Verifier Routes
 */

import { Router } from 'express';
import { verifierController } from '../controllers/verifierController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { USER_ROLES } from '../config/constants.js';

const router = Router();

// Only Verifiers and Admins can access review queue and make decisions
router.get('/queue', authenticate, requireRole(USER_ROLES.VERIFIER, USER_ROLES.ADMIN), verifierController.getQueue);
router.post('/action', authenticate, requireRole(USER_ROLES.VERIFIER, USER_ROLES.ADMIN), verifierController.takeAction);
router.get('/audit', authenticate, requireRole(USER_ROLES.VERIFIER, USER_ROLES.ADMIN), verifierController.getAuditLogs);

export default router;
