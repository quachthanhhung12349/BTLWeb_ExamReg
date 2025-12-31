require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- IMPORT ROUTERS ---
// Nhóm Adminconst authRouter = require('./routes/auth');
const studentsRouter = require('./routes/students');
const courseRouter = require('./routes/courses');
const examsRouter = require('./routes/exams');
const examRoomsRouter = require('./routes/examRooms');
const notificationRouter = require('./routes/notifications'); 
const Student = require('./models/Student');

const examRegistrationRouter = require('./routes/examRegistrations'); 
const examSessionRouter = require('./routes/examSessions');
const courseStudentsRouter = require('./routes/courseStudents');

const app = express();

// --- MIDDLEWARE ---
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://btl-web-exam-reg-frontend-b3a881f1i.vercel.app',
    /\.vercel\.app$/  // Allow all Vercel preview deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// --- HEALTH CHECK ---
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

// --- AUTHENTICATION ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Kiểm tra tài khoản Dummy
        if (username === 'admin' && password === '123456') {
            return res.status(200).json({ 
                success: true, 
                user: { name: 'Admin Test', role: 'admin', studentId: 'admin' }
            });
        }

        // Kiểm tra tài khoản Dummy
        if (username === 'student' && password === '123456') {
            return res.status(200).json({ 
                success: true, 
                user: { name: 'Nguyen Van A', role: 'student', studentId: '23021701' }
            });
        }

        // Kiểm tra tài khoản THỰC
        const student = await Student.findOne({ 
            "account.username": username, 
            "account.password": password 
        });

        if (student) {
            return res.status(200).json({ 
                success: true, 
                user: { 
                    name: student.name, 
                    role: 'student', 
                    studentId: student.studentId 
                }
            });
        }

        return res.status(401).json({ 
            success: false, 
            message: 'Tên đăng nhập hoặc mật khẩu không đúng!' 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

//app.use('/api/auth', authRouter);
app.use('/api/exam-registrations', examRegistrationRouter);
app.use('/api/exam-sessions', examSessionRouter);
app.use('/api/notifications', notificationRouter);

app.use('/api/admin/students', studentsRouter);
app.use('/api/admin/courses', courseRouter);
app.use('/api/exams', examsRouter);
app.use('/api/admin/exam-rooms', examRoomsRouter);
app.use('/api/course-students', courseStudentsRouter);


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