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
