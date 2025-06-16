import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('service_clients', () => {
  it('GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('POST /clients creates a client', async () => {
    const res = await request(app).post('/clients').send({ name: 'Alice' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Alice');

    const list = await request(app).get('/clients');
    expect(list.body.length).toBe(1);
  });
});