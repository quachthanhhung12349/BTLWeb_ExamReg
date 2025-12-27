// client/src/api/exam_api.jsx
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

// 5. Lấy chi tiết 1 kỳ thi
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

// ... (các hàm cũ giữ nguyên)

// 5. Thêm Ca thi
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

// 6. Xóa Ca thi
export const deleteSession = async (examId, sessionId) => {
    const response = await fetch(`${API_URL}/${examId}/sessions/${sessionId}`, {
        method: 'DELETE'
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};
