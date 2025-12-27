const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001';

export async function fetchExamRooms() {
  try {
    const res = await fetch(`${API_BASE}/api/exam-rooms`);
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch rooms');
    return await res.json();
  } catch (err) {
    console.error('fetchExamRooms error', err);
    throw err;
  }
}

export async function fetchExamRoom(id) {
  try {
    const res = await fetch(`${API_BASE}/api/exam-rooms/${id}`);
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch room');
    return await res.json();
  } catch (err) {
    console.error('fetchExamRoom error', err);
    throw err;
  }
}

export async function createExamRoom(data) {
  try {
    const res = await fetch(`${API_BASE}/api/exam-rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to create room');
    return await res.json();
  } catch (err) {
    console.error('createExamRoom error', err);
    throw err;
  }
}

export async function updateExamRoom(id, data) {
  try {
    const res = await fetch(`${API_BASE}/api/exam-rooms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to update room');
    return await res.json();
  } catch (err) {
    console.error('updateExamRoom error', err);
    throw err;
  }
}

export async function deleteExamRoom(id) {
  try {
    const res = await fetch(`${API_BASE}/api/exam-rooms/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete room');
    return await res.json();
  } catch (err) {
    console.error('deleteExamRoom error', err);
    throw err;
  }
}
