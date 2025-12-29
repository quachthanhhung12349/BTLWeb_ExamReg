const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Staff = require('../models/Staff'); // Đảm bảo bạn có model Staff

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // --- 1. TÌM TRONG DANH SÁCH SINH VIÊN ---
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

        // --- 2. TÌM TRONG DANH SÁCH STAFF (ADMIN) ---
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

        // --- 3. KHÔNG TÌM THẤY ---
        return res.status(404).json({ success: false, message: 'Tài khoản không tồn tại' });

    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

module.exports = router;