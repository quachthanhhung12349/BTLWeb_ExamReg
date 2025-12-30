import axios from 'axios';

// Admin API - fetch-based functions for exam management
const API_URL = 'http://localhost:5001/api/exams'; 

export const getExams = async () => {
    const response = await fetch(API_URL);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const createExam = async (examData) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const getExamDetail = async (id) => {
    const response = await fetch(`${API_URL}/${id}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const deleteExam = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const addSession = async (examId, sessionData) => {
    const response = await fetch(`${API_URL}/${examId}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const deleteSession = async (examId, sessionId) => {
    const response = await fetch(`${API_URL}/${examId}/sessions/${sessionId}`, {
        method: 'DELETE'
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const updateSession = async (examId, sessionId, sessionData) => {
    const response = await fetch(`${API_URL}/${examId}/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

// Student API - axios-based functions for exam registration
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
