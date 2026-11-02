/**
 * ZarooratSetu - Exchange & Transaction Routes
 */

import { Router } from 'express';
import { exchangeController } from '../controllers/exchangeController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public / Read items
router.get('/items', exchangeController.getItems);

// Authenticated exchange operations
router.post('/give', authenticate, exchangeController.giveItem);
router.post('/take', authenticate, exchangeController.takeItem);
router.get('/history', authenticate, exchangeController.getMyHistory);

export default router;
