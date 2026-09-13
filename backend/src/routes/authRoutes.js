import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validate('register'), register);
router.post('/login', validate('login'), login);

// Protected routes
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, validate('register'), updateProfile);
router.post('/change-password', authMiddleware, validate('login'), changePassword);

export default router;
