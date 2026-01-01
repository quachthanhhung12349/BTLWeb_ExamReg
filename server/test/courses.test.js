const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index'); 
require('dotenv').config();

const TEST_URI = process.env.MONGODB_URI;

describe('📚 KIỂM THỬ MODULE QUẢN LÝ MÔN HỌC (COURSES)', () => {
    
    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(TEST_URI);
        }
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    let createdCourseId;
    const mockCourseId = `INT_${Date.now().toString().slice(-4)}`;

    // --- CASE 1: TẠO MÔN HỌC ---
    describe('POST /api/admin/courses', () => {
        
        it('✅ Nên tạo môn học thành công', async () => {
            const res = await request(app).post('/api/admin/courses').send({
                courseId: mockCourseId,
                courseName: 'Lập trình Web Test',
                credits: 3,
                maxStudents: 60,
                professor: 'TS. Test'
            });

            if (res.statusCode !== 201) {
                console.log("❌ Lỗi POST Course:", res.body);
            }

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.courseId).toBe(mockCourseId);
            
            createdCourseId = res.body._id;
        });

        it('❌ Nên báo lỗi 400 nếu thiếu Mã môn', async () => {
            const res = await request(app).post('/api/admin/courses').send({
                courseName: 'Môn Thiếu ID'
            });
            expect(res.statusCode).toEqual(400);
        });
    });

    // --- CASE 2: LẤY DANH SÁCH ---
    describe('GET /api/admin/courses', () => {
        it('✅ Nên trả về danh sách môn học', async () => {
            const res = await request(app).get('/api/admin/courses');
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });
    });

    // --- CASE 3: LẤY CHI TIẾT ---
    describe('GET /api/admin/courses/:id', () => {
        it('✅ Nên trả về đúng môn học vừa tạo', async () => {
            if (!createdCourseId) return;
            const res = await request(app).get(`/api/admin/courses/${createdCourseId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body._id).toBe(createdCourseId);
        });
    });

    // --- CASE 4: SỬA MÔN HỌC ---
    describe('PUT /api/admin/courses/:id', () => {
        it('✅ Nên cập nhật Tên môn thành công', async () => {
            if (!createdCourseId) return;
            const res = await request(app).put(`/api/admin/courses/${createdCourseId}`).send({
                courseName: 'Lập trình Web Nâng Cao'
            });
            expect(res.statusCode).toEqual(200);
            expect(res.body.courseName).toBe('Lập trình Web Nâng Cao');
        });
    });

    // --- CASE 5: XÓA MÔN HỌC ---
    describe('DELETE /api/admin/courses/:id', () => {
        it('✅ Nên xóa môn học thành công', async () => {
            if (!createdCourseId) return;
            const res = await request(app).delete(`/api/admin/courses/${createdCourseId}`);
            expect(res.statusCode).toEqual(200);
        });
    });
});