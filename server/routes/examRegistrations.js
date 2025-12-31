const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Student = require('../models/Student');
const Exam = require('../models/Exam');
const Course = require('../models/Course');

// [GET] /api/exam-registrations/status/:studentId
// Tương ứng: "Huỷ đăng ký thi" (để lấy trạng thái hiện tại trước khi huỷ/đăng ký)
router.get('/status/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findOne({ studentId });
        if (!student) return res.status(404).json({ message: "Không tìm thấy SV" });

        const studentCourseIds = student.courses.map(c => c.courseId);

        const allExams = await Exam.find({}).populate('sessions.roomId');
        const allCourses = await Course.find({});

        let availableSessions = [];

        allExams.forEach(exam => {
            exam.sessions.forEach(session => {
                const courseCode = session.course.split(' - ')[0].trim();

                if (studentCourseIds.includes(courseCode)) {
                    const originalCourse = allCourses.find(c => c.courseId === courseCode);
                    
                    const sessionsOfThisCourse = exam.sessions.filter(s => s.course.startsWith(courseCode));
                    const sessionCount = sessionsOfThisCourse.length;

                    const totalEnrolled = originalCourse ? originalCourse.currentEnrollment : 0;
                    const baseLimit = Math.ceil(totalEnrolled / sessionCount);
                    const roundedLimit = Math.ceil(baseLimit / 10) * 10;

                    const roomCapacity = session.roomId ? session.roomId.maxStudents : 999;
                    const finalMaxDisplay = Math.min(roundedLimit, roomCapacity);

                    const isRegisteredThisSession = student.registeredExams.some(
                        re => re.sessionId.toString() === session._id.toString()
                    );
                    const isRegisteredOtherSession = student.registeredExams.some(
                        re => re.courseId === courseCode && re.sessionId.toString() !== session._id.toString()
                    );

                    const cleanName = session.course.includes(' - ') 
                        ? session.course.split(' - ').slice(1).join(' - ').trim() 
                        : session.course;

                    availableSessions.push({
                        sessionId: session._id,
                        courseId: courseCode,
                        name: cleanName,
                        credits: originalCourse ? originalCourse.credits : 0,
                        examDate: session.examDate,
                        startTime: session.startTime,
                        room: session.roomId ? session.roomId.room : "N/A",
                        maxStudents: finalMaxDisplay, 
                        registeredCount: session.registeredStudents.length,
                        registered: isRegisteredThisSession,
                        disabled: isRegisteredOtherSession || session.registeredStudents.length >= finalMaxDisplay
                    });
                }
            });
        });

        res.json(availableSessions);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server: " + error.message });
    }
});

// [POST] /api/exam-registrations
// Tương ứng: "Đăng ký thi" và logic "Huỷ đăng ký" 
router.post('/', async (req, res) => {
    const { studentId, courseId, sessionId, action } = req.body;
    try {
        const student = await Student.findOne({ studentId });
        const exam = await Exam.findOne({ "sessions._id": sessionId });
        const session = exam.sessions.id(sessionId);

        if (action === 'unregister') {
            await Exam.updateOne(
                { _id: exam._id, "sessions._id": sessionId },
                { $pull: { "sessions.$.registeredStudents": { studentId: student._id } } }
            );
            await Student.updateOne({ studentId }, { $pull: { registeredExams: { sessionId: new mongoose.Types.ObjectId(sessionId) } } });
            return res.json({ success: true, message: "Đã hủy đăng ký" });
        }

        const room = await mongoose.model('ExamRoom').findById(session.roomId);
        if (session.registeredStudents.length >= room.maxStudents) {
            return res.status(400).json({ message: "Ca thi đã đầy sinh viên" });
        }

        await Exam.updateOne(
            { _id: exam._id, "sessions._id": sessionId },
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
        const course = await Course.findOne({ courseId: req.params.courseId })
            .populate('enrolledStudents.studentId') 
            .lean();
        
        if (!course) return res.status(404).json({ message: "Không tìm thấy môn học" });

        if (course.enrolledStudents) {
            course.enrolledStudents = course.enrolledStudents.map(st => ({
                ...st,
                studentId: st.studentId ? st.studentId.studentId : "N/A" 
            }));
        }

        const rawName = course.courseName || "";
        course.courseName = rawName.includes(' - ') ? rawName.split(' - ').slice(1).join(' - ').trim() : rawName;

        res.json(course);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
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
                regId: reg._id.toString(), 
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

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "Mật khẩu mới phải có ít nhất 6 ký tự!"
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