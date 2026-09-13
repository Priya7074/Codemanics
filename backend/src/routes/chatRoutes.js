import express from 'express';
import multer from 'multer';
import {
  createChatSession,
  sendMessage,
  getConversationHistory,
  deleteChatSession,
  getSessionInfo,
} from '../controllers/chatController.js';
import { transcribeAudio } from '../controllers/transcriptionController.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
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

// Chat session management
router.post('/sessions', createChatSession);
router.get('/sessions/:sessionId', getSessionInfo);
router.delete('/sessions/:sessionId', deleteChatSession);

// Message handling
router.post('/message', sendMessage);
router.post('/transcribe', upload.single('audio'), transcribeAudio);
router.get('/history/:sessionId', getConversationHistory);

export default router;
