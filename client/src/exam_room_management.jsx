import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


const ExamRoomManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [rooms, setRooms] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const raw = localStorage.getItem('examRooms');
            const parsed = raw ? JSON.parse(raw) : null;
            if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                setRooms(parsed);
            } else {
                const seed = [
                    { id: '0001', building: 'Giảng đường A', roomName: 'Phòng 101', capacity: 50 },
                    { id: '0002', building: 'Giảng đường B', roomName: 'Phòng 202', capacity: 40 },
                    { id: '0003', building: 'Giảng đường C', roomName: 'Phòng 303', capacity: 60 },
                ];
                setRooms(seed);
                localStorage.setItem('examRooms', JSON.stringify(seed));
            }
        } catch (e) {
            const fallback = [
                { id: '0001', building: 'Giảng đường A', roomName: 'Phòng 101', capacity: 50 },
                { id: '0002', building: 'Giảng đường B', roomName: 'Phòng 202', capacity: 40 },
                { id: '0003', building: 'Giảng đường C', roomName: 'Phòng 303', capacity: 60 },
            ];
            setRooms(fallback);
            localStorage.setItem('examRooms', JSON.stringify(fallback));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('examRooms', JSON.stringify(rooms));
    }, [rooms]);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteReason, setDeleteReason] = useState('');

    const openDelete = (room) => {
        setDeleteTarget(room);
        setDeleteReason('');
        setShowDeleteModal(true);
    };

    const closeDelete = () => {
        setShowDeleteModal(false);
        setDeleteTarget(null);
        setDeleteReason('');
    };

    const confirmDelete = () => {
        if (!deleteReason) return;
        setRooms((prev) => prev.filter((r) => r.id !== deleteTarget.id));
        closeDelete();
    };

    const handleEdit = (room) => {
        navigate(`/admin/settings/edit/${room.id}`);
    };

    return (
       <div id="page-content-wrapper" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header Section */}
            <div className="bg-white border-bottom p-4" style={{ borderRadius: 0 }}>
                <h1 className="h3 mb-3">Quản lý ca thi</h1>
                
                {/* Search Bar and Button Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between'}}>
                    {/* Search Bar */}
                    <div className="input-group" style={{ maxWidth: '900px' }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Tìm kiếm phòng thi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ borderRadius: '0.375rem' }}
                        />
                        <button className="btn btn-outline-secondary" type="button" id="search-button">
                            🔍
                        </button>
                    </div>
                    {/* Add Button */}
                    <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={() => navigate('/admin/settings/add')}>
                        + Thêm ca thi
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div className="container-fluid p-4" style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
                <div className="card" style={{ boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)' }}>
                    <div className="card-body p-0">
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table table-striped table-hover m-0">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ padding: '1rem' }}>STT</th>
                                        <th style={{ padding: '1rem' }}>Giảng đường</th>
                                        <th style={{ padding: '1rem' }}>Tên phòng thi</th>
                                        <th style={{ padding: '1rem' }}>Sức chứa</th>
                                        <th style={{ padding: '1rem', textAlign: 'center' }}>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rooms.filter(r => {
                                        if (!searchTerm) return true;
                                        const q = searchTerm.toLowerCase();
                                        return (
                                            r.id.toLowerCase().includes(q) ||
                                            r.building.toLowerCase().includes(q) ||
                                            r.roomName.toLowerCase().includes(q)
                                        );
                                    }).map((r, idx) => (
                                        <tr key={r.id}>
                                            <td style={{ padding: '1rem' }}>{r.id}</td>
                                            <td style={{ padding: '1rem' }}>{r.building}</td>
                                            <td style={{ padding: '1rem' }}>{r.roomName}</td>
                                            <td style={{ padding: '1rem' }}>{r.capacity}</td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEdit(r)}>✎</button>
                                                <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => openDelete(r)}>🗑</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        <div className="d-flex justify-content-between align-items-center p-3" style={{ borderTop: '1px solid #e9ecef' }}>
                            <span className="text-muted">Hiển thị 1-10 trên 1234</span>
                            <div>
                                <button className="btn btn-outline-secondary me-2">Trước</button>
                                <button className="btn btn-outline-secondary">Sau</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
                    {showDeleteModal && (
                        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, zIndex: 1050 }} />
                    )}

                    {showDeleteModal && (
                        <div style={{ position: 'fixed', inset: 0, zIndex: 1060, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="card" style={{ width: 520 }}>
                                <div className="card-body">
                                    <h5 className="card-title">Xác nhận xoá</h5>
                                    <p>Bạn có muốn xoá ca thi này ra khỏi danh sách không?</p>
                                    <div className="mb-3">
                                        <label className="form-label">Chọn nguyên nhân xoá</label>
                                        <select className="form-select" value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)}>
                                            <option value="">-- Chọn nguyên nhân --</option>
                                            <option value="Hủy ca">Hủy ca</option>
                                            <option value="Lỗi dữ liệu">Lỗi dữ liệu</option>
                                            <option value="Nguyên nhân khác">Nguyên nhân khác</option>
                                        </select>
                                    </div>
                                    <div className="d-flex justify-content-end">
                                        <button className="btn btn-secondary me-2" onClick={closeDelete}>Không</button>
                                        <button className="btn btn-danger" onClick={confirmDelete} disabled={!deleteReason}>Có</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
        </div>
    );
}

export default ExamRoomManagement;