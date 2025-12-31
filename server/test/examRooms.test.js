const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index'); 
require('dotenv').config();

const TEST_URI = process.env.MONGODB_URI;

describe('🏢 KIỂM THỬ MODULE PHÒNG THI (EXAM ROOMS)', () => {
    
    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(TEST_URI);
        }
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    let createdRoomId;
    const mockRoomId = `P_${Date.now().toString().slice(-4)}`;

    // --- CASE 1: TẠO PHÒNG ---
    describe('POST /api/admin/exam-rooms', () => {
        it('✅ Nên tạo phòng thi thành công', async () => {
            const res = await request(app).post('/api/admin/exam-rooms').send({
                roomId: mockRoomId,
                location: 'Nhà G2',
                capacity: 40,
                status: 'available'
            });

            if (res.statusCode !== 201 && res.statusCode !== 200) {
                console.log("❌ Lỗi POST Room:", res.body);
            }

            // Chấp nhận cả 200 và 201 tùy code cũ của bạn
            expect([200, 201]).toContain(res.statusCode);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.roomId).toBe(mockRoomId);
            
            createdRoomId = res.body._id;
        });

        it('❌ Nên báo lỗi 400 nếu thiếu Sức chứa', async () => {
            const res = await request(app).post('/api/admin/exam-rooms').send({
                roomId: 'ROOM_ERR',
                location: 'Test'
            });
            expect(res.statusCode).toEqual(400);
        });
    });

    // --- CASE 2: LẤY DANH SÁCH ---
    describe('GET /api/admin/exam-rooms', () => {
        it('✅ Nên trả về danh sách phòng', async () => {
            const res = await request(app).get('/api/admin/exam-rooms');
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    // --- CASE 3: LẤY CHI TIẾT ---
    describe('GET /api/admin/exam-rooms/:id', () => {
        it('✅ Nên trả về đúng phòng vừa tạo', async () => {
            if (!createdRoomId) return;
            const res = await request(app).get(`/api/admin/exam-rooms/${createdRoomId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body._id).toBe(createdRoomId);
        });
    });

    // --- CASE 4: SỬA PHÒNG ---
    describe('PUT /api/admin/exam-rooms/:id', () => {
        it('✅ Nên cập nhật Sức chứa thành công', async () => {
            if (!createdRoomId) return;
            const res = await request(app).put(`/api/admin/exam-rooms/${createdRoomId}`).send({
                capacity: 100,
                status: 'maintenance'
            });
            expect(res.statusCode).toEqual(200);
            expect(res.body.capacity).toBe(100);
            expect(res.body.status).toBe('maintenance');
        });
    });

    // --- CASE 5: XÓA PHÒNG ---
    describe('DELETE /api/admin/exam-rooms/:id', () => {
        it('✅ Nên xóa phòng thành công', async () => {
            if (!createdRoomId) return;
            const res = await request(app).delete(`/api/admin/exam-rooms/${createdRoomId}`);
            expect(res.statusCode).toEqual(200);
        });
    });
});