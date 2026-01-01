const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index'); 
require('dotenv').config();

const TEST_URI = process.env.MONGODB_URI; 

describe('📋 KIỂM THỬ MODULE QUẢN LÝ KỲ THI (EXAMS)', () => {
    
    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(TEST_URI);
        }
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    let createdExamId;
    
    const mockExamId = `T_${Date.now()}`; 

    // --- TEST CASE 1: TẠO KỲ THI (POST) ---
    describe('POST /api/exams', () => {
        
        it('✅ Nên tạo thành công khi dữ liệu hợp lệ', async () => {
            const res = await request(app).post('/api/exams').send({
                examId: mockExamId,
                examName: 'Kỳ Thi Test Jest',
                semester: '1',
                year: '2025-2026',
                startDate: '2025-06-01',
                endDate: '2025-06-15',
                description: 'Kỳ thi được tạo bởi Jest',
                status: 'upcoming'
            });

            // Log lỗi ra nếu có để dễ debug
            if (res.statusCode !== 200) {
                console.log("❌ Lỗi POST:", JSON.stringify(res.body, null, 2));
            }

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.exam).toHaveProperty('_id');
            expect(res.body.exam.examId).toBe(mockExamId);
            
            createdExamId = res.body.exam._id; 
        });

        it('❌ Nên báo lỗi 400 nếu thiếu trường bắt buộc (Mã kỳ thi)', async () => {
            const res = await request(app).post('/api/exams').send({
                examName: 'Kỳ thi thiếu ID',
                year: '2025-2026',
                startDate: '2025-06-01',
                endDate: '2025-06-15'
            });
            expect(res.statusCode).toEqual(400);
        });

        it('❌ Nên báo lỗi 400 nếu Ngày kết thúc trước Ngày bắt đầu', async () => {
            const res = await request(app).post('/api/exams').send({
                examId: `FAIL_${Date.now()}`,
                examName: 'Kỳ thi sai ngày',
                year: '2025-2026',
                startDate: '2025-06-10',
                endDate: '2025-06-01' 
            });
            expect(res.statusCode).toEqual(400);
        });

        it('❌ Nên báo lỗi 400 nếu Năm học sai định dạng', async () => {
            const res = await request(app).post('/api/exams').send({
                examId: `FAIL_Y_${Date.now()}`,
                examName: 'Kỳ thi sai năm',
                year: 'Năm nay', 
                startDate: '2025-06-01',
                endDate: '2025-06-15'
            });
            expect(res.statusCode).toEqual(400);
        });
    });

    // --- TEST CASE 2: LẤY DANH SÁCH (GET) ---
    describe('GET /api/exams', () => {
        it('✅ Nên trả về danh sách kỳ thi (Mảng)', async () => {
            const res = await request(app).get('/api/exams');
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.exams)).toBe(true);
        });
    });

    // --- TEST CASE 3: LẤY CHI TIẾT (GET ID) ---
    describe('GET /api/exams/:id', () => {
        it('✅ Nên trả về đúng kỳ thi vừa tạo', async () => {
            if (!createdExamId) return console.log('⚠️ Skip GET detail test vì tạo thất bại');

            const res = await request(app).get(`/api/exams/${createdExamId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.exam._id).toBe(createdExamId);
        });

        it('❌ Nên trả về 404 nếu ID không tồn tại', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app).get(`/api/exams/${fakeId}`);
            expect(res.statusCode).toEqual(404);
        });
    });

    // --- TEST CASE 4: CẬP NHẬT (PUT) ---
    describe('PUT /api/exams/:id', () => {
        it('✅ Nên cập nhật Tên và Trạng thái thành công', async () => {
            if (!createdExamId) return;

            const res = await request(app).put(`/api/exams/${createdExamId}`).send({
                examName: 'Kỳ Thi Đã Cập Nhật (Jest)',
                status: 'active'
            });

            expect(res.statusCode).toEqual(200);
            const updatedName = res.body.examName || res.body.name; 
            expect(updatedName).toBe('Kỳ Thi Đã Cập Nhật (Jest)');
            expect(res.body.status).toBe('active');
        });
    });

    // --- TEST CASE 5: XÓA (DELETE) ---
    describe('DELETE /api/exams/:id', () => {
        it('✅ Nên xóa kỳ thi thành công', async () => {
            if (!createdExamId) return;

            const res = await request(app).delete(`/api/exams/${createdExamId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
        });

        it('🔍 Kiểm tra lại: Kỳ thi phải không còn tồn tại', async () => {
            if (!createdExamId) return;

            const res = await request(app).get(`/api/exams/${createdExamId}`);
            expect(res.statusCode).toEqual(404);
        });
    });
});