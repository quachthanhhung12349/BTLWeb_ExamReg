const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Exam = require('../models/Exam'); 
const validate = require('../middleware/validate');
const { createExamSchema, updateExamSchema } = require('../validations/examValidation');

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

// GET /api/exams/:id
router.get('/:id', async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ success: false, message: 'Không tìm thấy kỳ thi' });
        
        const result = exam.toObject();

        if (!result.name && result.examName) {
            result.name = result.examName;
        }
        
        if (!result.year && result.startDate) {
            result.year = new Date(result.startDate).getFullYear().toString();
        }

        res.json({ success: true, exam: result }); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// POST /api/exams
router.post('/', validate(createExamSchema), async (req, res) => {
    // Nhận tất cả các trường
    const { 
        examId, examName, name, 
        startDate, endDate, 
        semester, year, description, status 
    } = req.body;

    const finalName = name || examName;

    if (!examId || !finalName || !startDate || !endDate) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
    }

    try {
        const existingExam = await Exam.findOne({ examId });
        if (existingExam) {
            return res.status(400).json({ success: false, message: 'Mã kỳ thi đã tồn tại' });
        }

        const newExam = new Exam({
            examId,
            examName: finalName,
            startDate,
            endDate,
            semester: semester || '1',
            year: year || new Date(startDate).getFullYear().toString(),
            description: description || '',
            status: status || 'active',
            sessions: []
        });

        await newExam.save();
        res.json({ success: true, message: 'Tạo thành công', exam: newExam });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// PUT /api/exams/:id
router.put('/:id', validate(updateExamSchema), async (req, res) => {
  try {
    // 1. Sao chép toàn bộ dữ liệu gửi lên
    let updateData = { ...req.body };

    // 2. Xử lý logic tên (ưu tiên 'name' chuyển thành 'examName')
    if (updateData.name) {
        updateData.examName = updateData.name;
        delete updateData.name; // Xóa trường thừa
    }

    // 3. Cập nhật (Mongoose tự động bỏ qua các trường không có trong Schema)
    const updatedExam = await Exam.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true } // Trả về dữ liệu mới nhất sau khi sửa
    );

    if (!updatedExam) return res.status(404).json({ success: false, message: 'Không tìm thấy kỳ thi' });
    
    // Trả về trực tiếp object kỳ thi (khớp với mong đợi của Test)
    res.json(updatedExam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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

// POST /api/exams/:id/sessions
router.post('/:id/sessions', async (req, res) => {
    const { course, examDate, startTime, endTime, roomId } = req.body;

    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ success: false, message: 'Không tìm thấy kỳ thi' });

        const startDateTime = new Date(`${examDate}T${startTime}`);
        const endDateTime = new Date(`${examDate}T${endTime}`);

        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
            return res.status(400).json({ success: false, message: 'Định dạng ngày giờ không hợp lệ' });
        }

        let validRoomId = null;
        if (roomId && mongoose.Types.ObjectId.isValid(roomId)) {
            validRoomId = roomId;
        }

        const newSession = {
            course,
            examDate,
            startTime: startDateTime,
            endTime: endDateTime,
            roomId: validRoomId
        };

        exam.sessions.push(newSession);
        await exam.save();

        res.json({ success: true, message: 'Thêm ca thi thành công', sessions: exam.sessions });
    } catch (error) {
        console.error('Lỗi thêm ca thi:', error);
        res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
    }
});

// DELETE /api/exams/:examId/sessions/:sessionId
router.delete('/:examId/sessions/:sessionId', async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.examId);
        if (!exam) return res.status(404).json({ success: false, message: 'Không tìm thấy kỳ thi' });

        exam.sessions = exam.sessions.filter(s => s._id.toString() !== req.params.sessionId);
        
        await exam.save();
        res.json({ success: true, message: 'Đã xóa ca thi', sessions: exam.sessions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// PUT /api/exams/:examId/sessions/:sessionId
router.put('/:examId/sessions/:sessionId', async (req, res) => {
    const { course, examDate, startTime, endTime, roomId } = req.body;

    try {
        const exam = await Exam.findById(req.params.examId);
        if (!exam) return res.status(404).json({ success: false, message: 'Không tìm thấy kỳ thi' });

        const session = exam.sessions.id(req.params.sessionId);
        if (!session) return res.status(404).json({ success: false, message: 'Không tìm thấy ca thi' });

        if (examDate && startTime) {
            session.startTime = new Date(`${examDate}T${startTime}`);
        }
        if (examDate && endTime) {
            session.endTime = new Date(`${examDate}T${endTime}`);
        }
        
        if (course) session.course = course;
        if (examDate) session.examDate = examDate;
        
        if (roomId && mongoose.Types.ObjectId.isValid(roomId)) {
            session.roomId = roomId;
        }

        await exam.save();
        res.json({ success: true, message: 'Cập nhật ca thi thành công!', sessions: exam.sessions });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server khi sửa ca thi' });
    }
});

module.exports = router;