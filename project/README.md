# Aawaz Frontend

Aawaz is a Vite + React + TypeScript application for a safe, trauma-sensitive first-contact experience for victims and complainants. It includes the public support journey, a calm tricolor sign-in page with optional two-factor authentication, and a separate NHAA officer workspace.

## Features

- **AI-Powered Support**: Text and voice assessment with real-time NLP analysis
- **Session Management**: Secure session tracking with consent flow
- **Assessment History**: View past assessments and SVI trends
- **Risk Analysis**: Detailed risk breakdown with contributing indicators
- **Recommendations**: Personalized support recommendations based on assessment
- **Referral System**: Create and manage professional referrals
- **Dashboard Analytics**: Real-time statistics for authorized officers
- **Demo Mode**: Full functionality with mock data for testing without backend

## Tech Stack

- **Runtime**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS with custom properties
- **Icons**: Lucide React
- **API Integration**: Custom service layer with demo fallback

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   # API URL - Point to your backend server
   VITE_API_URL=http://localhost:3000/api

   # Demo Mode - Set to 'true' to use mock data without backend
   VITE_DEMO_MODE=false
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

### Demo Mode

To run the application without a backend (using mock data):

1. Set `VITE_DEMO_MODE=true` in `.env`
2. Start the dev server: `npm run dev`

This allows you to demonstrate the full UI/UX without requiring backend infrastructure.

## Application Routes

The app uses lightweight hash navigation so every screen can be opened directly:

- `#/` — landing page
- `#/login` — member sign-in with optional 2FA enrollment
- `#/help` — choose help
- `#/consent` → `#/chat` → `#/assessment` → `#/result` — AI-assisted support flow
- `#/report` — progressive incident report
- `#/support` — support service directory
- `#/officer` → `#/case-detail` — authorized officer workspace
- `#/analytics` — admin analytics

## Backend Integration

### API Service Layer

The application includes a comprehensive API service layer in `src/services/api.ts`:

- **Assessment API**: Text and voice assessment creation and retrieval
- **Session API**: Session management and consent tracking
- **Dashboard API**: Overview, trends, and analytics
- **Referral API**: Referral creation and management
- **Demo Fallback**: Automatic mock data when backend is unavailable

### Environment Variables

- `VITE_API_URL`: Backend API endpoint (default: `http://localhost:3000/api`)
- `VITE_DEMO_MODE`: Enable demo mode with mock data (default: `false`)

### API Endpoints Used

#### Assessment
- `POST /api/assessment/text` - Create text assessment
- `POST /api/assessment/audio` - Create audio assessment
- `GET /api/assessment/:id` - Get assessment by ID
- `GET /api/assessment/session/:sessionId` - Get assessments by session
- `GET /api/assessment/session/:sessionId/trend` - Get assessment trends
- `GET /api/assessment/risk/:assessmentId` - Get risk analysis
- `GET /api/assessment/recommendations/:assessmentId` - Get recommendations

#### Session
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get session details
- `PUT /api/sessions/:id` - Update session
- `PATCH /api/sessions/:id/end` - End session

#### Consent
- `POST /api/consent` - Record consent
- `GET /api/consent/:sessionId` - Get consent records

#### Dashboard
- `GET /api/dashboard/overview` - Dashboard overview
- `GET /api/dashboard/risk-distribution` - Risk distribution
- `GET /api/dashboard/trends` - Assessment trends
- `GET /api/dashboard/high-risk` - High-risk cases
- `GET /api/dashboard/recent-assessments` - Recent assessments

#### Referral
- `POST /api/referrals` - Create referral
- `GET /api/referrals/session/:sessionId` - Get referrals by session
- `GET /api/referrals/:id` - Get referral details
- `PUT /api/referrals/:id` - Update referral
- `PATCH /api/referrals/:id/accept` - Accept referral
- `PATCH /api/referrals/:id/complete` - Complete referral

## Component Structure

### Core Components
- `src/components/PublicHeader.tsx` - Public navigation header
- `src/components/AppHeader.tsx` - App navigation header
- `src/components/UI.tsx` - Reusable UI components
- `src/components/BrandLogo.tsx` - Brand logo component
- `src/components/Footer.tsx` - Footer component

### Integration Components
- `src/components/DashboardIntegration.tsx` - Dashboard data integration
- `src/components/AssessmentIntegration.tsx` - Assessment features integration
- `src/components/ReferralIntegration.tsx` - Referral system integration

### Context
- `src/contexts/SessionContext.tsx` - Session management context

### Services
- `src/services/api.ts` - Centralized API service layer

### Pages
- `src/pages/Pages.tsx` - All page components

## Data Flow

### Assessment Flow
1. User provides consent → Session created
2. User inputs text/voice → Assessment API called
3. Backend analyzes content → Returns SVI score and risk level
4. Frontend displays results → Shows recommendations
5. Data stored for history → Available for trends

### Dashboard Flow
1. Officer logs in → Dashboard loads
2. Overview API called → Statistics displayed
3. Risk distribution API → Visual breakdown
4. Trends API → Historical data shown
5. High-risk cases → Priority cases highlighted

## Styling

The application uses custom CSS with CSS variables for theming:

- Primary colors: `--primary`, `--primary-dark`, `--violet`
- Functional colors: `--pink`, `--mint`, `--blue`, `--amber`
- Neutral colors: `--ink`, `--muted`, `--line`, `--bg`
- Radius: `--radius`
- Shadow: `--shadow`

## Error Handling

The application includes comprehensive error handling:

- **API Errors**: Displayed as user-friendly error messages
- **Loading States**: Spinner indicators during async operations
- **Network Errors**: Graceful fallback to demo mode
- **Validation Errors**: Form validation with clear feedback

## Demo Mode

When `VITE_DEMO_MODE=true`, the application:

- Uses mock data instead of API calls
- Simulates network delays for realistic experience
- Provides full UI/UX demonstration
- Allows testing without backend infrastructure

**Important**: Demo mode is for demonstration only. Never present demo AI results as real clinical diagnosis.

## Security Considerations

- All API calls use HTTPS in production
- Session IDs stored in localStorage (consider secure storage for production)
- No sensitive data logged to console
- Input validation on all forms
- CORS configured for backend communication

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Responsive design for mobile and desktop

## Performance

- Code splitting with React.lazy
- Optimized bundle size with Vite
- Lazy loading of components
- Efficient state management

## Accessibility

- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management
- Screen reader friendly

## Troubleshooting

### API Connection Issues
- Check `VITE_API_URL` in `.env`
- Ensure backend is running
- Verify CORS configuration on backend
- Check browser console for errors

### Demo Mode Not Working
- Verify `VITE_DEMO_MODE=true` in `.env`
- Restart development server after changing `.env`
- Clear browser cache

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (requires v18+)
- Verify TypeScript configuration

## Development

### Adding New Features

1. **Create API endpoint**: Add to `src/services/api.ts`
2. **Create integration component**: Add to `src/components/`
3. **Add hooks**: Create custom hooks for data fetching
4. **Update types**: Add TypeScript interfaces to `src/types/`
5. **Add styling**: Update `src/styles/global.css`

### Testing

The application is designed to be testable. Consider adding:

- Unit tests for components
- Integration tests for API calls
- E2E tests for user flows
- Accessibility tests

## Deployment

### Environment Variables for Production

```env
VITE_API_URL=https://your-backend-api.com/api
VITE_DEMO_MODE=false
```

### Build Process

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## Support

For issues or questions:
- Check the existing documentation
- Review the API service layer
- Examine component examples
- Contact the development team

## License

This project is part of the SIH initiative. See project license for details.
