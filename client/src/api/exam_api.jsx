import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const examApi = {
    // Tìm kiếm môn thi 
    searchSessions: (courseId) => 
        api.get(`/exam-sessions/${courseId}/registrations`),

    // Đăng ký thi
    registerExam: (studentId, courseId) => 
        api.post('/exam-registrations', { studentId, courseId, action: 'register' }),

    // Huỷ đăng ký thi / Xem trạng thái
    getRegistrationStatus: (studentId) => 
        api.get(`/exam-registrations/status/${studentId}`),
        
    unregisterExam: (studentId, courseId) => 
        api.post('/exam-registrations', { studentId, courseId, action: 'unregister' }),

    // Tải xuống phiếu báo dự thi 
    getExamSlip: (regId) => 
        api.get(`/exam-registrations/${regId}/download-info`),

    // Danh sách môn sinh viên phải thi 
    getRequiredSubjects: (studentId) => 
        api.get(`/exam-registrations/subjects`),

    // 6. Nhận thông báo
    getNotifications: () => 
        api.get('/notifications'),
        
    // Profile (Phần sidebar)
    getProfile: (studentId) => 
        api.get(`/registration/profile/${studentId}`)
};