# Aawaz Backend

Backend for AI-Based Real-Time Stress and Trauma Assessment Module for NHAA (14566) and Integrated Portal.

## Overview

This backend provides a comprehensive API for stress and trauma assessment, including:

- AI/NLP-based text analysis
- Audio analysis with speech features
- Stress Vulnerability Index (SVI) calculation
- Support recommendation engine
- Referral management
- Role-based access control
- Audit logging
- Dashboard analytics

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, rate limiting
- **Validation**: Joi
- **File Upload**: Multer
- **Testing**: Jest, Supertest

## Features

### 1. Assessment System
- **Text Assessment**: Analyzes text input for emotional indicators using AI/NLP
- **Audio Assessment**: Processes audio files for speech features and emotion analysis
- **SVI Engine**: Calculates Stress Vulnerability Index (0-100) with risk classification
- **Recommendation Engine**: Generates personalized support recommendations

### 2. Session Management
- Create and manage victim sessions
- Track consent status
- Session lifecycle management

### 3. Consent Management
- Record user consent for AI assessment
- Track consent timestamps
- Support multiple consent types

### 4. Referral System
- Create referrals to professionals
- Track referral status
- Manage referral outcomes

### 5. Authentication & Authorization
- User registration and login
- JWT-based authentication
- Role-based access control (RBAC)
- Multi-factor authentication support

### 6. Dashboard Analytics
- Overview statistics
- Risk distribution analysis
- Trend analysis
- High-risk case tracking
- Recent assessments

### 7. Security Features
- Helmet for security headers
- CORS configuration
- Rate limiting
- Request validation
- Audit logging
- Secure password handling
- Temporary file cleanup

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `POST /api/auth/change-password` - Change password (protected)

### Sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get session details
- `PUT /api/sessions/:id` - Update session
- `PATCH /api/sessions/:id/end` - End session

### Consent
- `POST /api/consent` - Record consent
- `GET /api/consent/:sessionId` - Get consent records

### Assessment
- `POST /api/assessment/text` - Create text assessment (protected)
- `POST /api/assessment/audio` - Create audio assessment (protected)
- `GET /api/assessment/:id` - Get assessment by ID (protected)
- `GET /api/assessment/session/:sessionId` - Get assessments by session (protected)
- `GET /api/assessment/session/:sessionId/trend` - Get assessment trends (protected)
- `GET /api/assessment/risk/:assessmentId` - Get risk analysis (protected)
- `GET /api/assessment/recommendations/:assessmentId` - Get recommendations (protected)

### Referrals
- `POST /api/referrals` - Create referral (protected)
- `GET /api/referrals/session/:sessionId` - Get referrals by session (protected)
- `GET /api/referrals/:id` - Get referral details (protected)
- `PUT /api/referrals/:id` - Update referral (protected)
- `PATCH /api/referrals/:id/accept` - Accept referral (protected)
- `PATCH /api/referrals/:id/complete` - Complete referral (protected)

### Dashboard (Officer/Admin only)
- `GET /api/dashboard/overview` - Dashboard overview
- `GET /api/dashboard/risk-distribution` - Risk distribution statistics
- `GET /api/dashboard/trends` - Assessment trends
- `GET /api/dashboard/high-risk` - High-risk cases
- `GET /api/dashboard/recent-assessments` - Recent assessments with pagination

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration (see Environment Variables section below)

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod

   # Or using MongoDB Atlas
   # Update MONGODB_URI in .env
   ```

5. **Start the server**
   ```bash
   # Development mode with hot reload
   npm run dev

   # Production mode
   npm start
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/aawaz

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# AI/NLP Provider (optional)
AI_PROVIDER=demo
AI_API_KEY=your-ai-api-key-here
```

## Database Models

### User
- User accounts with role-based access
- Supports: victim, counsellor, medical_professional, authorized_officer, admin
- Password hashing with bcrypt
- Two-factor authentication support

### VictimSession
- Session tracking for assessments
- Consent status management
- Metadata collection (IP, user agent, location)

### Consent
- Consent records for AI assessment
- Timestamp tracking
- Multiple consent types support

### Assessment
- Text and audio assessment results
- Emotional indicators (sentiment, distress, fear, anxiety, etc.)
- SVI score and risk level
- Safety escalation flags
- Human review tracking

### AssessmentTrend
- Trend analysis over time
- Risk level history
- Assessment statistics

### SupportRecommendation
- Generated recommendations based on assessment
- Priority levels
- Service referrals
- Status tracking

### Referral
- Professional referrals
- Referral status management
- Outcome tracking
- Follow-up scheduling

### AuditLog
- Comprehensive audit logging
- Automatic cleanup (90-day retention)
- Request/response tracking

## Risk Levels

The Stress Vulnerability Index (SVI) classifies risk into four levels:

- **Low (0-24)**: Minimal stress indicators
- **Moderate (25-49)**: Moderate stress levels
- **High (50-74)**: Elevated stress, professional review recommended
- **Critical (75-100)**: Immediate safety concern, urgent escalation required

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

### Test Coverage
- Server startup and health checks
- Authentication and authorization
- Assessment creation and retrieval
- SVI calculation
- Risk classification
- Recommendation generation
- Audio validation
- Request validation
- Dashboard APIs
- Rate limiting
- CORS handling

## Security

This backend implements multiple security measures:

- **Helmet**: Security headers for HTTP responses
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Request Validation**: Joi schema validation
- **Audit Logging**: Comprehensive activity tracking
- **File Upload Restrictions**: Limited file types and sizes
- **Temporary File Cleanup**: Automatic cleanup of uploaded files

See `SECURITY.md` for detailed security practices.

## Deployment

### Production Considerations

1. **Environment Variables**: Set `NODE_ENV=production`
2. **Database**: Use a production MongoDB instance (MongoDB Atlas recommended)
3. **JWT Secret**: Use a strong, randomly generated secret
4. **CORS**: Update `FRONTEND_URL` to production frontend URL
5. **Rate Limiting**: Adjust limits based on expected traffic
6. **Monitoring**: Implement application monitoring
7. **Logging**: Use a production logging service
8. **HTTPS**: Always use HTTPS in production

### Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t aawaz-backend .
docker run -p 3000:3000 --env-file .env aawaz-backend
```

## Development

### Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   └── server.js        # Server entry point
├── tests/               # Test files
├── temp/                # Temporary files (gitignored)
├── .env.example         # Environment variables template
├── package.json         # Dependencies
└── README.md            # This file
```

### Adding New Features

1. **Create Model**: Add to `src/models/`
2. **Create Service**: Add business logic to `src/services/`
3. **Create Controller**: Add to `src/controllers/`
4. **Create Routes**: Add to `src/routes/`
5. **Add Tests**: Create test file in `tests/`
6. **Update Documentation**: Update README and API docs

## Important Notes

### AI/NLP Integration

The backend includes a **demo/fallback implementation** for AI/NLP analysis when no API key is provided. This allows the system to function for development and testing purposes.

**To integrate a real AI provider:**
1. Set `AI_PROVIDER` in `.env` to your provider name
2. Set `AI_API_KEY` to your API key
3. Update `src/services/aiAnalysisService.js` to use your provider's API

**Important**: The demo implementation uses simple keyword-based analysis and should not be used in production.

### Privacy and Data Minimization

- Raw audio files are not permanently stored
- Sensitive narratives are logged minimally
- Audit logs have automatic 90-day retention
- User consent is required before assessment
- No API keys are exposed to the frontend

### Medical Disclaimer

This system is a **screening and decision-support tool**, not a medical diagnosis system. It should not replace professional medical or psychological evaluation.

## Support

For issues or questions:
- Check the existing documentation
- Review the API endpoints
- Examine test files for usage examples
- Contact the development team

## License

This project is part of the SIH initiative. See project license for details.
