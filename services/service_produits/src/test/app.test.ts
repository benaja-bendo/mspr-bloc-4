import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js';

describe('service_produits', () => {
  it('GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('POST /products creates a product', async () => {
    const res = await request(app).post('/products').send({ id: 1, name: 'Tea' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Tea');

    const list = await request(app).get('/products');
    expect(list.body.length).toBe(1);
  });
});