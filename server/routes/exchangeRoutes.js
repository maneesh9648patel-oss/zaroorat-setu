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
router.post('/return', authenticate, exchangeController.returnItem);
router.get('/history', authenticate, exchangeController.getMyHistory);

// Admin & Stock Dashboard operations
router.get('/dashboard', authenticate, exchangeController.getStockDashboard);
router.get('/records', authenticate, exchangeController.getAllRecords);
router.get('/export-csv', authenticate, exchangeController.exportCsv);

export default router;
