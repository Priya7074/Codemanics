import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supported audio formats
const SUPPORTED_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const validateAudioFile = (file) => {
  if (!file) {
    throw new Error('No audio file provided');
  }
  
  if (!SUPPORTED_FORMATS.includes(file.mimetype)) {
    throw new Error(`Unsupported audio format. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`);
  }
  
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Audio file size exceeds 10MB limit');
  }
  
  return true;
};

export const createTempAudioPath = (filename) => {
  const tempDir = path.join(__dirname, '../../temp/audio');
  
  // Create temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  return path.join(tempDir, filename);
};

export const cleanupTempFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up temporary file: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error cleaning up temporary file ${filePath}:`, error);
  }
};

export const cleanupOldTempFiles = () => {
  const tempDir = path.join(__dirname, '../../temp/audio');
  
  try {
    if (!fs.existsSync(tempDir)) {
      return;
    }
    
    const files = fs.readdirSync(tempDir);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtimeMs > maxAge) {
        cleanupTempFile(filePath);
      }
    });
  } catch (error) {
    console.error('Error cleaning up old temp files:', error);
  }
};

// Clean up old temp files on startup
cleanupOldTempFiles();

// Schedule cleanup every hour
setInterval(cleanupOldTempFiles, 60 * 60 * 1000);
