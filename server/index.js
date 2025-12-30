require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- IMPORT ROUTERS ---
// Nhóm Admin
const studentsRouter = require('./routes/students');
const courseRouter = require('./routes/courses');
const examRoomsRouter = require('./routes/examRooms');
const notificationRouter = require('./routes/notifications'); 

// Nhóm Sinh viên (Đã quy hoạch lại để khớp với bảng yêu cầu)
// File này sẽ chứa logic của: status, register, subjects, download-info
const examRegistrationRouter = require('./routes/examRegistrations'); 
// File này chứa logic: search sessions
const examSessionRouter = require('./routes/examSessions');
// File thông báo (nếu bạn đã tạo)
// const notificationRouter = require('./routes/notifications');

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- AUTHENTICATION (FAKE LOGIN) ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Logic kiểm tra đăng nhập
    if (username === 'admin' && password === '123456') {
        return res.status(200).json({ 
            success: true, 
            message: 'Đăng nhập Admin thành công!',
            user: { name: 'Admin User', role: 'admin', studentId: 'admin' }
        });
    } else if (username === 'student' && password === '123456') {
        return res.status(200).json({ 
            success: true, 
            message: 'Đăng nhập Sinh viên thành công!',
            user: { name: 'Nguyen Van A', role: 'student', studentId: '23021701' }
        });
    } else {
        return res.status(401).json({ 
            success: false, 
            message: 'Tên đăng nhập hoặc mật khẩu không đúng!' 
        });
    }
});

// --- API ROUTES (ĐÚNG THEO BẢNG YÊU CẦU) ---

// 1. Quản lý Đăng ký thi (Màn hình 1, 2, 3)
// Bao gồm: /status/:id, /subjects/:id, /:id/download-info, và POST /
app.use('/api/exam-registrations', examRegistrationRouter);

// 2. Quản lý Ca thi (Tìm kiếm môn thi)
// Bao gồm: /:id/registrations
app.use('/api/exam-sessions', examSessionRouter);
app.use('/api/notifications', notificationRouter);


// 3. Quản lý Thông báo
// app.use('/api/notifications', notificationRouter);

// 4. Các API quản trị (Admin)
app.use('/api/admin/students', studentsRouter);
app.use('/api/admin/courses', courseRouter);
app.use('/api/admin/exam-rooms', examRoomsRouter);


// --- DATABASE CONNECTION & SERVER START ---
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Kết nối MongoDB thành công');
        app.listen(PORT, () => {
            console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Lỗi kết nối MongoDB:', err.message);
    });