import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const examApi = {
    // 1. Tìm kiếm môn thi (Màn hình 1 - ô search)
    searchSessions: (courseId) => 
        api.get(`/exam-sessions/${courseId}/registrations`),

    // 2. Đăng ký thi
    registerExam: (studentId, courseId) => 
        api.post('/exam-registrations', { studentId, courseId, action: 'register' }),

    // 3. Huỷ đăng ký thi / Xem trạng thái
    getRegistrationStatus: (studentId) => 
        api.get(`/exam-registrations/status/${studentId}`),
        
    unregisterExam: (studentId, courseId) => 
        api.post('/exam-registrations', { studentId, courseId, action: 'unregister' }),

    // 4. Tải xuống phiếu báo dự thi (Màn hình 3)
    getExamSlip: (regId) => 
        api.get(`/exam-registrations/${regId}/download-info`),

    // 5. Danh sách môn sinh viên phải thi (Màn hình 2)
    getRequiredSubjects: (studentId) => 
        api.get(`/exam-registrations/subjects/${studentId}`),

    // 6. Nhận thông báo
    getNotifications: () => 
        api.get('/notifications'),
        
    // Profile (Phần sidebar)
    getProfile: (studentId) => 
        api.get(`/registration/profile/${studentId}`)
};