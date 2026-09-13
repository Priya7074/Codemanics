import aiAnalysisService from '../services/aiAnalysisService.js';

export const transcribeAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file provided',
        message: 'An audio file is required for transcription',
      });
    }

    const language = req.body.language || 'en';
    const transcription = await aiAnalysisService.speechToText(
      req.file.buffer,
      req.file.originalname || 'recording.webm',
      req.file.mimetype || 'audio/webm',
      language
    );

    if (!transcription || transcription.trim() === '') {
      return res.status(422).json({
        success: false,
        error: 'No speech detected',
        message: 'The uploaded audio did not contain any transcribable speech.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        text: transcription,
        provider: 'openai',
        model: 'whisper-1',
      },
    });
  } catch (error) {
    console.error('Audio transcription failed:', error);
    res.status(500).json({
      success: false,
      error: 'Audio transcription failed',
      message: error.message,
    });
  }
};
