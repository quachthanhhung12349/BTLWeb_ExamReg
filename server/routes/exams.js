const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Import mongoose để check ID
const Exam = require('../models/Exam'); 

// 1. Lấy danh sách tất cả kỳ thi
// GET /api/exams
router.get('/', async (req, res) => {
    try {
        const exams = await Exam.find().sort({ createdAt: -1 });
        res.json({ success: true, exams });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// 2. Lấy chi tiết 1 kỳ thi (kèm các ca thi)
// GET /api/exams/:id
router.get('/:id', async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ success: false, message: 'Không tìm thấy kỳ thi' });
        res.json({ success: true, exam });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// 3. Tạo kỳ thi mới
// POST /api/exams
router.post('/', async (req, res) => {
    const { examId, examName, startDate, endDate } = req.body;

    if (!examId || !examName || !startDate || !endDate) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
    }

    try {
        const existingExam = await Exam.findOne({ examId });
        if (existingExam) {
            return res.status(400).json({ success: false, message: 'Mã kỳ thi đã tồn tại' });
        }

        const newExam = new Exam({
            examId,
            examName,
            startDate,
            endDate,
            sessions: []
        });

        await newExam.save();
        res.json({ success: true, message: 'Tạo thành công', exam: newExam });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// 4. Xóa kỳ thi
// DELETE /api/exams/:id
router.delete('/:id', async (req, res) => {
    try {
        await Exam.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Đã xóa kỳ thi' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// ==========================================
// PHẦN QUAN TRỌNG: XỬ LÝ CA THI (SESSIONS)
// ==========================================

// 5. Thêm Ca thi vào Kỳ thi (ĐÃ FIX LỖI TIME & ROOMID)
// POST /api/exams/:id/sessions
router.post('/:id/sessions', async (req, res) => {
    const { course, examDate, startTime, endTime, roomId } = req.body;

    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ success: false, message: 'Không tìm thấy kỳ thi' });

        // --- FIX LỖI 1: DATE ---
        // Ghép ngày + giờ thành đối tượng Date chuẩn
        // Ví dụ: "2026-01-05T09:00:00"
        const startDateTime = new Date(`${examDate}T${startTime}`);
        const endDateTime = new Date(`${examDate}T${endTime}`);

        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
            return res.status(400).json({ success: false, message: 'Định dạng ngày giờ không hợp lệ' });
        }

        // --- FIX LỖI 2: ROOM ID ---
        // Nếu roomId là tên phòng (VD: "302-G2"), nó không phải ObjectId -> Gán null
        let validRoomId = null;
        if (roomId && mongoose.Types.ObjectId.isValid(roomId)) {
            validRoomId = roomId;
        }

        const newSession = {
            course,
            examDate,
            startTime: startDateTime, // Lưu Date object
            endTime: endDateTime,     // Lưu Date object
            roomId: validRoomId       // Lưu ID hoặc null
        };

        exam.sessions.push(newSession);
        await exam.save();

        res.json({ success: true, message: 'Thêm ca thi thành công', sessions: exam.sessions });
    } catch (error) {
        console.error('Lỗi thêm ca thi:', error); // Log lỗi ra terminal
        res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
    }
});

// 6. Xóa Ca thi
// DELETE /api/exams/:examId/sessions/:sessionId
router.delete('/:examId/sessions/:sessionId', async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.examId);
        if (!exam) return res.status(404).json({ success: false, message: 'Không tìm thấy kỳ thi' });

        // Lọc bỏ ca thi có _id trùng với sessionId
        exam.sessions = exam.sessions.filter(s => s._id.toString() !== req.params.sessionId);
        
        await exam.save();
        res.json({ success: true, message: 'Đã xóa ca thi', sessions: exam.sessions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

module.exports = router;