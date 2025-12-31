const express = require('express');
const router = express.Router();
const CourseStudent = require('../models/CourseStudent');

// 1. Lấy danh sách theo học phần
router.get('/', async (req, res) => {
    const { courseId } = req.query;
    try {
        const list = await CourseStudent.find({ courseId }).sort({ studentId: 1 });
        res.json({ success: true, list });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. Cập nhật trạng thái thi
router.put('/:id', async (req, res) => {
    const { metCondition, note } = req.body;
    try {
        const updated = await CourseStudent.findByIdAndUpdate(
            req.params.id,
            { metCondition, note },
            { new: true }
        );
        res.json({ success: true, updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;