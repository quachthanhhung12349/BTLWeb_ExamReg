const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Student = require('../models/Student');

// [GET] /api/notifications - Get notifications for a student
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

// [GET] /api/notifications/all - Get all notifications (admin view)
router.get('/all', async (req, res) => {
    try {
        const notifications = await Notification.find({})
            .sort({ date: -1 })
            .lean();
        res.json(notifications);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// [POST] /api/notifications - Create a new notification
router.post('/', async (req, res) => {
    try {
        const { title, text, sender } = req.body;
        if (!title || !text) {
            return res.status(400).json({ message: "Thiếu thông tin (title, text)" });
        }

        const notification = new Notification({
            title,
            text,
            sender: sender || { staffName: 'Admin' },
            target: 'all',
            recipients: []
        });

        await notification.save();
        res.status(201).json(notification);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// [PUT] /api/notifications/read/:id - Mark notification as read for a student
router.put('/read/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { studentId } = req.body;
        
        const student = await Student.findOne({ studentId });
        if (!student) return res.status(404).json({ message: "SV không tồn tại" });

        const notification = await Notification.findById(id);
        if (!notification) return res.status(404).json({ message: "Thông báo không tồn tại" });
        
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

// [DELETE] /api/notifications/:id - Delete a notification
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Notification.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: "Thông báo không tồn tại" });
        res.json({ message: "Đã xoá thông báo", notification: deleted });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

module.exports = router;