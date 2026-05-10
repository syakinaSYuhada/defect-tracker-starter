const request = require('supertest');
const app = require('../src/app');
const { genTestToken } = require('./helpers/jwt');

describe('Defects API', () => {
  it('should list defects (pagination)', async () => {
    const res = await request(app).get('/api/defects?page=1&limit=5');
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeDefined();
    // If route returns standardized { success, data }
    if (res.body && typeof res.body === 'object' && 'success' in res.body) {
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });

  it('should reject unauthorized create', async () => {
    const res = await request(app).post('/api/defects').send({});
    expect(res.statusCode).toBe(401);
  });

  it('should reject invalid create payload even if authorized', async () => {
    const token = genTestToken({ sub: 'tester', role: 'admin' });
    const res = await request(app).post('/api/defects').set('Authorization', `Bearer ${token}`).send({});
    expect(res.statusCode).toBe(400);
  });
});
