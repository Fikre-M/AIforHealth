import request from 'supertest';
import App from '@/app';

describe('Auth API Integration', () => {
  const app = new App().app;

  it('should register, login, get profile, change password', async () => {
    const register = await request(app).post('/api/v1/auth/register').send({
      name: 'Test',
      email: 'test@example.com',
      password: 'Password123!',
      role: 'patient',
    });
    expect(register.status).toBe(201);

    const login = await request(app).post('/api/v1/auth/login').send({
      email: 'test@example.com',
      password: 'Password123!',
    });
    expect(login.status).toBe(200);
    const token = login.body.data.tokens.accessToken;

    const profile = await request(app)
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(profile.status).toBe(200);
    expect(profile.body.data.email).toBe('test@example.com');

    const changePwd = await request(app)
      .put('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'Password123!', newPassword: 'NewPassword123!' });
    expect(changePwd.status).toBe(200);
  });
});
