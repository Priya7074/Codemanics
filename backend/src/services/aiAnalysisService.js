import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// AI/NLP Analysis Service
// This service provides text and audio analysis for stress and trauma assessment
// It includes a demo/fallback implementation when no API key is available

class AIAnalysisService {
  constructor() {
    this.refreshConfig();
  }

  refreshConfig() {
    this.provider = (process.env.AI_PROVIDER || 'demo').toLowerCase();
    this.apiKey = process.env.OPENAI_API_KEY?.trim() || '';
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    this.openai = null;

    if (this.provider === 'openai' && this.apiKey) {
      this.openai = new OpenAI({ apiKey: this.apiKey });
    }
  }

  /**
   * Analyze text for emotional indicators
   * @param {string} text - The text to analyze
   * @param {string} language - The language of the text (default: 'en')
   * @returns {Promise<Object>} Analysis results with indicators
   */
  async analyzeText(text, language = 'en') {
    this.refreshConfig();

    if (this.provider === 'demo' || !this.apiKey) {
      return this.demoTextAnalysis(text);
    }
    
    // Real AI provider integration would go here
    // For now, using demo implementation
    return this.demoTextAnalysis(text);
  }

  /**
   * Demo text analysis (fallback when no API key is available)
   * This is a clearly labelled DEMO implementation
   * @param {string} text - The text to analyze
   * @returns {Promise<Object>} Demo analysis results
   */
  async demoTextAnalysis(text) {
    // This is a DEMO implementation for demonstration purposes
    // In production, this would be replaced with actual AI/NLP API calls

    const lowerText = text.toLowerCase();
    const textLength = text.length;

    // Enhanced keyword-based analysis with more variation (DEMO ONLY)
    const fearKeywords = ['afraid', 'scared', 'fear', 'threat', 'dangerous', 'terrified', 'panic', 'frightened'];
    const anxietyKeywords = ['anxious', 'worried', 'nervous', 'stress', 'overwhelmed', 'tense', 'panic', 'uneasy'];
    const traumaKeywords = ['trauma', 'abuse', 'violence', 'attack', 'hurt', 'pain', 'nightmare', 'assault'];
    const isolationKeywords = ['alone', 'lonely', 'isolated', 'no one', 'nobody', 'abandoned', 'isolated'];
    const distressKeywords = ['distress', 'suffering', 'pain', 'hurt', 'upset', 'crying', 'suffer', 'agony'];

    // Initialize with base scores that will create more variation
    let fearScore = 25;
    let anxietyScore = 25;
    let traumaScore = 20;
    let isolationScore = 25;
    let distressScore = 25;

    // Count keyword occurrences for more nuanced scoring
    fearKeywords.forEach(keyword => {
      const count = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
      fearScore += count * 30;
    });

    anxietyKeywords.forEach(keyword => {
      const count = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
      anxietyScore += count * 30;
    });

    traumaKeywords.forEach(keyword => {
      const count = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
      traumaScore += count * 35;
    });

    isolationKeywords.forEach(keyword => {
      const count = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
      isolationScore += count * 30;
    });

    distressKeywords.forEach(keyword => {
      const count = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
      distressScore += count * 30;
    });

    // Add context-based variations
    if (lowerText.includes('help') || lowerText.includes('support')) {
      distressScore += 25;
      anxietyScore += 20;
    }

    if (lowerText.includes('can\'t') || lowerText.includes('cannot') || lowerText.includes('unable')) {
      distressScore += 30;
      anxietyScore += 25;
    }

    if (lowerText.includes('incident') || lowerText.includes('report') || lowerText.includes('happened')) {
      traumaScore += 35;
      fearScore += 25;
    }

    // Check for positive indicators to reduce scores
    const positiveIndicators = ['fine', 'okay', 'good', 'better', 'happy', 'calm', 'safe', 'relief', 'great', 'well'];
    let positiveScore = 0;
    positiveIndicators.forEach(indicator => {
      if (lowerText.includes(indicator)) positiveScore += 20;
    });

    // Apply positive score reduction
    if (positiveScore > 0) {
      fearScore = Math.max(10, fearScore - positiveScore * 0.7);
      anxietyScore = Math.max(10, anxietyScore - positiveScore * 0.7);
      distressScore = Math.max(10, distressScore - positiveScore * 0.7);
      traumaScore = Math.max(10, traumaScore - positiveScore * 0.5);
    }

    // Normalize scores to 0-100
    fearScore = Math.min(100, Math.max(10, fearScore));
    anxietyScore = Math.min(100, Math.max(10, anxietyScore));
    traumaScore = Math.min(100, Math.max(10, traumaScore));
    isolationScore = Math.min(100, Math.max(10, isolationScore));
    distressScore = Math.min(100, Math.max(10, distressScore));

    // Calculate sentiment (simple approach)
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'angry', 'sad', 'depressed'];
    const positiveWords = ['good', 'better', 'happy', 'hope', 'calm', 'peace', 'safe', 'fine', 'okay', 'great'];

    let negativeCount = 0;
    let positiveCount = 0;

    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeCount++;
    });

    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveCount++;
    });

    // Base sentiment on the distress level and word analysis
    let sentiment = 50 - (distressScore * 0.4);
    sentiment += (positiveCount * 15) - (negativeCount * 15);
    const normalizedSentiment = Math.max(0, Math.min(100, sentiment));

    // Calculate emotional state
    const emotionalState = (anxietyScore + fearScore + distressScore) / 3;

    // Calculate threat/vulnerability
    const threatVulnerability = (fearScore + traumaScore) / 2;

    return {
      sentiment: Math.round(normalizedSentiment),
      emotionalState: Math.round(emotionalState),
      distress: Math.round(distressScore),
      fear: Math.round(fearScore),
      anxiety: Math.round(anxietyScore),
      trauma: Math.round(traumaScore),
      threatVulnerability: Math.round(threatVulnerability),
      socialIsolation: Math.round(isolationScore),
      confidence: 65, // Lower confidence for demo implementation
      provider: 'demo',
      disclaimer: 'This is a demo implementation. In production, replace with actual AI/NLP API.',
    };
  }

  /**
   * Analyze audio for emotional indicators
   * @param {string} audioPath - Path to the audio file
   * @param {string} language - The language of the audio (default: 'en')
   * @returns {Promise<Object>} Analysis results with speech features
   */
  async analyzeAudio(audioPath, language = 'en') {
    this.refreshConfig();

    if (this.provider === 'demo' || !this.apiKey) {
      return this.demoAudioAnalysis();
    }
    
    // Real AI provider integration would go here
    return this.demoAudioAnalysis();
  }

  /**
   * Demo audio analysis (fallback when no API key is available)
   * This is a clearly labelled DEMO implementation
   * @returns {Promise<Object>} Demo audio analysis results
   */
  async demoAudioAnalysis() {
    // This is a DEMO implementation for demonstration purposes
    // In production, this would be replaced with actual speech-to-text and audio analysis APIs
    
    return {
      speechRate: 120, // words per minute (demo value)
      pauses: 8, // number of pauses (demo value)
      hesitation: 15, // hesitation score (demo value)
      pitchVariation: 45, // pitch variation score (demo value)
      emotionalIntensity: 55, // emotional intensity score (demo value)
      transcript: null, // Would contain speech-to-text result in production
      confidence: 50, // Lower confidence for demo implementation
      provider: 'demo',
      disclaimer: 'This is a demo implementation. In production, replace with actual audio analysis API.',
    };
  }

  /**
   * Convert speech to text (abstraction layer)
   * @param {string} audioPath - Path to the audio file
   * @param {string} language - The language of the audio (default: 'en')
   * @returns {Promise<string>} Transcribed text
   */
  async speechToText(audioBuffer, fileName = 'audio.webm', mimeType = 'audio/webm', language = 'en') {
    this.refreshConfig();

    if (this.provider === 'demo' || !this.openai) {
      throw new Error('Speech-to-text requires AI API key. Demo mode does not support audio transcription.');
    }

    const audioFile = typeof File !== 'undefined'
      ? new File([audioBuffer], fileName || 'audio.webm', { type: mimeType || 'audio/webm' })
      : new Blob([audioBuffer], { type: mimeType || 'audio/webm' });

    const response = await this.openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: language || 'en',
      response_format: 'json',
    });

    return response.text || '';
  }

  /**
   * Extract speech features from audio (abstraction layer)
   * @param {string} audioPath - Path to the audio file
   * @returns {Promise<Object>} Speech features
   */
  async extractSpeechFeatures(audioPath) {
    if (this.provider === 'demo' || !this.apiKey) {
      return this.demoAudioAnalysis();
    }
    
    // Real audio analysis API integration would go here
    // e.g., audio processing libraries, cloud-based audio analysis services
    
    throw new Error('Speech feature extraction not implemented in demo mode');
  }

  /**
   * Analyze emotion from audio (abstraction layer)
   * @param {string} audioPath - Path to the audio file
   * @returns {Promise<Object>} Emotion analysis results
   */
  async analyzeEmotion(audioPath) {
    if (this.provider === 'demo' || !this.apiKey) {
      return {
        primaryEmotion: 'neutral',
        emotionScores: {
          neutral: 0.6,
          sad: 0.2,
          anxious: 0.1,
          angry: 0.05,
          fearful: 0.05,
        },
        confidence: 50,
        provider: 'demo',
      };
    }
    
    // Real emotion recognition API integration would go here
    // e.g., audio-based emotion recognition services
    
    throw new Error('Emotion analysis not implemented in demo mode');
  }
}

export default new AIAnalysisService();
