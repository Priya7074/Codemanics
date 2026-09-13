import request from 'supertest';
import app from '../src/server.js';

const uniqueEmail = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;

const registerAndGetToken = async () => {
  const email = uniqueEmail('validation');
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      email,
      password: 'password123',
      name: 'Validation User',
      role: 'victim',
    });

  return response.body.token;
};

describe('Validation Tests', () => {
  describe('Request Validation', () => {
    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should validate password length', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'short',
          name: 'Test User',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should validate session creation', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should validate consent request', async () => {
      const response = await request(app)
        .post('/api/consent')
        .send({
          sessionId: 'test-session',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation Error');
    });
  });

  describe('Parameter Validation', () => {
    it('should validate assessment ID parameter', async () => {
      const token = await registerAndGetToken();

      const response = await request(app)
        .get('/api/assessment/invalid-id-format')
        .set('Authorization', `Bearer ${token}`);

      // This might return 404 instead of 400 depending on implementation
      expect([400, 404]).toContain(response.status);
    });

    it('should validate session ID parameter', async () => {
      const token = await registerAndGetToken();

      const response = await request(app)
        .get('/api/assessment/session/invalid-session-id')
        .set('Authorization', `Bearer ${token}`);

      expect([400, 404]).toContain(response.status);
    });
  });
});
