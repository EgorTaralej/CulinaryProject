const request = require('supertest');
const app = require('../server');

describe('Admin Logic', () => {
    it('Non-admins should not access dashboard', async () => {
        const res = await request(app).get('/api/admin/dashboard');
        expect(res.statusCode).toEqual(401);
    });
});