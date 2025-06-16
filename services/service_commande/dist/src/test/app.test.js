import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index';
describe('service_commande', () => {
    it('GET /health', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: 'ok' });
    });
    it('POST /orders creates an order', async () => {
        const res = await request(app).post('/orders').send({ clientId: 1, productId: 2 });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.clientId).toBe(1);
    });
});
//# sourceMappingURL=app.test.js.map