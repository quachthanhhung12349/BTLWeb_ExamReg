const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');

// [GET] /api/exam-sessions/:id/registrations
// Tương ứng: "Tìm kiếm môn thi"
router.get('/:courseId/registrations', async (req, res) => {
    try {
        const exam = await Exam.findOne({ "sessions.course": new RegExp(req.params.courseId, 'i') });
        res.json(exam ? exam.sessions : []);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;