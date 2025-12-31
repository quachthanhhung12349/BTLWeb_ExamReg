const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');

// GET /api/exam-sessions/:courseId/registrations
router.get('/:courseId/registrations', async (req, res) => {
    try {
        const exam = await Exam.findOne({ "sessions.course": new RegExp(req.params.courseId, 'i') });
        res.json(exam ? exam.sessions : []);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;