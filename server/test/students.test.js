const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
require('dotenv').config();

const TEST_URI = process.env.MONGODB_URI;

describe('📋 KIỂM THỬ MODULE QUẢN LÝ SINH VIÊN (STUDENTS)', () => {
    
    // 1. Kết nối DB
    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(TEST_URI);
        }
    });

    // 2. Ngắt kết nối
    afterAll(async () => {
        await mongoose.connection.close();
    });

    let createdStudentId;
    const mockStudentId = `SV_TEST_${Date.now().toString().slice(-6)}`;

    // --- TEST CASE 1: TẠO SINH VIÊN (POST) ---
    describe('POST /api/admin/students', () => {
        
        it('✅ Nên tạo thành công khi dữ liệu hợp lệ', async () => {
            const res = await request(app).post('/api/admin/students').send({
                studentId: mockStudentId,
                name: 'Nguyễn Văn Test',
                email: `${mockStudentId}@vnu.edu.vn`,
                class: 'QH-2024-I/CQ',
                birthDate: '2003-01-01',
                eligibleForExam: true
            });

            if (res.statusCode !== 201) {
                console.log("❌ Lỗi POST Student:", res.body);
            }

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.studentId).toBe(mockStudentId);
            
            createdStudentId = res.body._id; // Lưu ID để test bước sau
        });

        it('❌ Nên báo lỗi 400 nếu thiếu Tên sinh viên', async () => {
            const res = await request(app).post('/api/admin/students').send({
                studentId: `FAIL_${Date.now()}`,
                email: 'fail@test.com'
            });
            expect(res.statusCode).toEqual(400); // Lỗi từ Validation
        });

        it('❌ Nên báo lỗi 400 nếu Email không đúng định dạng', async () => {
            const res = await request(app).post('/api/admin/students').send({
                studentId: `FAIL_EMAIL_${Date.now()}`,
                name: 'Test Email Sai',
                email: 'email_khong_hop_le' // Sai format
            });
            expect(res.statusCode).toEqual(400);
        });

        it('❌ Nên báo lỗi 409 nếu Email đã tồn tại', async () => {
            const res = await request(app).post('/api/admin/students').send({
                studentId: `DUP_${Date.now()}`,
                name: 'Sinh Viên Trùng Email',
                email: `${mockStudentId}@vnu.edu.vn`, // Email đã tạo ở test case 1
                class: 'K66'
            });
            expect(res.statusCode).toEqual(409); // Conflict
        });
    });

    // --- TEST CASE 2: LẤY DANH SÁCH (GET) ---
    describe('GET /api/admin/students', () => {
        it('✅ Nên trả về danh sách sinh viên', async () => {
            const res = await request(app).get('/api/admin/students');
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });
    });

    // --- TEST CASE 3: LẤY CHI TIẾT (GET ID) ---
    describe('GET /api/admin/students/:id', () => {
        it('✅ Nên trả về đúng sinh viên vừa tạo', async () => {
            if (!createdStudentId) return;

            const res = await request(app).get(`/api/admin/students/${createdStudentId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body._id).toBe(createdStudentId);
            expect(res.body.name).toBe('Nguyễn Văn Test');
        });

        it('❌ Nên trả về 404 nếu ID không tồn tại', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app).get(`/api/admin/students/${fakeId}`);
            expect(res.statusCode).toEqual(404);
        });
    });

    // --- TEST CASE 4: CẬP NHẬT (PUT) ---
    describe('PUT /api/admin/students/:id', () => {
        it('✅ Nên cập nhật Tên và Lớp thành công', async () => {
            if (!createdStudentId) return;

            const res = await request(app).put(`/api/admin/students/${createdStudentId}`).send({
                name: 'Nguyễn Văn Đã Sửa',
                class: 'K67-CLC'
            });

            expect(res.statusCode).toEqual(200);
            expect(res.body.name).toBe('Nguyễn Văn Đã Sửa');
            expect(res.body.class).toBe('K67-CLC');
        });
    });

    // --- TEST CASE 5: XÓA (DELETE) ---
    describe('DELETE /api/admin/students/:id', () => {
        it('✅ Nên xóa sinh viên thành công', async () => {
            if (!createdStudentId) return;

            const res = await request(app).delete(`/api/admin/students/${createdStudentId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe('Deleted');
        });

        it('🔍 Kiểm tra lại: Sinh viên phải không còn tồn tại', async () => {
            if (!createdStudentId) return;

            const res = await request(app).get(`/api/admin/students/${createdStudentId}`);
            expect(res.statusCode).toEqual(404);
        });
    });
});