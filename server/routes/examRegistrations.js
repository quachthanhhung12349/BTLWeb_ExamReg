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

            const rawName = studentCourse.courseName || "";
            const cleanName = rawName.includes(' - ') 
                ? rawName.split(' - ').slice(1).join(' - ').trim() 
                : rawName;
            return {
                id: studentCourse._id,
                code: studentCourse.courseId,
                name: cleanName,             
                credits: originalCourse ? originalCourse.credits : 0, 
                registered: isRegistered
            };
        });

        res.json(subjectsWithCredits);
    } catch (error) { 
        res.status(500).json({ message: "Lỗi server: " + error.message }); 
    }
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
            $push: {
                registeredExams: {
                    examId: exam._id, examName: exam.examName, sessionId: session._id, courseId, registerTime: new Date()
                }
            }
        });
        res.json({ success: true, message: "Đăng ký thành công" });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// [GET] /api/exam-registrations/subjects
router.get('/subjects', async (req, res) => {
    try {
        const [allCourses, allExams] = await Promise.all([
            Course.find({}),
            Exam.find({}).populate('sessions.roomId')
        ]);

        const result = allCourses.map(course => {
            let examSession = null;
            allExams.forEach(exam => {
                const found = exam.sessions.find(s => s.course.includes(course.courseId));
                if (found) examSession = found;
            });

            // Loại bỏ phần mã môn học ở đầu tên môn
            const rawName = course.courseName || "";
            const cleanName = rawName.includes(' - ') ? rawName.split(' - ').pop().trim() : rawName;

            return {
                courseId: course.courseId,
                courseName: cleanName,
                credits: course.credits || 4,
                professor: course.professor || "N/A",
                studentCount: course.enrolledStudents?.length || 0,
                examTime: examSession ? new Date(examSession.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : "N/A",
                examDate: examSession ? new Date(examSession.examDate).toLocaleDateString('vi-VN') : "N/A",
                room: examSession?.roomId?.room || "N/A"
            };
        });

        res.json(result);
    } catch (e) {
        res.status(500).json({ message: "Lỗi server: " + e.message });
    }
});

// [GET] /api/exam-registrations/all-courses
router.get('/all-courses', async (req, res) => {
    try {
        const allCourses = await Course.find({}).lean(); 
        
        const result = allCourses.map(course => {
            const rawName = course.courseName || "";
            const cleanName = rawName.includes(' - ') ? rawName.split(' - ').slice(1).join(' - ').trim() : rawName;

            return {
                courseId: course.courseId,
                courseName: cleanName,
                professor: course.professor || "Giảng viên chưa cập nhật",
                credits: course.credits || 3
            };
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
});

// [GET] /api/exam-registrations/details/:courseId
// Lấy chi tiết 1 môn học (để modal hiển thị)
router.get('/details/:courseId', async (req, res) => {
    try {
        const course = await Course.findOne({ courseId: req.params.courseId }).lean();
        
        if (!course) return res.status(404).json({ message: "Không tìm thấy môn học" });

        const rawName = course.courseName || "";
        course.courseName = rawName.includes(' - ') ? rawName.split(' - ').slice(1).join(' - ').trim() : rawName;

        res.json(course);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
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
                time: `${new Date(session.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
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
router.get('/:regId/download-info', async (req, res) => {
    try {
        const { regId } = req.params;

        const student = await Student.findOne({ "registeredExams._id": regId });
        if (!student) return res.status(404).json({ message: "Không tìm thấy thông tin đăng ký" });

        const reg = student.registeredExams.id(regId);

        const exam = await Exam.findById(reg.examId).populate('sessions.roomId');
        const session = exam.sessions.id(reg.sessionId);

        const seatIdx = session.registeredStudents.findIndex(
            s => s.studentId.toString() === student._id.toString()
        );

        res.json({
            studentInfo: {
                name: student.name,
                studentId: student.studentId,
                class: student.class,
                birthDate: student.birthDate ? new Date(student.birthDate).toLocaleDateString('vi-VN') : "N/A"
            },
            examInfo: {
                examName: exam.examName,
                courseName: reg.courseId + " - " + reg.examName,
                date: new Date(session.examDate).toLocaleDateString('vi-VN'),
                time: `${new Date(session.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
                room: session.roomId ? session.roomId.room : "N/A",
                campus: session.roomId ? session.roomId.campus : "N/A",
                seat: (seatIdx + 1).toString().padStart(2, '0')
            }
        });
    } catch (e) {
        res.status(500).json({ message: "Lỗi Server: " + e.message });
    }
});

const bcrypt = require('bcrypt');

// [PUT] /api/exam-registrations/users/:id/password
router.put('/users/:id/password', async (req, res) => {
    try {
        const { id } = req.params;
        const { oldPassword, newPassword } = req.body;

        const student = await Student.findOne({ studentId: id });
        if (!student) {
            return res.status(404).json({ message: "Không tìm thấy sinh viên" });
        }
        // Kiểm tra mật khẩu cũ
        if (student.account.password !== oldPassword) {
            return res.status(400).json({ message: "Mật khẩu cũ không chính xác" });
        }

        if (newPassword === oldPassword) {
            return res.status(400).json({
                message: "Mật khẩu mới không được trùng với mật khẩu cũ!"
            });
        }

        const result = await Student.findOneAndUpdate(
            { studentId: id },
            { $set: { "account.password": newPassword } },
            { new: true }
        );

        if (result) {
            console.log(`Đã cập nhật mật khẩu cho SV ${id} thành: ${newPassword}`);
            res.json({ success: true, message: "Đổi mật khẩu thành công" });
        } else {
            res.status(500).json({ message: "Không thể cập nhật dữ liệu vào database" });
        }

    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
    }
});

module.exports = router;