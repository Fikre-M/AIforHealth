import request from 'supertest';
import App from '../../app';

const app = new App().app;

describe('API - Health endpoint', () => {
  it('GET /health returns status OK with required fields', async () => {
    const res = await request(app).get('/health');

    // DB is not connected in unit tests, so we accept both 200 and 503
    expect([200, 503]).toContain(res.status);
    expect(res.body.data).toMatchObject({
      status: expect.stringMatching(/^(OK|DEGRADED)$/),
      timestamp: expect.any(String),
      uptime: expect.any(Number),
      version: '1.0.0',
      database: expect.stringMatching(/^(connected|disconnected)$/),
    });
  });
});

describe('API - Root endpoint', () => {
  it('GET / returns API info', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      name: 'AIforHealth API',
      version: '1.0.0',
      status: 'running',
      docs: '/api-docs',
    });
  });
});

describe('API - Auth register endpoint', () => {
  it('POST /api/v1/auth/register returns 400 for missing fields', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/register returns 400 for invalid email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Test User',
      email: 'not-an-email',
      password: 'Password123!',
      role: 'patient',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
