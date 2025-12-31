import { getApiBase } from './base';

const apiFetch = async (endpoint, options = {}) => {
    try {
        const base = await getApiBase();
        const response = await fetch(`${base}/api${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

// 1. Lấy danh sách SV theo môn
export const getStudentsByCourse = async (courseId) => {
    return await apiFetch(`/course-students?courseId=${courseId}`);
};

// 2. Cập nhật trạng thái
export const updateCondition = async (id, metCondition, note) => {
    return await apiFetch(`/course-students/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ metCondition, note })
    });
};

// 3. Tạo dữ liệu mẫu (seed) cho nhanh khi test
export const seedData = async (studentId, courseId) => {
    return await apiFetch('/course-students/seed', {
        method: 'POST',
        body: JSON.stringify({ studentId, courseId })
    });
};

// 4. Lấy danh sách học phần của sinh viên
export const getCoursesByStudent = async (studentId) => {
    const data = await apiFetch(`/course-students?studentId=${studentId}`);
    return data.list || (Array.isArray(data) ? data : []);
};

// 5. Thêm học phần cho sinh viên
export const addCourseToStudent = async (studentId, courseId) => {
    return await apiFetch('/course-students', {
        method: 'POST',
        body: JSON.stringify({ studentId, courseId })
    });
};

// 6. Xóa học phần của sinh viên
export const removeCourseFromStudent = async (studentId, courseId) => {
    return await apiFetch(`/course-students?studentId=${studentId}&courseId=${courseId}`, {
        method: 'DELETE'
    });
};