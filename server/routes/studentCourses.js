const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

router.get('/all', async (req, res) => {
    try {
        // Kiểm tra xem Model Course có đang kết nối đúng không
        const count = await Course.countDocuments();
        console.log(`[DEBUG] Số lượng bản ghi tìm thấy trong DB: ${count}`);

        const allCourses = await Course.find({});
        console.log(`[DEBUG] Dữ liệu thô:`, allCourses);

        const result = allCourses.map(course => ({
            courseId: course.courseId,
            courseName: course.courseName,
            professor: course.professor || "Giảng viên chưa cập nhật",
            credits: course.credits || 3
        }));

        res.json(result);
    } catch (error) {
        console.error("Lỗi:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
});

router.get('/details/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findOne({ courseId: courseId });
        
        if (!course) {
            return res.status(404).json({ message: "Không tìm thấy thông tin môn học" });
        }

        // Trả về toàn bộ object course (bao gồm schedule và enrolledStudents)
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
});

module.exports = router;