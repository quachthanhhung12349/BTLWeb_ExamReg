const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Staff = require('../models/Staff');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const student = await Student.findOne({ 'account.username': username });
        if (student) {
            if (student.account.password === password) { 
                return res.json({
                    success: true,
                    role: 'student',
                    user: {
                        id: student.studentId,
                        name: student.name,
                        email: student.email
                    }
                });
            } else {
                return res.status(400).json({ success: false, message: 'Sai mật khẩu sinh viên' });
            }
        }

        const staff = await Staff.findOne({ 'account.username': username });
        if (staff) {
            if (staff.account.password === password) {
                return res.json({
                    success: true,
                    role: 'admin',
                    user: {
                        id: staff._id,
                        name: staff.name,
                        email: staff.email
                    }
                });
            } else {
                return res.status(400).json({ success: false, message: 'Sai mật khẩu cán bộ' });
            }
        }

        return res.status(404).json({ success: false, message: 'Tài khoản không tồn tại' });

    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

module.exports = router;