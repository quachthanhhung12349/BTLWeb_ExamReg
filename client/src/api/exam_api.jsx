import axios from 'axios';
import { getApiBase } from './base';

// Admin API - fetch-based functions for exam management
async function examApiUrl(path = '') {
    return `${await getApiBase()}/api/exams${path}`;
}

export const getExams = async () => {
    const response = await fetch(await examApiUrl());
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const createExam = async (examData) => {
    const response = await fetch(await examApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const getExamDetail = async (id) => {
    const response = await fetch(await examApiUrl(`/${id}`));
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const deleteExam = async (id) => {
    const response = await fetch(await examApiUrl(`/${id}`), { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const addSession = async (examId, sessionData) => {
    const response = await fetch(await examApiUrl(`/${examId}/sessions`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const deleteSession = async (examId, sessionId) => {
    const response = await fetch(await examApiUrl(`/${examId}/sessions/${sessionId}`), {
        method: 'DELETE'
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const updateSession = async (examId, sessionId, sessionData) => {
    const response = await fetch(await examApiUrl(`/${examId}/sessions/${sessionId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

// Student API - axios-based functions for exam registration
async function studentApiUrl(path = '') {
    return `${await getApiBase()}${path}`;
}

async function studentRequest(method, path, data) {
    const url = await studentApiUrl(path);
    return axios({ method, url, data });
}

export const examApi = {
    // Tìm kiếm môn thi 
    searchSessions: (courseId) => 
        studentRequest('get', `/api/exam-sessions/${courseId}/registrations`),

    // Đăng ký thi
    registerExam: (studentId, courseId) => 
        studentRequest('post', '/api/exam-registrations', { studentId, courseId, action: 'register' }),

    // Huỷ đăng ký thi / Xem trạng thái
    getRegistrationStatus: (studentId) => 
        studentRequest('get', `/api/exam-registrations/status/${studentId}`),
        
    unregisterExam: (studentId, courseId) => 
        studentRequest('post', '/api/exam-registrations', { studentId, courseId, action: 'unregister' }),

    // Tải xuống phiếu báo dự thi 
    getExamSlip: (regId) => 
        studentRequest('get', `/api/exam-registrations/${regId}/download-info`),

    // Danh sách môn sinh viên phải thi 
    getRequiredSubjects: () => 
        studentRequest('get', '/api/exam-registrations/subjects'),

    // 6. Nhận thông báo
    getNotifications: () => 
        studentRequest('get', '/api/notifications'),
        
    // Profile (Phần sidebar)
    getProfile: (studentId) => 
        studentRequest('get', `/api/registration/profile/${studentId}`)
};
