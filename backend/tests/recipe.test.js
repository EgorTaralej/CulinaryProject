const request = require('supertest');
const app = require('../server');

describe('Recipe API', () => {
    it('Should block unauthorized recipe creation', async () => {
        const res = await request(app)
            .post('/api/recipes')
            .send({ title: 'Unauthorized Recipe' });
        expect(res.statusCode).toEqual(401);
    });
});