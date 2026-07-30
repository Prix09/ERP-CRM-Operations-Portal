import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';

describe('Auth Endpoints', () => {
  const testUser = {
    name: 'Test Auth User',
    email: 'testauth@flowsphere.local',
    password: 'Password123!',
  };

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  it('should register a new user', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('token');
  });

  it('should not register the same user twice', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);
    expect(res.statusCode).toEqual(400); // Wait, our errorHandler or authService returns 400. Let's see. Yes, authController returns 400.
    expect(res.body).toHaveProperty('success', false);
  });

  it('should login the user', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('token');
    // Check if refreshToken cookie is set
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should return 401 for wrong password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: 'wrongpassword',
    });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('success', false);
  });
});
