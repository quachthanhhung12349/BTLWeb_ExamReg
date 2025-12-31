const BASE_URL = 'http://localhost:5001/api'; 

const apiFetch = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
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

// 4. Lấy danh sách học phần của sinh viên
export const getCoursesByStudent = async (studentId) => {
    const response = await fetch(`${await apiUrl()}?studentId=${studentId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Lỗi tải danh sách học phần');
    return data.list || [];
};

// 5. Thêm học phần cho sinh viên
export const addCourseToStudent = async (studentId, courseId) => {
    const response = await fetch(`${await apiUrl()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, courseId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Lỗi thêm học phần');
    return data;
};

// 6. Xóa học phần của sinh viên
export const removeCourseFromStudent = async (studentId, courseId) => {
    const response = await fetch(`${await apiUrl()}?studentId=${studentId}&courseId=${courseId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Lỗi xóa học phần');
    return data;
};