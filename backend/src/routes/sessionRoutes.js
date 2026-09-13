import express from 'express';
import {
  createSession,
  getSession,
  updateSession,
  endSession,
} from '../controllers/sessionController.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.post('/', validate('createSession'), createSession);
router.get('/:id', getSession);
router.put('/:id', updateSession);
router.patch('/:id/end', endSession);

export default router;
