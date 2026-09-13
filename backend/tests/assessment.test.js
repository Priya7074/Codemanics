import request from 'supertest';
import app from '../src/server.js';
import sviEngine from '../src/services/sviEngine.js';

const uniqueEmail = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;

describe('Assessment Tests', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Register and login a test user
    const userData = {
      email: uniqueEmail('assessment'),
      password: 'password123',
      name: 'Assessment User',
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  describe('SVI Engine', () => {
    it('should calculate SVI score correctly', () => {
      const indicators = {
        sentiment: 30,
        emotionalState: 70,
        distress: 60,
        fear: 50,
        anxiety: 55,
        trauma: 40,
        threatVulnerability: 45,
        socialIsolation: 35,
      };

      const result = sviEngine.calculateSVI(indicators);

      expect(result).toHaveProperty('sviScore');
      expect(result.sviScore).toBeGreaterThanOrEqual(0);
      expect(result.sviScore).toBeLessThanOrEqual(100);
      expect(result).toHaveProperty('riskLevel');
      expect(result).toHaveProperty('contributingIndicators');
      expect(Array.isArray(result.contributingIndicators)).toBe(true);
    });

    it('should classify risk levels correctly', () => {
      expect(sviEngine.getRiskLevel(10)).toBe('Low');
      expect(sviEngine.getRiskLevel(30)).toBe('Moderate');
      expect(sviEngine.getRiskLevel(60)).toBe('High');
      expect(sviEngine.getRiskLevel(80)).toBe('Critical');
    });

    it('should identify safety escalation needs', () => {
      const criticalIndicators = {
        emotionalState: 80,
        distress: 75,
        fear: 85,
        anxiety: 70,
        trauma: 85,
        threatVulnerability: 90,
        socialIsolation: 60,
      };

      const result = sviEngine.calculateSVI(criticalIndicators);
      expect(result.safetyEscalationFlag).toBe(true);
      expect(result.escalationReason).toBeTruthy();
    });

    it('should calculate trends correctly', () => {
      const trend = sviEngine.calculateTrend(50, 70);
      expect(trend.trendDirection).toBe('deteriorating');
      expect(trend.percentageChange).toBeGreaterThan(0);

      const improvingTrend = sviEngine.calculateTrend(70, 50);
      expect(improvingTrend.trendDirection).toBe('improving');
      expect(improvingTrend.percentageChange).toBeLessThan(0);
    });
  });

  describe('POST /api/assessment/text', () => {
    it('should create text assessment with valid token', async () => {
      // First create a session
      const sessionResponse = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId,
          metadata: {},
        });

      const sessionId = sessionResponse.body.session.sessionId;

      const assessmentData = {
        sessionId,
        text: 'I have been feeling very anxious and scared lately. I am worried about my safety and feel isolated from my family.',
        language: 'en',
      };

      const response = await request(app)
        .post('/api/assessment/text')
        .set('Authorization', `Bearer ${authToken}`)
        .send(assessmentData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Text assessment completed successfully');
      expect(response.body.assessment).toHaveProperty('assessmentId');
      expect(response.body.assessment).toHaveProperty('sviScore');
      expect(response.body.assessment).toHaveProperty('riskLevel');
      expect(response.body.assessment).toHaveProperty('indicators');
      expect(response.body).toHaveProperty('recommendations');
      expect(Array.isArray(response.body.recommendations)).toBe(true);
    });

    it('should not create assessment without token', async () => {
      const response = await request(app)
        .post('/api/assessment/text')
        .send({
          sessionId: 'test-session',
          text: 'Test text',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Authentication required');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/assessment/text')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId: 'test-session',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should validate text length', async () => {
      const response = await request(app)
        .post('/api/assessment/text')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId: 'test-session',
          text: 'short',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation Error');
    });
  });

  describe('GET /api/assessment/:id', () => {
    it('should get assessment by ID', async () => {
      // Create a session and assessment first
      const sessionResponse = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ userId });

      const sessionId = sessionResponse.body.session.sessionId;

      const assessmentResponse = await request(app)
        .post('/api/assessment/text')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId,
          text: 'I feel very stressed and anxious about my situation.',
        });

      const assessmentId = assessmentResponse.body.assessment.assessmentId;

      const response = await request(app)
        .get(`/api/assessment/${assessmentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.assessment).toHaveProperty('assessmentId', assessmentId);
      expect(response.body.assessment).toHaveProperty('sviScore');
      expect(response.body.assessment).toHaveProperty('riskLevel');
    });

    it('should return 404 for non-existent assessment', async () => {
      const response = await request(app)
        .get('/api/assessment/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Assessment not found');
    });
  });

  describe('GET /api/assessment/session/:sessionId', () => {
    it('should get assessments by session ID', async () => {
      const sessionResponse = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ userId });

      const sessionId = sessionResponse.body.session.sessionId;

      // Create multiple assessments
      await request(app)
        .post('/api/assessment/text')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId,
          text: 'First assessment text',
        });

      await request(app)
        .post('/api/assessment/text')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId,
          text: 'Second assessment text',
        });

      const response = await request(app)
        .get(`/api/assessment/session/${sessionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('assessments');
      expect(Array.isArray(response.body.assessments)).toBe(true);
      expect(response.body.assessments.length).toBeGreaterThan(0);
    });
  });
});
