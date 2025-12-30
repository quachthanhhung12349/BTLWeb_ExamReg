import { getApiBase } from './base';

async function notificationPath(suffix = '') {
  return `${await getApiBase()}/api/notifications${suffix}`;
}

// Get all notifications for a student
export async function getStudentNotifications(studentId) {
  try {
    const res = await fetch(await notificationPath(`?studentId=${studentId}`));
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return await res.json();
  } catch (err) {
    console.error('getStudentNotifications error:', err);
    return [];
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId, studentId) {
  try {
    const res = await fetch(await notificationPath(`/read/${notificationId}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId })
    });
    if (!res.ok) throw new Error('Failed to mark as read');
    return await res.json();
  } catch (err) {
    console.error('markNotificationAsRead error:', err);
    throw err;
  }
}

// Create notification (admin only)
export async function createNotification(title, text) {
  try {
    const res = await fetch(await notificationPath(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        text,
        target: 'all',
        sender: {
          staffName: localStorage.getItem('userName') || 'Admin'
        }
      })
    });
    if (!res.ok) throw new Error('Failed to create notification');
    return await res.json();
  } catch (err) {
    console.error('createNotification error:', err);
    throw err;
  }
}

// Get all notifications (admin view)
export async function getAllNotifications() {
  try {
    const res = await fetch(await notificationPath('/all'), {
      method: 'GET'
    });
    if (!res.ok) throw new Error('Failed to fetch all notifications');
    return await res.json();
  } catch (err) {
    console.error('getAllNotifications error:', err);
    return [];
  }
}

// Delete notification (admin only)
export async function deleteNotification(notificationId) {
  try {
    const res = await fetch(await notificationPath(`/${notificationId}`), {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete notification');
    return await res.json();
  } catch (err) {
    console.error('deleteNotification error:', err);
    throw err;
  }
}
