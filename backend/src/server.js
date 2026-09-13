import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { auditLogger } from './middleware/auditLogger.js';
import { requestLogger } from './middleware/requestLogger.js';
import { authMiddleware } from './middleware/auth.js';

// Import routes
import sessionRoutes from './routes/sessionRoutes.js';
import consentRoutes from './routes/consentRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import referralRoutes from './routes/referralRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(requestLogger);
app.use(auditLogger);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const { getPool } = await import('./config/database.js');
    const pool = getPool();
    await pool.query('SELECT NOW()');

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        type: 'PostgreSQL',
        connected: true,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        type: 'PostgreSQL',
        connected: false,
        error: error.message,
      },
    });
  }
});

// Public routes (no authentication required)
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/chat', chatRoutes);

// Check if demo mode is enabled
const isDemoMode = process.env.AI_PROVIDER === 'demo' && process.env.DEMO_MODE === 'true';

// Protected routes (authentication required)
// In demo mode, skip authentication for assessment routes
if (isDemoMode) {
  console.log('Demo mode: Running without authentication');
  app.use('/api/assessment', assessmentRoutes);
  app.use('/api/referrals', referralRoutes);
  app.use('/api/dashboard', dashboardRoutes);
} else {
  app.use('/api/assessment', authMiddleware, assessmentRoutes);
  app.use('/api/referrals', authMiddleware, referralRoutes);
  app.use('/api/dashboard', authMiddleware, dashboardRoutes);
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found on this server.',
  });
});

// Error handling middleware
app.use(errorHandler);

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`AI Provider: ${process.env.AI_PROVIDER || 'demo'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

const isDirectRun = process.argv[1] && process.argv[1].toLowerCase().endsWith('src/server.js');

if (isDirectRun) {
  startServer();
}

export default app;
