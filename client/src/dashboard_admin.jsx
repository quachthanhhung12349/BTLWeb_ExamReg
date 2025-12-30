import { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { createNotification, getAllNotifications, deleteNotification } from './api/notification_api';

const DashboardAdmin = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ title: '', text: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await getAllNotifications();
            setNotifications(data || []);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNotification = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.text.trim()) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setSubmitting(true);
        try {
            await createNotification(formData.title, formData.text);
            setFormData({ title: '', text: '' });
            setShowModal(false);
            alert('Thêm thông báo thành công!');
            await fetchNotifications();
        } catch (err) {
            alert('Lỗi thêm thông báo: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteNotification = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xoá thông báo này?')) return;
        try {
            await deleteNotification(id);
            alert('Xoá thông báo thành công!');
            await fetchNotifications();
        } catch (err) {
            alert('Lỗi xoá thông báo: ' + err.message);
        }
    };

    return (
        <div id="page-content-wrapper" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div className="bg-white border-bottom p-4" style={{ borderRadius: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="h3 mb-1">Dashboard</h1>
                        <p className="text-muted mb-0">Quản lý thông báo cho sinh viên</p>
                    </div>
                    <button 
                        className="btn btn-primary"
                        onClick={() => setShowModal(true)}
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        + Thêm thông báo
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="container-fluid p-4" style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
                {loading ? (
                    <div className="alert alert-info">Đang tải dữ liệu...</div>
                ) : notifications.length === 0 ? (
                    <div className="alert alert-secondary">Chưa có thông báo nào</div>
                ) : (
                    <div className="row g-3">
                        {notifications.map((notif) => (
                            <div key={notif._id} className="col-md-6 col-lg-4">
                                <div className="card h-100 shadow-sm border-0">
                                    <div className="card-body">
                                        <h5 className="card-title fw-bold">{notif.title}</h5>
                                        <p className="card-text text-muted small" style={{ minHeight: '60px' }}>
                                            {notif.text.substring(0, 100)}
                                            {notif.text.length > 100 ? '...' : ''}
                                        </p>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <small className="text-muted">
                                                {new Date(notif.date || notif.createdAt).toLocaleDateString('vi-VN')}
                                            </small>
                                            <div>
                                                <span className="badge bg-info me-2">
                                                    {notif.recipients?.length || 0} đã xem
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-footer bg-white border-top">
                                        <button 
                                            className="btn btn-sm btn-outline-danger w-100"
                                            onClick={() => handleDeleteNotification(notif._id)}
                                        >
                                            🗑 Xoá
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Thêm Thông Báo */}
            {showModal && (
                <>
                    <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, zIndex: 1050 }} />
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1060, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="card" style={{ width: '600px', maxWidth: '90vw' }}>
                            <div className="card-body p-4">
                                <h5 className="card-title mb-3">Thêm thông báo mới</h5>
                                <form onSubmit={handleAddNotification}>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Tiêu đề</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Nhập tiêu đề thông báo"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Nội dung</label>
                                        <textarea
                                            className="form-control"
                                            placeholder="Nhập nội dung thông báo"
                                            rows="6"
                                            value={formData.text}
                                            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="d-flex justify-content-end gap-2">
                                        <button 
                                            type="button" 
                                            className="btn btn-outline-secondary"
                                            onClick={() => setShowModal(false)}
                                        >
                                            Hủy
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary"
                                            disabled={submitting}
                                        >
                                            {submitting ? 'Đang lưu...' : 'Thêm thông báo'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default DashboardAdmin;