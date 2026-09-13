import { validateAudioFile } from '../src/utils/audioHandler.js';

describe('Audio Validation Tests', () => {
  describe('validateAudioFile', () => {
    it('should validate supported audio formats', () => {
      const validFile = {
        mimetype: 'audio/mpeg',
        size: 1024 * 1024, // 1MB
      };

      expect(() => validateAudioFile(validFile)).not.toThrow();
    });

    it('should reject unsupported formats', () => {
      const invalidFile = {
        mimetype: 'video/mp4',
        size: 1024 * 1024,
      };

      expect(() => validateAudioFile(invalidFile)).toThrow('Unsupported audio format');
    });

    it('should reject files exceeding size limit', () => {
      const largeFile = {
        mimetype: 'audio/mpeg',
        size: 11 * 1024 * 1024, // 11MB
      };

      expect(() => validateAudioFile(largeFile)).toThrow('Audio file size exceeds 10MB limit');
    });

    it('should reject missing file', () => {
      expect(() => validateAudioFile(null)).toThrow('No audio file provided');
    });

    it('should accept various supported formats', () => {
      const supportedFormats = [
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/webm',
        'audio/mp4',
      ];

      supportedFormats.forEach(format => {
        const file = {
          mimetype: format,
          size: 1024 * 1024,
        };

        expect(() => validateAudioFile(file)).not.toThrow();
      });
    });
  });
});
