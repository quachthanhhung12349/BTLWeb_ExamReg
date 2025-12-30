const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Student = require('../models/Student');

// [GET] /api/notifications/detail/:id
router.get('/', async (req, res) => {
    try {
        const { studentId } = req.query; 
        
        if (!studentId) return res.status(400).json({ message: "Thiếu mã sinh viên" });

        const student = await Student.findOne({ studentId });
        if (!student) return res.status(404).json({ message: "Không tìm thấy SV" });

        const notifications = await Notification.find({
            $or: [
                { target: 'all' },
                { 'recipients.studentId': student._id }
            ]
        }).sort({ date: -1 });

        const result = notifications.map(n => {
            const recipient = n.recipients.find(r => r.studentId.toString() === student._id.toString());
            return {
                _id: n._id,
                title: n.title,
                text: n.text,
                date: n.date,
                isRead: recipient ? recipient.read : false
            };
        });

        res.json(result);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// [PUT] /api/notifications/read/:id/:studentId
// Đánh dấu đã đọc cho một sinh viên cụ thể trong mảng recipients
router.put('/read/:id', async (req, res) => {
    try {
        const { id, studentId } = req.params;
        const student = await Student.findOne({ studentId });
        if (!student) return res.status(404).json({ message: "SV không tồn tại" });

        const notification = await Notification.findById(id);
        
        const recipientIndex = notification.recipients.findIndex(
            r => r.studentId.toString() === student._id.toString()
        );

        if (recipientIndex === -1) {
            await Notification.findByIdAndUpdate(id, {
                $push: {
                    recipients: {
                        studentId: student._id,
                        studentName: student.name,
                        read: true,
                        readDate: new Date()
                    }
                }
            });
        } else {
            await Notification.updateOne(
                { _id: id, "recipients.studentId": student._id },
                { $set: { "recipients.$.read": true, "recipients.$.readDate": new Date() } }
            );
        }

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

module.exports = router;