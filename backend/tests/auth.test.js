const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');


describe('Auth API', () => {
    it('Should register a new user', async () => {
        const uniqueName = `user${Date.now()}`;
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: uniqueName,
                email: `${uniqueName}@test.com`,
                password: 'password123'
            });
        expect(res.statusCode).toEqual(201);
    });

    it('Should not login with wrong credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@test.com',
                password: 'wrongpassword'
            });
        expect(res.statusCode).toEqual(400);
    });
});