import request from 'supertest';
import app from '../src/server.js';

const uniqueEmail = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;

describe('Dashboard Tests', () => {
  let authToken;
  let officerToken;

  beforeAll(async () => {
    // Register regular user
    const userData = {
      email: uniqueEmail('user'),
      password: 'password123',
      name: 'Regular User',
      role: 'victim',
    };

    const userResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    authToken = userResponse.body.token;

    // Register officer user
    const officerData = {
      email: uniqueEmail('officer'),
      password: 'password123',
      name: 'Officer User',
      role: 'authorized_officer',
    };

    const officerResponse = await request(app)
      .post('/api/auth/register')
      .send(officerData);

    officerToken = officerResponse.body.token;
  });

  describe('GET /api/dashboard/overview', () => {
    it('should get dashboard overview for officer', async () => {
      const response = await request(app)
        .get('/api/dashboard/overview')
        .set('Authorization', `Bearer ${officerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('overview');
      expect(response.body.overview).toHaveProperty('totalAssessments');
      expect(response.body.overview).toHaveProperty('highRiskAssessments');
      expect(response.body.overview).toHaveProperty('activeSessions');
      expect(response.body.overview).toHaveProperty('totalUsers');
    });

    it('should not allow regular user to access dashboard', async () => {
      const response = await request(app)
        .get('/api/dashboard/overview')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Access denied');
    });

    it('should not allow unauthenticated access', async () => {
      const response = await request(app).get('/api/dashboard/overview');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Authentication required');
    });
  });

  describe('GET /api/dashboard/risk-distribution', () => {
    it('should get risk distribution for officer', async () => {
      const response = await request(app)
        .get('/api/dashboard/risk-distribution')
        .set('Authorization', `Bearer ${officerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('distribution');
      expect(response.body.distribution).toHaveProperty('byCount');
      expect(response.body.distribution).toHaveProperty('byPercentage');
      expect(response.body.distribution.byCount).toHaveProperty('Low');
      expect(response.body.distribution.byCount).toHaveProperty('Moderate');
      expect(response.body.distribution.byCount).toHaveProperty('High');
      expect(response.body.distribution.byCount).toHaveProperty('Critical');
    });

    it('should not allow regular user to access risk distribution', async () => {
      const response = await request(app)
        .get('/api/dashboard/risk-distribution')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/dashboard/trends', () => {
    it('should get trends for officer', async () => {
      const response = await request(app)
        .get('/api/dashboard/trends?days=7')
        .set('Authorization', `Bearer ${officerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('trends');
      expect(response.body.trends).toHaveProperty('period');
      expect(response.body.trends).toHaveProperty('data');
      expect(Array.isArray(response.body.trends.data)).toBe(true);
    });

    it('should allow custom days parameter', async () => {
      const response = await request(app)
        .get('/api/dashboard/trends?days=30')
        .set('Authorization', `Bearer ${officerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.trends.period).toContain('30');
    });
  });

  describe('GET /api/dashboard/high-risk', () => {
    it('should get high-risk cases for officer', async () => {
      const response = await request(app)
        .get('/api/dashboard/high-risk')
        .set('Authorization', `Bearer ${officerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('highRiskCases');
      expect(Array.isArray(response.body.highRiskCases)).toBe(true);
    });

    it('should allow limit parameter', async () => {
      const response = await request(app)
        .get('/api/dashboard/high-risk?limit=5')
        .set('Authorization', `Bearer ${officerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.highRiskCases.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /api/dashboard/recent-assessments', () => {
    it('should get recent assessments for officer', async () => {
      const response = await request(app)
        .get('/api/dashboard/recent-assessments')
        .set('Authorization', `Bearer ${officerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('assessments');
      expect(Array.isArray(response.body.assessments)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/dashboard/recent-assessments?limit=10&offset=0')
        .set('Authorization', `Bearer ${officerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination).toHaveProperty('limit', 10);
      expect(response.body.pagination).toHaveProperty('offset', 0);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('hasMore');
    });
  });
});
