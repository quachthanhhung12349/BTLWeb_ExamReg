require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const studentsRouter = require('./routes/students');
const courseRouter = require('./routes/courses');
const examRoomsRouter = require('./routes/examRooms');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    console.log("Dữ liệu đăng nhập nhận được:", username, password);

    // 1. Check Admin
    if (username === 'admin' && password === '123456') {
        return res.status(200).json({ 
            success: true, 
            message: 'Đăng nhập Admin thành công!',
            token: 'admin-token-fake', 
            user: { name: 'Admin User', role: 'admin' }
        });
    } 
    // 2. Check Sinh viên
    else if (username === 'student' && password === '123456') {
        return res.status(200).json({ 
            success: true, 
            message: 'Đăng nhập Sinh viên thành công!',
            token: 'student-token-fake', 
            user: { name: 'Nguyen Van A', role: 'student' }
        });
    }
    // 3. Sai thông tin
    else {
        return res.status(401).json({ 
            success: false, 
            message: 'Tên đăng nhập hoặc mật khẩu không đúng!' 
        });
    }
});

app.use('/api/students', studentsRouter);
app.use('/api/courses', courseRouter);
app.use('/api/exam-rooms', examRoomsRouter);


const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
.then(()=> {
console.log('MongoDB connected');
app.listen(PORT, () => console.log('Server running on ${PORT}'));
})
.catch(err => {
console.error('MongoDB connection error:', err);
});