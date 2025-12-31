import React, { useState, useEffect } from 'react';
import { getSystemLogs } from './api/log_api';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            const data = await getSystemLogs();
            if (data.success) setLogs(data.logs);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (isoString) => {
        return new Date(isoString).toLocaleString('vi-VN');
    };

    const getMethodColor = (method) => {
        switch(method) {
            case 'POST': return 'bg-success';
            case 'PUT': return 'bg-warning text-dark';
            case 'DELETE': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    return (
        <div id="page-content-wrapper" className="w-100 d-flex flex-column">
            <div className="bg-white border-bottom p-4">
                <h1 className="h3 mb-0">Nhật ký hệ thống</h1>
            </div>

            <div className="container-fluid p-4 bg-light flex-grow-1">
                <div className="card shadow-sm border-0">
                    <div className="card-body p-0">
                        {loading ? (
                            <div className="text-center p-5">Đang tải nhật ký...</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 align-middle" style={{ fontSize: '0.9rem' }}>
                                    <thead className="table-light">
                                        <tr>
                                            <th className="p-3">Thời gian</th>
                                            <th>Người dùng</th>
                                            <th>Hành động</th>
                                            <th>Chi tiết (Path)</th>
                                            <th className="text-center">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map(log => (
                                            <tr key={log._id}>
                                                <td className="p-3 text-muted">{formatTime(log.timestamp)}</td>
                                                <td className="fw-bold">{log.user || 'Guest'}</td>
                                                <td>
                                                    <span className={`badge ${getMethodColor(log.method)} me-2`}>
                                                        {log.method}
                                                    </span>
                                                </td>
                                                <td className="text-primary" style={{ fontFamily: 'monospace' }}>
                                                    {log.path}
                                                </td>
                                                <td className="text-center">
                                                    {log.status >= 400 ? (
                                                        <span className="text-danger fw-bold">{log.status}</span>
                                                    ) : (
                                                        <span className="text-success fw-bold">{log.status}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {logs.length === 0 && (
                                            <tr><td colSpan="5" className="text-center p-4">Chưa có nhật ký nào.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogs;