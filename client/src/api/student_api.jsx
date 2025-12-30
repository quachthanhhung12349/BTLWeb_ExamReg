import { getApiBase } from './base';

async function studentPath(id = '') {
  const base = await getApiBase();
  return `${base}/api/admin/students${id}`;
}

export async function fetchStudents() {
  try {
    const res = await fetch(await studentPath());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('fetchStudents error:', err);
    return [];
  }
}

// GET one student by ID
export async function fetchStudent(id) {
  try {
    const res = await fetch(await studentPath(`/${id}`));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('fetchStudent error:', err);
    return null;
  }
}

// CREATE a new student
export async function createStudent(data) {
  try {
    const res = await fetch(await studentPath(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error('createStudent error:', err);
    throw err;
  }
}

// UPDATE a student
export async function updateStudent(id, data) {
  try {
    const res = await fetch(await studentPath(`/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error('updateStudent error:', err);
    throw err;
  }
}

// DELETE a student
export async function deleteStudent(id) {
  try {
    const res = await fetch(await studentPath(`/${id}`), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error('deleteStudent error:', err);
    throw err;
  }
}
