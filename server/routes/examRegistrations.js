const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Student = require('../models/Student');
const Exam = require('../models/Exam');
const Course = require('../models/Course');

// 1. [GET] /api/exam-registrations/status/:studentId
// Tương ứng: "Huỷ đăng ký thi" (để lấy trạng thái hiện tại trước khi huỷ/đăng ký)
router.get('/status/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findOne({ studentId });
        if (!student) return res.status(404).json({ message: "Không tìm thấy SV" });

        const allCourses = await Course.find({});
        const subjectsWithCredits = student.courses.map(studentCourse => {
            const originalCourse = allCourses.find(c => c.courseId === studentCourse.courseId);
            const isRegistered = student.registeredExams.some(re => re.courseId === studentCourse.courseId);
            return {
                id: studentCourse._id,
                code: studentCourse.courseId,
                name: studentCourse.courseName,
                credits: originalCourse ? originalCourse.credits : 0,
                registered: isRegistered
            };
        });
        res.json(subjectsWithCredits);
    } catch (error) { res.status(500).json({ message: "Lỗi server" }); }
});

// 2. [POST] /api/exam-registrations
// Tương ứng: "Đăng ký thi" và logic "Huỷ đăng ký" (Nếu bạn dùng chung 1 route xử lý)
router.post('/', async (req, res) => {
    const { studentId, courseId, action } = req.body; // action: 'register' | 'unregister'
    try {
        const student = await Student.findOne({ studentId });
        if (action === 'unregister') {
            const reg = student.registeredExams.find(r => r.courseId === courseId);
            await Exam.updateOne(
                { _id: reg.examId, "sessions._id": reg.sessionId },
                { $pull: { "sessions.$.registeredStudents": { studentId: student._id } } }
            );
            await Student.updateOne({ studentId }, { $pull: { registeredExams: { courseId } } });
            return res.json({ success: true, message: "Đã hủy đăng ký" });
        }
        
        // Logic Register
        const exam = await Exam.findOne({ "sessions.course": new RegExp(courseId, 'i') });
        const session = exam.sessions.find(s => s.course.toUpperCase().includes(courseId.toUpperCase()));
        
        await Exam.updateOne(
            { _id: exam._id, "sessions._id": session._id },
            { $addToSet: { "sessions.$.registeredStudents": { studentId: student._id, studentName: student.name } } }
        );
        await Student.updateOne({ studentId }, { 
            $push: { registeredExams: { 
                examId: exam._id, examName: exam.examName, sessionId: session._id, courseId, registerTime: new Date() 
            } } 
        });
        res.json({ success: true, message: "Đăng ký thành công" });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// [GET] /api/exam-registrations/subjects/:studentId
// MÀN HÌNH 2: Hiển thị danh sách môn SV phải thi
router.get('/subjects/:studentId', async (req, res) => {
    try {
        const student = await Student.findOne({ studentId: req.params.studentId });
        if (!student) return res.status(404).json({ message: "Không tìm thấy SV" });

        const allCourses = await Course.find({});
        const result = student.courses.map(sc => {
            const c = allCourses.find(item => item.courseId === sc.courseId);
            return {
                courseId: sc.courseId,
                courseName: sc.courseName,
                professor: c?.professor || "Chưa cập nhật",
                credits: c?.credits || 3
            };
        });
        res.json(result);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// [GET] /api/exam-registrations/:studentId/view-slips
router.get('/:studentId/view-slips', async (req, res) => {
    try {
        const student = await Student.findOne({ studentId: req.params.studentId });
        if (!student) return res.status(404).json({ message: "Không tìm thấy SV" });

        const slips = await Promise.all(student.registeredExams.map(async (reg) => {
            const exam = await Exam.findById(reg.examId).populate('sessions.roomId');
            if (!exam) return null;
            const session = exam.sessions.find(s => s._id.toString() === reg.sessionId.toString());
            if (!session) return null;
            
            const fullCourseName = session.course || "";
            const cleanName = fullCourseName.split(' - ').pop(); 

            const seatIdx = session.registeredStudents.findIndex(s => s.studentId.toString() === student._id.toString());
            
            return {
                regId: reg._id.toString(), // Đảm bảo chuyển về string để so sánh
                examName: exam.examName,
                courseName: cleanName,
                code: reg.courseId,
                date: new Date(session.examDate).toLocaleDateString('vi-VN'),
                time: `${new Date(session.startTime).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}`,
                room: session.roomId ? session.roomId.room : "N/A",
                campus: session.roomId ? session.roomId.campus : "N/A",
                seat: (seatIdx + 1).toString().padStart(2, '0')
            };
        }));

        res.json({
            studentInfo: { 
                name: student.name, 
                studentId: student.studentId, 
                class: student.class, 
                // FIX: Định dạng lại ngày sinh tại đây
                birthDate: student.birthDate ? new Date(student.birthDate).toLocaleDateString('vi-VN') : "N/A" 
            },
            registeredExams: slips.filter(s => s !== null)
        });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// [GET] /api/exam-registrations/:regId/download-info
// MÀN HÌNH 3 (Giai đoạn 2): Khi ấn nút Tải về/In, lấy dữ liệu chi tiết hoặc render PDF
router.get('/:regId/download-info', async (req, res) => {
    try {
        const { regId } = req.params;
        // Logic tìm kiếm thông tin cực kỳ chi tiết của 1 bản đăng ký duy nhất dựa trên regId
        // Dùng để tạo file PDF hoặc định dạng in ấn chuyên nghiệp
        res.json({ message: "Dữ liệu chi tiết phục vụ download/in", id: regId });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/all-courses', async (req, res) => {
    try {
        const allCourses = await Course.find({});
        const result = allCourses.map(course => ({
            courseId: course.courseId,
            courseName: course.courseName,
            professor: course.professor || "Giảng viên chưa cập nhật",
            credits: course.credits || 3
        }));
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống khi lấy toàn bộ môn học" });
    }
});

// [GET] /api/exam-registrations/details/:courseId
// Lấy chi tiết 1 môn học (để modal hiển thị)
router.get('/details/:courseId', async (req, res) => {
    try {
        const course = await Course.findOne({ courseId: req.params.courseId });
        if (!course) return res.status(404).json({ message: "Không tìm thấy môn học" });
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
});


module.exports = router;