import { getApiBase } from './base';

async function roomsPath(path = '') {
  return `${await getApiBase()}/api/admin/exam-rooms${path}`;
}

export async function fetchExamRooms() {
  try {
    const res = await fetch(await roomsPath());
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch rooms');
    return await res.json();
  } catch (err) {
    console.error('fetchExamRooms error', err);
    throw err;
  }
}

export async function fetchExamRoom(id) {
  try {
    const res = await fetch(await roomsPath(`/${id}`));
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch room');
    return await res.json();
  } catch (err) {
    console.error('fetchExamRoom error', err);
    throw err;
  }
}

export async function createExamRoom(data) {
  try {
    const url = await roomsPath();
    console.log('🚀 Creating room at:', url);
    console.log('📤 Request payload:', JSON.stringify(data, null, 2));
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    console.log('📥 Response status:', res.status);
    const responseData = await res.json();
    console.log('📥 Response data:', JSON.stringify(responseData, null, 2));
    if (!res.ok) throw new Error(responseData.message || 'Failed to create room');
    return responseData;
  } catch (err) {
    console.error('❌ createExamRoom error:', err);
    throw err;
  }
}

export async function updateExamRoom(id, data) {
  try {
    const url = await roomsPath(`/${id}`);
    console.log('🚀 Updating room at:', url);
    console.log('📤 Request payload:', JSON.stringify(data, null, 2));
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    console.log('📥 Response status:', res.status);
    const responseData = await res.json();
    console.log('📥 Response data:', JSON.stringify(responseData, null, 2));
    if (!res.ok) throw new Error(responseData.message || 'Failed to update room');
    return responseData;
  } catch (err) {
    console.error('❌ updateExamRoom error:', err);
    throw err;
  }
}

export async function deleteExamRoom(id) {
  try {
    const res = await fetch(await roomsPath(`/${id}`), { method: 'DELETE' });
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete room');
    return await res.json();
  } catch (err) {
    console.error('deleteExamRoom error', err);
    throw err;
  }
}
