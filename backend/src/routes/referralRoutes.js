import express from 'express';
import {
  createReferral,
  getReferralsBySession,
  getReferral,
  updateReferral,
  acceptReferral,
  completeReferral,
} from '../controllers/referralController.js';
import { validate, validateParams } from '../middleware/validation.js';

const router = express.Router();

router.post('/', validate('createReferral'), createReferral);
router.get('/session/:sessionId', validateParams('sessionId'), getReferralsBySession);
router.get('/:id', validateParams('id'), getReferral);
router.put('/:id', validateParams('id'), updateReferral);
router.patch('/:id/accept', validateParams('id'), acceptReferral);
router.patch('/:id/complete', validateParams('id'), completeReferral);

export default router;
