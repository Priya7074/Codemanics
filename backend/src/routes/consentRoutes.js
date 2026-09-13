import express from 'express';
import {
  createConsent,
  getConsent,
} from '../controllers/consentController.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.post('/', validate('consent'), createConsent);
router.get('/:sessionId', getConsent);

export default router;
