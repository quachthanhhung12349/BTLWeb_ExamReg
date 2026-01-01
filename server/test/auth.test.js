const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../index'); // Bạn cần export app từ index.js
require('dotenv').config();


describe('Auth API Testing', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI);
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    // Test Case 1: Đăng nhập thành công
    it('POST /api/auth/login - Should login successfully', async () => {
        const res = await request(app).post('/api/auth/login').send({
            username: 'admin',
            password: '123456'
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    // Test Case 2: Sai mật khẩu
    it('POST /api/auth/login - Should fail with wrong password', async () => {
        const res = await request(app).post('/api/auth/login').send({
            username: 'admin',
            password: 'wrongpassword'
        });
        expect(res.statusCode).toEqual(400);
    });

    // Test Case 3: Thiếu username
    it('POST /api/auth/login - Should fail with missing username', async () => {
        const res = await request(app).post('/api/auth/login').send({
            password: '123'
        });
        expect(res.statusCode).toEqual(400);
    });

    // Test Case 4: Thiếu password
    it('POST /api/auth/login - Should fail with missing password', async () => {
        const res = await request(app).post('/api/auth/login').send({
            username: 'admin'
        });
        expect(res.statusCode).toEqual(400);
    });
});