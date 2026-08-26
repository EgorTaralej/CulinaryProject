const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

let userToken = '';
let adminToken = '';
let testRecipeId = '';
let testUserId = '';

describe('Culinary App - Система за тестване (Acceptance Tests)', () => {

    it('Трябва да регистрира нов потребител успешно', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: `User_${Date.now()}`,
                email: `test_${Date.now()}@test.com`,
                password: 'password123'
            });
        expect(res.statusCode).toEqual(201);
    });

    it('Рецепта от потребител трябва да е със статус "pending"', async () => {
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'ivan@test.com', password: 'password123' });
        
        userToken = loginRes.body.token;
        expect(userToken).toBeDefined();

        const res = await request(app)
            .post('/api/recipes')
            .set('x-auth-token', userToken)
            .send({
                title: 'Тестова рецепта',
                description: 'Описание...',
                ingredients: ['тест'],
                steps: [{ text: 'стъпка 1' }],
                category: { cuisine: 'Българска', difficulty: 'Лесно', dishType: 'Друго' }
            });
        
        expect(res.statusCode).toEqual(201);
        expect(res.body.status).toBe('pending');
        testRecipeId = res.body._id;
    });

    it('Рецепта от администратор трябва да е одобрена веднага', async () => {
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'egor@test.com', password: 'mypassword123' });
        
        adminToken = loginRes.body.token;

        const res = await request(app)
            .post('/api/recipes')
            .set('x-auth-token', adminToken)
            .send({
                title: 'Админ рецепта',
                description: 'Описание...',
                ingredients: ['тест'],
                steps: [{ text: 'стъпка 1' }],
                category: { cuisine: 'Българска', difficulty: 'Лесно', dishType: 'Друго' }
            });
        
        expect(res.body.status).toBe('approved');
    });

    it('Редакция на рецепта трябва да я върне за одобрение', async () => {
        const res = await request(app)
            .put(`/api/recipes/${testRecipeId}`)
            .set('x-auth-token', userToken)
            .send({ title: 'Променено заглавие' });
        
        expect(res.body.status).toBe('pending');
    });

    it('Потребител може да докладва рецепта', async () => {
        const res = await request(app)
            .post(`/api/recipes/${testRecipeId}/report`)
            .set('x-auth-token', userToken)
            .send({ reason: 'Тестова жалба' });
        
        expect(res.statusCode).toEqual(201);
    });

    it('Търсенето трябва да филтрира рецепти без диета', async () => {
        const res = await request(app)
            .get('/api/recipes/search/advanced?diet=Без диета');
        
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

});