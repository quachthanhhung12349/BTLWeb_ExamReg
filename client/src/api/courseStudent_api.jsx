import { getApiBase } from './base';

async function apiUrl() {
    return `${await getApiBase()}/api/course-students`;
}

// 1. Lấy danh sách sinh viên theo Mã học phần
export const getStudentsByCourse = async (courseId) => {
    const response = await fetch(`${await apiUrl()}?courseId=${courseId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Lỗi tải danh sách');
    return data;
};

// 2. Cập nhật trạng thái Đủ điều kiện (Cấm thi / Được thi)
export const updateCondition = async (id, metCondition) => {
    const response = await fetch(`${await apiUrl()}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metCondition })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Lỗi cập nhật');
    return data;
};

// 3. (Phụ) Tạo dữ liệu mẫu nhanh (nếu cần test)
export const seedData = async (studentId, courseId) => {
    await fetch(`${await apiUrl()}/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, courseId })
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