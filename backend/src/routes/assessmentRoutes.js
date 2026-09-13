import express from 'express';
import multer from 'multer';
import {
  createTextAssessment,
  createAudioAssessment,
  getAssessment,
  getAssessmentsBySession,
  getAssessmentTrend,
  getRiskByAssessment,
  getRecommendationsByAssessment,
} from '../controllers/assessmentController.js';
import { validate, validateParams } from '../middleware/validation.js';

const router = express.Router();

// Configure multer for audio file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio file type'), false);
    }
  },
});

router.post('/text', validate('textAssessment'), createTextAssessment);
router.post('/audio', upload.single('audio'), validate('audioAssessment'), createAudioAssessment);
router.get('/:id', validateParams('id'), getAssessment);
router.get('/session/:sessionId', validateParams('sessionId'), getAssessmentsBySession);
router.get('/session/:sessionId/trend', validateParams('sessionId'), getAssessmentTrend);
router.get('/risk/:assessmentId', validateParams('assessmentId'), getRiskByAssessment);
router.get('/recommendations/:assessmentId', validateParams('assessmentId'), getRecommendationsByAssessment);

export default router;
