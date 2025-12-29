const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

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

export async function enrollAllStudentsInCourse(id, onlyEligible = false) {
  try {
    const res = await fetch(`${API_BASE}/api/courses/${id}/enroll-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onlyEligible })
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to enroll students');
    return await res.json();
  } catch (err) {
    console.error('enrollAllStudentsInCourse error', err);
    throw err;
  }
}

export async function enrollStudentsInCourse(id, studentIds) {
  try {
    const res = await fetch(`${API_BASE}/api/courses/${id}/enroll-students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentIds })
    });
    if (!res.ok) {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to enroll selected students');
      } else {
        const text = await res.text();
        throw new Error(text || 'Failed to enroll selected students');
      }
    }
    return await res.json();
  } catch (err) {
    console.error('enrollStudentsInCourse error', err);
    throw err;
  }
}

export async function fetchCourseEnrolledStudents(id) {
  try {
    const res = await fetch(`${API_BASE}/api/courses/${id}/enrolled-students`);
    if (!res.ok) {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to fetch enrolled students');
      } else {
        const text = await res.text();
        throw new Error(text || 'Failed to fetch enrolled students');
      }
    }
    return await res.json();
  } catch (err) {
    console.error('fetchCourseEnrolledStudents error', err);
    throw err;
  }
}

export async function removeStudentFromCourse(courseId, studentId) {
  try {
    const res = await fetch(`${API_BASE}/api/courses/${courseId}/remove-student/${studentId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to remove student from course');
      } else {
        const text = await res.text();
        throw new Error(text || 'Failed to remove student from course');
      }
    }
    return await res.json();
  } catch (err) {
    console.error('removeStudentFromCourse error', err);
    throw err;
  }
}
