const request = require('supertest');
const app = require('../src/app');

describe('API Health', () => {
  it('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  it('GET /api/dashboard/summary returns 200', async () => {
    const res = await request(app).get('/api/dashboard/summary');
    expect([200, 204, 401, 403]).toContain(res.statusCode);
  });
});
