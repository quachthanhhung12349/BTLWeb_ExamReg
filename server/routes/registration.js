const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Exam = require('../models/Exam');
const Course = require('../models/Course');

//status
router.get('/status/:studentId', async (req, res) => {
    try {
        const student = await Student.findOne({ studentId: req.params.studentId });
        if (!student) return res.status(404).json({ message: "Không tìm thấy SV" });

        const courseDetails = await Course.find({ courseId: { $in: student.courses.map(c => c.courseId) } });

        const data = student.courses.map(course => {
            const detail = courseDetails.find(d => d.courseId === course.courseId);
            const isRegistered = student.registeredExams.some(re =>
                re.courseId && re.courseId.trim().toUpperCase() === course.courseId.trim().toUpperCase()
            );
            return {
                id: course._id,
                code: course.courseId,
                name: course.courseName,
                credits: detail ? detail.credits : 3,
                registered: isRegistered
            };
        });
        res.json(data);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// register
router.post('/register', async (req, res) => {
    const { studentId, courseId } = req.body;
    try {
        const student = await Student.findOne({ studentId });
        const exam = await Exam.findOne({ "sessions.course": new RegExp(courseId, 'i') });
        
        if (!exam) return res.status(404).json({ message: "Không tìm thấy lịch thi" });

        const session = exam.sessions.find(s => s.course.toUpperCase().includes(courseId.toUpperCase()));

        await Student.updateOne(
            { studentId },
            { $pull: { registeredExams: { courseId: courseId } } }
        );

        await Exam.updateOne(
            { _id: exam._id, "sessions._id": session._id },
            { $addToSet: { "sessions.$.registeredStudents": { studentId: student._id, studentName: student.name } } }
        );

        await Student.updateOne(
            { studentId },
            { $push: { registeredExams: { 
                examId: exam._id,
                examName: exam.examName,
                sessionId: session._id, 
                courseId: courseId,
                registerTime: new Date()
            } } }
        );

        res.json({ success: true, message: "Đăng ký thành công" });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// unregister
router.post('/unregister', async (req, res) => {
    const { studentId, courseId } = req.body;
    try {
        const student = await Student.findOne({ studentId });
        const reg = student.registeredExams.find(r => r.courseId === courseId);
        if (!reg) return res.status(400).json({ message: "Bạn chưa đăng ký môn này" });

        await Exam.updateOne(
            { _id: reg.examId, "sessions._id": reg.sessionId },
            { $pull: { "sessions.$.registeredStudents": { studentId: student._id } } }
        );

        await Student.updateOne(
            { studentId },
            { $pull: { registeredExams: { courseId: courseId } } }
        );

        res.json({ success: true, message: "Đã hủy đăng ký" });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// get data for exam slips
router.get('/exam-slips/:studentId', async (req, res) => {
    try {
        const student = await Student.findOne({ studentId: req.params.studentId });
        if (!student) return res.status(404).json({ message: "Không tìm thấy SV" });

        const slips = await Promise.all(student.registeredExams.map(async (reg) => {
            const exam = await Exam.findById(reg.examId).populate('sessions.roomId');
            if (!exam) return null;

            const session = exam.sessions.find(s => s._id.toString() === reg.sessionId.toString());
            if (!session) return null;

            const seatIdx = session.registeredStudents.findIndex(s => s.studentId.toString() === student._id.toString());
            const sbd = (seatIdx + 1).toString().padStart(2, '0');

            return {
                id: reg._id,
                examName: exam.examName,
                courseName: session.course,
                code: reg.courseId,
                date: new Date(session.examDate).toLocaleDateString('vi-VN'),
                time: `${new Date(session.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${new Date(session.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
                room: session.roomId ? session.roomId.room : "N/A",
                seat: sbd
            };
        }));

        res.json({
            studentInfo: { name: student.name, studentId: student.studentId, class: student.class, birthDate: student.birthDate ? new Date(student.birthDate).toLocaleDateString('vi-VN') : "N/A" },
            registeredExams: slips.filter(s => s !== null)
        });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;