import request from 'supertest';
import App from '@/app';

describe('Auth API Integration', () => {
  let app: App;

  beforeAll(() => {
    app = new App();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app.app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'newuser@example.com',
          password: 'Test123!',
          role: 'patient',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe('newuser@example.com');
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.tokens.accessToken).toBeDefined();
    });

    it('should validate required fields', async () => {
      const response = await request(app.app)
        .post('/api/v1/auth/register')
        .send({
          email: 'incomplete@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject duplicate email', async () => {
      await request(app.app).post('/api/v1/auth/register').send({
        name: 'User 1',
        email: 'duplicate@example.com',
        password: 'Test123!',
        role: 'patient',
      });

      const response = await request(app.app)
        .post('/api/v1/auth/register')
        .send({
          name: 'User 2',
          email: 'duplicate@example.com',
          password: 'Test123!',
          role: 'patient',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app.app).post('/api/v1/auth/register').send({
        name: 'Login User',
        email: 'login@example.com',
        password: 'Test123!',
        role: 'patient',
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app.app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Test123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.tokens).toBeDefined();
    });

    it('should reject invalid email', async () => {
      const response = await request(app.app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid password', async () => {
      const response = await request(app.app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    let accessToken: string;

    beforeEach(async () => {
      const registerResponse = await request(app.app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Profile User',
          email: 'profile@example.com',
          password: 'Test123!',
          role: 'patient',
        });

      accessToken = registerResponse.body.data.tokens.accessToken;
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app.app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('profile@example.com');
    });

    it('should reject request without token', async () => {
      const response = await request(app.app).get('/api/v1/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid token', async () => {
      const response = await request(app.app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/auth/change-password', () => {
    let accessToken: string;

    beforeEach(async () => {
      const registerResponse = await request(app.app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Password User',
          email: 'password@example.com',
          password: 'OldPassword123!',
          role: 'patient',
        });

      accessToken = registerResponse.body.data.tokens.accessToken;
    });

    it('should change password with valid current password', async () => {
      const response = await request(app.app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'OldPassword123!',
          newPassword: 'NewPassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify can login with new password
      const loginResponse = await request(app.app)
        .post('/api/v1/auth/login')
        .send({
          email: 'password@example.com',
          password: 'NewPassword123!',
        });

      expect(loginResponse.status).toBe(200);
    });

    it('should reject incorrect current password', async () => {
      const response = await request(app.app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'WrongPassword!',
          newPassword: 'NewPassword123!',
        });

      expect(response.status).toBe(400);
    });
  });
});
