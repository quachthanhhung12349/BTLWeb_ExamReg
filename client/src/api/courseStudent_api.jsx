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