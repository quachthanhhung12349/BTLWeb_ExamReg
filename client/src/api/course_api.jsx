const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001';

export async function fetchCourses() {
  try {
    const res = await fetch(`${API_BASE}/api/courses`);
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch courses');
    return await res.json();
  } catch (err) {
    console.error('fetchCourses error', err);
    throw err;
  }
}

export async function fetchCourse(id) {
  try {
    const res = await fetch(`${API_BASE}/api/courses/${id}`);
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch course');
    return await res.json();
  } catch (err) {
    console.error('fetchCourse error', err);
    throw err;
  }
}

export async function createCourse(data) {
  try {
    const res = await fetch(`${API_BASE}/api/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to create course');
    return await res.json();
  } catch (err) {
    console.error('createCourse error', err);
    throw err;
  }
}

export async function updateCourse(id, data) {
  try {
    const res = await fetch(`${API_BASE}/api/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to update course');
    return await res.json();
  } catch (err) {
    console.error('updateCourse error', err);
    throw err;
  }
}

export async function deleteCourse(id) {
  try {
    const res = await fetch(`${API_BASE}/api/courses/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete course');
    return await res.json();
  } catch (err) {
    console.error('deleteCourse error', err);
    throw err;
  }
}
