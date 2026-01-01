const express = require('express');
const router = express.Router();
const CourseStudent = require('../models/CourseStudent');

// Thêm vào server/routes/courseStudents.js
router.get('/all', async (req, res) => {
    try {
        // Lấy toàn bộ danh sách để hiển thị mặc định
        const list = await CourseStudent.find().sort({ createdAt: -1 });
        res.json({ success: true, list });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 1. Lấy danh sách sinh viên theo Môn học
// GET /api/course-students?courseId=INT3306
router.get('/', async (req, res) => {
    const { courseId, studentId } = req.query;
    try {
        // If no parameters provided, return empty list instead of error
        if (!courseId && !studentId) {
            return res.json({ success: true, list: [] });
        }
        
        let query = {};
        if (courseId) {
            query.courseId = { $regex: courseId, $options: 'i' }; // Tìm gần đúng
        }
        if (studentId) {
            query.studentId = { $regex: studentId, $options: 'i' }; // Tìm gần đúng
        }
        
        // Lấy danh sách và populate thông tin chi tiết (nếu cần join bảng Student)
        // Tạm thời lấy dữ liệu thô
        const list = await CourseStudent.find(query).sort({ studentId: 1 });
        res.json({ success: true, list });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// 2. Cập nhật trạng thái Đủ điều kiện thi
// PUT /api/course-students/:id
router.put('/:id', async (req, res) => {
    const { metCondition } = req.body; // Gửi lên true hoặc false
    try {
        const updated = await CourseStudent.findByIdAndUpdate(
            req.params.id,
            { metCondition },
            { new: true }
        );
        if (!updated) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
        
        res.json({ success: true, message: 'Cập nhật thành công', data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// 3. Thêm học phần cho sinh viên
// POST /api/course-students
router.post('/', async (req, res) => {
    try {
        const { studentId, courseId } = req.body;
        if (!studentId || !courseId) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin sinh viên hoặc học phần' });
        }
        
        // Kiểm tra xem sinh viên đã có học phần này chưa
        const existing = await CourseStudent.findOne({ studentId, courseId });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Sinh viên đã đăng ký học phần này' });
        }
        
        const newItem = new CourseStudent({ studentId, courseId });
        await newItem.save();
        res.json({ success: true, data: newItem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. Xóa học phần của sinh viên
// DELETE /api/course-students?studentId=21020345&courseId=INT3306
router.delete('/', async (req, res) => {
    const { studentId, courseId } = req.query;
    try {
        if (!studentId || !courseId) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin sinh viên hoặc học phần' });
        }
        
        const result = await CourseStudent.findOneAndDelete({ studentId, courseId });
        if (!result) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bản ghi' });
        }
        
        res.json({ success: true, message: 'Xóa thành công', data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 5. (Tạm thời) API tạo dữ liệu mẫu để test
// POST /api/course-students/seed
router.post('/seed', async (req, res) => {
    try {
        const { studentId, courseId } = req.body;
        const newItem = new CourseStudent({ studentId, courseId });
        await newItem.save();
        res.json({ success: true, data: newItem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;