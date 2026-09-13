# Aawaz Project Setup Guide

## Quick Start

This guide will help you set up and run the complete Aawaz application (frontend + backend) for development and demonstration purposes.

## Prerequisites

- **Node.js**: v18 or higher
- **MongoDB**: v4.4 or higher (local installation or MongoDB Atlas account)
- **npm**: Comes with Node.js
- **Git**: For cloning the repository

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd project1
```

### 2. Backend Setup

#### Navigate to Backend Directory
```bash
cd backend
```

#### Install Dependencies
```bash
npm install
```

#### Configure Environment Variables
```bash
# Copy the example environment file
cp .env.example .env
```

#### Edit `.env` File
Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/aawaz

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend Configuration (for CORS)
FRONTEND_URL=http://localhost:5173

# AI/NLP Provider Configuration
# Options: demo, openai, google, aws, azure
AI_PROVIDER=demo
AI_API_KEY=your-ai-api-key-here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_AUDIO_FORMATS=audio/mpeg,audio/wav,audio/ogg,audio/webm,audio/mp4

# Session Configuration
SESSION_TIMEOUT_HOURS=24

# Audit Log Configuration
AUDIT_LOG_RETENTION_DAYS=90

# Security Configuration
ENABLE_HELMET=true
ENABLE_CORS=true
ENABLE_RATE_LIMITING=true

# Logging Configuration
LOG_LEVEL=info
LOG_FILE_PATH=logs/app.log
```

#### Start MongoDB

**Option 1: Local MongoDB**
```bash
# Start MongoDB service
# Windows: net start MongoDB
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

**Option 2: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create database user
4. Get connection string
5. Update `MONGODB_URI` in `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aawaz
   ```

#### Start Backend Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The backend will be available at `http://localhost:3000`

### 3. Frontend Setup

#### Navigate to Frontend Directory
```bash
cd ../project
```

#### Install Dependencies
```bash
npm install
```

#### Configure Environment Variables
```bash
# Copy the example environment file
cp .env.example .env
```

#### Edit `.env` File
Edit the `.env` file with your configuration:

```env
# API URL - Point to your backend server
VITE_API_URL=http://localhost:3000/api

# Demo Mode - Set to 'true' to use mock data without backend
VITE_DEMO_MODE=false
```

#### Start Frontend Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Running the Application

### Development Mode (Both Frontend + Backend)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd project
npm run dev
```

### Demo Mode (Frontend Only)

If you want to run the frontend without the backend (using mock data):

1. Set `VITE_DEMO_MODE=true` in `project/.env`
2. Start only the frontend:
   ```bash
   cd project
   npm run dev
   ```

This is perfect for demonstrations or when the backend is not available.

## Verification Steps

### 1. Backend Health Check

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-09-13T00:00:00.000Z"
}
```

### 2. Frontend Access

Open your browser and navigate to:
```
http://localhost:5173
```

### 3. Test Complete Flow

1. **Landing Page**: Navigate to `http://localhost:5173`
2. **Consent Flow**: Click "Talk to AI Assistant" → Agree to consent
3. **Chat Interface**: Send a message like "I feel stressed"
4. **Assessment**: Observe the AI response with SVI score
5. **Results**: Navigate to assessment results
6. **Dashboard**: Navigate to `#/officer` for dashboard

## Common Issues and Solutions

### Backend Issues

**Port Already in Use**
```bash
# Find process using port 3000
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux

# Kill the process or change PORT in .env
```

**MongoDB Connection Failed**
```bash
# Check if MongoDB is running
# Windows: net start MongoDB
# Mac: brew services list | grep mongodb
# Linux: sudo systemctl status mongod

# Test MongoDB connection
mongo mongodb://localhost:27017/aawaz
```

**Module Not Found**
```bash
# Clear cache and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend Issues

**Port Already in Use**
```bash
# Vite will automatically find next available port
# Or specify port in package.json: "vite --port 3001"
```

**API Connection Failed**
```bash
# Verify backend is running
curl http://localhost:3000/api/health

# Check VITE_API_URL in .env
# Ensure it matches backend URL
```

**Build Errors**
```bash
# Clear cache and reinstall
cd project
rm -rf node_modules package-lock.json dist
npm install
```

### MongoDB Issues

**Local MongoDB Installation**

**Windows:**
1. Download MongoDB from https://www.mongodb.com/try/download/community
2. Run installer
3. Install as service
4. Start service: `net start MongoDB`

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

## Production Deployment

### Backend Deployment

#### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/aawaz
JWT_SECRET=strong-random-production-secret
FRONTEND_URL=https://your-domain.com
AI_PROVIDER=openai
AI_API_KEY=your-production-api-key
```

#### Deploy to Cloud

**Option 1: VPS (DigitalOcean, AWS, etc.)**
```bash
# SSH into server
ssh user@your-server.com

# Clone repository
git clone <repository-url>
cd project1/backend

# Install dependencies
npm install --production

# Setup environment variables
cp .env.example .env
# Edit .env with production values

# Start with PM2
npm install -g pm2
pm2 start src/server.js --name aawaz-backend
pm2 save
pm2 startup
```

**Option 2: Docker**
```bash
# Build Docker image
docker build -t aawaz-backend .

# Run container
docker run -d -p 3000:3000 --env-file .env aawaz-backend
```

**Option 3: Serverless (AWS Lambda, Vercel, etc.)**
- Adapt the Express app for serverless
- Use appropriate deployment platform

### Frontend Deployment

#### Build for Production
```bash
cd project
npm run build
```

#### Deploy to Static Hosting

**Option 1: Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

**Option 2: Netlify**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

**Option 3: Traditional Hosting**
```bash
# Upload dist/ directory to your server
# Configure nginx/apache to serve static files
# Set up SPA routing
```

#### Nginx Configuration Example
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/aawaz/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Database Setup for Production

### MongoDB Atlas Setup

1. **Create Account**: https://www.mongodb.com/cloud/atlas
2. **Create Cluster**: Choose free tier (M0)
3. **Database Access**: Create database user
4. **Network Access**: Whitelist your server IP
5. **Connect**: Get connection string
6. **Update .env**: Set `MONGODB_URI`

### Database Indexing

The backend will automatically create necessary indexes on startup. For manual indexing:

```javascript
// In MongoDB shell
use aawaz

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.sessions.createIndex({ userId: 1, createdAt: -1 })
db.assessments.createIndex({ sessionId: 1, createdAt: -1 })
db.referrals.createIndex({ sessionId: 1, status: 1 })
```

## Security Configuration

### Backend Security

1. **HTTPS**: Use SSL certificates in production
2. **Firewall**: Configure firewall rules
3. **JWT Secret**: Use strong, randomly generated secret
4. **Rate Limiting**: Adjust based on your needs
5. **CORS**: Only allow trusted domains

### Frontend Security

1. **HTTPS**: Always use HTTPS in production
2. **Content Security Policy**: Implement CSP headers
3. **Environment Variables**: Never commit `.env` files
4. **Dependencies**: Regular security updates

## Monitoring and Maintenance

### Health Checks

Add these to your monitoring system:

```bash
# Backend health
curl https://your-domain.com/api/health

# Frontend availability
curl https://your-domain.com
```

### Log Monitoring

```bash
# Backend logs (if using PM2)
pm2 logs aawaz-backend

# Or check log file
tail -f backend/logs/app.log
```

### Backup Strategy

1. **Database Backups**: Configure MongoDB Atlas automated backups
2. **Code Backups**: Use Git with proper branching
3. **Environment Backups**: Securely store `.env` files

## Performance Optimization

### Backend Optimization

1. **Enable Compression**: Add compression middleware
2. **Database Indexing**: Ensure proper indexes
3. **Caching**: Implement Redis for frequently accessed data
4. **Load Balancing**: Use Nginx load balancer for scaling

### Frontend Optimization

1. **Code Splitting**: Already implemented with React.lazy
2. **Image Optimization**: Compress images
3. **Bundle Analysis**: Use `vite-bundle-visualizer`
4. **CDN**: Use CDN for static assets

## Troubleshooting

### Application Not Starting

1. Check all services are running (MongoDB, Backend, Frontend)
2. Verify environment variables are set correctly
3. Check logs for error messages
4. Ensure ports are not blocked by firewall

### Database Issues

1. Verify MongoDB connection string
2. Check MongoDB service status
3. Ensure database user has correct permissions
4. Test connection with MongoDB Compass

### API Issues

1. Check backend logs for errors
2. Verify CORS configuration
3. Test API endpoints with curl/Postman
4. Check network connectivity

## Support and Resources

### Documentation

- Backend README: `backend/README.md`
- Frontend README: `project/README.md`
- Integration Guide: `INTEGRATION_GUIDE.md`
- API Documentation: Backend API endpoints

### Useful Commands

```bash
# Backend
cd backend
npm run dev          # Development
npm start            # Production
npm test             # Run tests
npm run lint         # Lint code

# Frontend
cd project
npm run dev          # Development
npm run build        # Production build
npm run preview      # Preview production build
```

### Getting Help

If you encounter issues:

1. Check this guide first
2. Review error logs
3. Check documentation
4. Search existing issues
5. Contact development team

---

**Last Updated**: 2026-09-13
**Version**: 1.0.0