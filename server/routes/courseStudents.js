const express = require('express');
const router = express.Router();
const CourseStudent = require('../models/CourseStudent');

// 1. Lấy danh sách sinh viên theo Môn học
// GET /api/course-students?courseId=INT3306
router.get('/', async (req, res) => {
    const { courseId } = req.query;
    try {
        let query = {};
        if (courseId) {
            query.courseId = { $regex: courseId, $options: 'i' }; // Tìm gần đúng
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

// 3. (Tạm thời) API tạo dữ liệu mẫu để test
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