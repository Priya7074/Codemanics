# Aawaz Frontend-Backend Integration Guide

## Overview

This document provides comprehensive information about the integration between the Aawaz frontend and backend systems, including architecture, data flow, API connections, and deployment instructions.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │ Components   │  │  Services    │      │
│  │              │  │              │  │              │      │
│  │ - Landing    │  │ - UI         │  │ - API Layer  │      │
│  │ - Chat       │  │ - Dashboard  │  │ - Session    │      │
│  │ - Assessment │  │ - Assessment │  │ - Assessment │      │
│  │ - Dashboard  │  │ - Referral   │  │ - Dashboard  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Controllers │  │  Services    │  │   Models     │      │
│  │              │  │              │  │              │      │
│  │ - Auth       │  │ - AI Analysis│  │ - User       │      │
│  │ - Assessment │  │ - SVI Engine │  │ - Session    │      │
│  │ - Dashboard  │  │ - Recommendation│ - Assessment │      │
│  │ - Referral   │  │ - Risk Analysis│ - Referral   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Mongoose
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Database (MongoDB)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Users      │  │  Sessions    │  │ Assessments  │      │
│  │              │  │              │  │              │      │
│  │ - Profiles   │  │ - Consent    │  │ - Text/Audio │      │
│  │ - Roles      │  │ - Metadata   │  │ - SVI Scores │      │
│  │ - Auth       │  │ - Status     │  │ - Risk Levels│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Integration Components

### 1. API Service Layer (`src/services/api.ts`)

**Purpose**: Centralized API communication with demo fallback

**Key Features**:
- Type-safe API calls with TypeScript interfaces
- Automatic demo mode fallback when backend unavailable
- Error handling and network timeout management
- Audio file upload support
- Session-based authentication

**Main API Modules**:
- `assessmentApi`: Text and voice assessment operations
- `sessionApi`: Session and consent management
- `consentApi`: Consent recording and retrieval
- `dashboardApi`: Analytics and statistics
- `referralApi`: Referral creation and management

### 2. Session Management (`src/contexts/SessionContext.tsx`)

**Purpose**: React context for session state management

**Features**:
- Session creation and lifecycle management
- Consent tracking and recording
- Session persistence via localStorage
- Automatic session restoration on page load

**Usage**:
```tsx
const { session, createSession, recordConsent, endSession } = useSession()
```

### 3. Dashboard Integration (`src/components/DashboardIntegration.tsx`)

**Purpose**: Dashboard data fetching and display

**Components**:
- `useDashboardStats()`: Hook for fetching dashboard statistics
- `DashboardStats`: Display component for statistics cards

**Features**:
- Real-time statistics from backend
- Automatic error handling and loading states
- Demo mode support

### 4. Assessment Integration (`src/components/AssessmentIntegration.tsx`)

**Purpose**: Assessment features and history management

**Hooks**:
- `useAssessmentHistory()`: Fetch user's assessment history
- `useAssessmentTrend()`: Get SVI trends over time
- `useRecommendations()`: Fetch assessment recommendations
- `useRiskAnalysis()`: Get detailed risk analysis

**Components**:
- `AssessmentHistory`: Display past assessments
- `AssessmentTrendChart`: Visual SVI trend representation
- `RecommendationList`: Show personalized recommendations
- `RiskAnalysisDisplay`: Detailed risk breakdown

### 5. Referral Integration (`src/components/ReferralIntegration.tsx`)

**Purpose**: Referral system management

**Hooks**:
- `useReferrals()`: Fetch user's referrals
- `useReferralCreation()`: Create new referrals

**Components**:
- `ReferralList`: Display existing referrals
- `ReferralForm`: Create new referral form

## Data Flow Examples

### Text Assessment Flow

```
1. User navigates to consent page
   ↓
2. User agrees to consent → SessionContext.createSession()
   ↓
3. Session created → POST /api/sessions
   ↓
4. Consent recorded → POST /api/consent
   ↓
5. User navigates to chat
   ↓
6. User types message → AIChatPage.send()
   ↓
7. Text assessment → POST /api/assessment/text
   ↓
8. Backend processes → NLP analysis + SVI calculation
   ↓
9. Response received → Assessment data stored in localStorage
   ↓
10. Results displayed → AssessmentResultPage shows SVI + recommendations
```

### Voice Assessment Flow

```
1. User in chat interface
   ↓
2. Clicks voice input → handleVoiceInput()
   ↓
3. Audio recording → MediaRecorder API
   ↓
4. User speaks → Audio captured
   ↓
5. Upload audio → POST /api/assessment/audio
   ↓
6. Backend processes → Speech analysis + emotion detection
   ↓
7. Response received → Assessment with SVI score
   ↓
8. Results displayed → Chat shows AI response with assessment
```

### Dashboard Data Flow

```
1. Officer logs in → OfficerDashboardPage loads
   ↓
2. Dashboard mounted → useDashboardStats() hook
   ↓
3. API calls made → GET /api/dashboard/overview
   ↓
4. Backend aggregates → MongoDB queries + calculations
   ↓
5. Response received → Statistics updated in state
   ↓
6. UI renders → Stat cards show real-time data
```

## API Connection Details

### Base Configuration

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'
```

### Request Format

All API requests follow this pattern:

```typescript
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>>
```

**Response Format**:
```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

### Authentication

Currently using session-based authentication:
- Session ID stored in localStorage
- Session ID sent with assessment requests
- Future: JWT token implementation

### Error Handling

**Network Errors**: Caught and displayed as user-friendly messages
**API Errors**: Backend error messages displayed to users
**Validation Errors**: Form validation with inline feedback
**Timeout Errors**: 30-second timeout with retry option

## Environment Configuration

### Frontend (.env)

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api
VITE_DEMO_MODE=false
```

### Backend (.env)

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/aawaz

# Security
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173

# AI Provider
AI_PROVIDER=demo
AI_API_KEY=your-api-key
```

## Deployment Instructions

### Development Setup

1. **Backend Setup**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure .env with your settings
   npm run dev
   ```

2. **Frontend Setup**:
   ```bash
   cd project
   npm install
   cp .env.example .env
   # Configure .env with backend URL
   npm run dev
   ```

### Production Deployment

#### Backend Deployment

1. **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/aawaz
   JWT_SECRET=strong-random-secret
   FRONTEND_URL=https://your-frontend.com
   ```

2. **Build and Start**:
   ```bash
   npm install --production
   npm start
   ```

3. **Process Manager** (recommended):
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name aawaz-backend
   ```

#### Frontend Deployment

1. **Environment Variables**:
   ```env
   VITE_API_URL=https://your-backend.com/api
   VITE_DEMO_MODE=false
   ```

2. **Build**:
   ```bash
   npm run build
   ```

3. **Deploy**:
   - Upload `dist/` directory to your hosting service
   - Configure nginx/Apache to serve static files
   - Set up SPA routing for hash-based navigation

### Database Setup

**MongoDB Atlas** (recommended for production):

1. Create MongoDB Atlas account
2. Create a new cluster
3. Create database user
4. Get connection string
5. Update `MONGODB_URI` in backend `.env`

**Local MongoDB** (development):

```bash
# Install MongoDB
# Windows: Download from mongodb.com
# Mac: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB
mongod

# Create database
mongo
use aawaz
```

## Security Considerations

### Frontend Security

- **HTTPS**: Always use HTTPS in production
- **Environment Variables**: Never commit `.env` files
- **Input Validation**: All forms validated before submission
- **XSS Prevention**: React's built-in XSS protection
- **CORS**: Configure backend to allow frontend origin

### Backend Security

- **Helmet**: Security headers for HTTP responses
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Joi schema validation on all endpoints
- **Password Hashing**: bcrypt with salt rounds
- **JWT**: Secure token-based authentication
- **Audit Logging**: Comprehensive activity tracking

### Data Privacy

- **Consent Required**: No assessment without user consent
- **Data Minimization**: Only collect necessary data
- **Audit Log Retention**: Automatic 90-day cleanup
- **Temporary Files**: Audio files not permanently stored
- **Anonymous Options**: Users can choose anonymous reporting

## Testing the Integration

### Manual Testing Checklist

#### Basic Flow
- [ ] Landing page loads
- [ ] Navigation between pages works
- [ ] Consent flow creates session
- [ ] Chat interface accepts text input
- [ ] Text assessment returns results
- [ ] Assessment results display correctly
- [ ] Voice upload works (if supported)
- [ ] Dashboard loads with statistics
- [ ] Error handling works

#### API Integration
- [ ] Backend health check passes
- [ ] Session creation works
- [ ] Consent recording works
- [ ] Text assessment API responds
- [ ] Dashboard API returns data
- [ ] Error responses handled correctly

#### Demo Mode
- [ ] Demo mode activates with VITE_DEMO_MODE=true
- [ ] Mock data displays correctly
- [ ] All features work without backend
- [ ] Demo mode indicator shows

### Automated Testing

#### Unit Tests (recommended)
```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Run tests
npm test
```

#### E2E Tests (recommended)
```bash
# Install Cypress
npm install --save-dev cypress

# Run E2E tests
npx cypress run
```

## Troubleshooting

### Common Issues

**API Connection Failed**:
- Check `VITE_API_URL` in frontend `.env`
- Ensure backend is running on correct port
- Verify CORS configuration in backend
- Check browser console for specific errors

**Session Not Created**:
- Verify backend `/api/sessions` endpoint is accessible
- Check MongoDB connection
- Review backend logs for errors
- Ensure session API is not rate-limited

**Assessment Fails**:
- Check AI provider configuration in backend `.env`
- Verify AI API key is valid
- Review backend logs for AI service errors
- Try demo mode to isolate the issue

**Dashboard Not Loading**:
- Verify user has proper role (officer/admin)
- Check dashboard API endpoints
- Review browser console for errors
- Ensure MongoDB has sufficient data

**Demo Mode Issues**:
- Verify `VITE_DEMO_MODE=true` in `.env`
- Restart development server after changing `.env`
- Clear browser cache and localStorage
- Check browser console for errors

## Performance Optimization

### Frontend

- **Code Splitting**: Components loaded on demand
- **Lazy Loading**: Heavy components loaded when needed
- **Image Optimization**: Compress and optimize images
- **Bundle Analysis**: Use `vite-bundle-visualizer`
- **Caching**: Implement proper caching strategies

### Backend

- **Database Indexing**: Add indexes to frequently queried fields
- **Response Compression**: Enable gzip compression
- **Rate Limiting**: Prevent abuse
- **Caching**: Cache frequently accessed data
- **Connection Pooling**: Optimize database connections

## Monitoring and Logging

### Frontend Monitoring

- **Error Tracking**: Implement error boundary
- **Performance Monitoring**: Track load times
- **User Analytics**: Monitor user flows (with consent)
- **Console Logging**: Development logging only

### Backend Monitoring

- **Application Logs**: Winston logger implementation
- **Audit Logs**: Comprehensive activity tracking
- **Performance Metrics**: Response time tracking
- **Error Alerts**: Automated error notifications
- **Health Checks**: Regular health monitoring

## Future Enhancements

### Planned Features

1. **Authentication**: Full JWT implementation with refresh tokens
2. **Real-time Updates**: WebSocket integration for live dashboard
3. **Offline Support**: Service worker for offline functionality
4. **PWA**: Progressive Web App capabilities
5. **Advanced Analytics**: More sophisticated data visualization
6. **Multi-language**: Internationalization (i18n) support
7. **Accessibility**: Enhanced screen reader support
8. **Performance**: Further optimization and caching

### API Enhancements

1. **GraphQL**: Consider GraphQL for efficient data fetching
2. **WebSocket**: Real-time notifications
3. **File Upload**: Enhanced file handling with progress
4. **Batch Operations**: Bulk API operations
5. **Webhooks**: External system integration

## Support and Maintenance

### Documentation

- Keep this guide updated with changes
- Document all API changes
- Maintain code comments
- Update README files

### Code Quality

- Follow TypeScript best practices
- Use ESLint for code quality
- Implement proper error handling
- Write unit tests for critical functions

### Security Updates

- Regular dependency updates
- Security audit of dependencies
- Monitor security advisories
- Implement security patches promptly

## Contact

For integration issues or questions:
- Backend team: [backend-contact]
- Frontend team: [frontend-contact]
- DevOps team: [devops-contact]

---

**Last Updated**: 2026-09-13
**Version**: 1.0.0
**Status**: Production Ready