/**
 * ZarooratSetu - Dispute Resolution & Integrity Routes
 */

import { Router } from 'express';
import { disputeController } from '../controllers/disputeController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();

// 1. Condition Photos (Before Borrow & After Return)
router.post('/condition-photos', authenticate, disputeController.saveConditionPhotos);
router.post('/confirm-condition', authenticate, disputeController.confirmCondition);
router.get('/condition-photos/:transactionId', authenticate, disputeController.getConditionPhotos);

// 2. Digital Agreements
router.post('/agreements/generate', authenticate, disputeController.generateAgreement);
router.post('/agreements/:agreementId/sign', authenticate, disputeController.signAgreement);
router.get('/agreements/:transactionId', authenticate, disputeController.getAgreement);

// 3. Dispute Complaints & User Queries
router.post('/raise', authenticate, disputeController.raiseDispute);
router.get('/my-disputes', authenticate, disputeController.getMyDisputes);
router.post('/:id/respond', authenticate, disputeController.submitResponse);

// 4. Moderator Review & Decisions (Moderator & Admin Only)
router.get('/moderator/queue', authenticate, requireRole('moderator', 'admin'), disputeController.getModeratorQueue);
router.post('/:id/moderator-action', authenticate, requireRole('moderator', 'admin'), disputeController.moderatorAction);
router.post('/:id/decision', authenticate, requireRole('moderator', 'admin'), disputeController.issueDecision);

// 5. Appeals System
router.post('/:id/appeal', authenticate, disputeController.submitAppeal);
router.post('/:id/appeal-decision', authenticate, requireRole('moderator', 'admin'), disputeController.resolveAppeal);

// 6. Admin Role & Fraud Management (Admin Only)
router.post('/admin/assign-moderator', authenticate, requireRole('admin'), disputeController.assignModeratorRole);
router.get('/admin/users-trust', authenticate, requireRole('admin'), disputeController.getAdminUsersTrust);
router.post('/admin/unrestrict/:uid', authenticate, requireRole('admin'), disputeController.unrestrictUser);

// Single Dispute View (Protected with Role-Based Access in controller)
router.get('/:id', authenticate, disputeController.getDispute);

export default router;
