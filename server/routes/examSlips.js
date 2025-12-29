const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Exam = require('../models/Exam');

router.get('/:studentId', async (req, res) => {
    try {
        const student = await Student.findOne({ studentId: req.params.studentId });
        if (!student) return res.status(404).json({ message: "SV không tồn tại" });

        const slips = await Promise.all(student.registeredExams.map(async (reg) => {
            const exam = await Exam.findById(reg.examId).populate('sessions.roomId');
            
            let currentExam = exam;
            if (!currentExam) {
                currentExam = await Exam.findOne({ examName: reg.examName }).populate('sessions.roomId');
            }
            
            if (!currentExam) return null;

            let session = currentExam.sessions.find(s => 
                s._id.equals(reg.sessionId) || 
                (s.course && s.course.includes(reg.courseId))
            );

            if (!session) return null;

            const seatIdx = session.registeredStudents.findIndex(s => 
                s.studentId.toString() === student._id.toString()
            );
            const sbd = (seatIdx + 1).toString().padStart(2, '0');

            return {
                id: reg._id,
                examName: currentExam.examName,
                courseName: session.course,
                code: reg.courseId,
                date: new Date(session.examDate).toLocaleDateString('vi-VN'),
                time: `${new Date(session.startTime).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})} - ${new Date(session.endTime).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}`,
                room: session.roomId ? session.roomId.room : "N/A",
                campus: session.roomId ? session.roomId.campus : "N/A", 
                seat: sbd
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
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

module.exports = router;