/**
 * ZarooratSetu - AI Routes
 */

import { Router } from 'express';
import { aiController } from '../controllers/aiController.js';

const router = Router();

router.post('/priority-score', aiController.scorePriority);
router.post('/voice-extract', aiController.extractVoice);
router.post('/chat', aiController.chat);

export default router;
