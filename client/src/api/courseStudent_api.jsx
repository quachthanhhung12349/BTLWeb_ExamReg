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