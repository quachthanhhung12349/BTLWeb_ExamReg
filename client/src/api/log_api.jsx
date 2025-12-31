import { getApiBase } from './base';

export const getSystemLogs = async () => {
    const baseUrl = await getApiBase();
    const response = await fetch(`${baseUrl}/api/admin/logs`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Lỗi tải nhật ký');
    return data;
};