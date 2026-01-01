import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchExamRooms, deleteExamRoom, createExamRoom } from './api/exam_room_api.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


const ExamRoomManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [rooms, setRooms] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await fetchExamRooms();
                if (mounted) setRooms(data || []);
            } catch (err) {
                console.error('Failed to fetch rooms:', err);
                if (mounted) setRooms([]);
            }
        })();
        return () => (mounted = false);
    }, []);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteReason, setDeleteReason] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const PAGE_SIZE = 10;
    const [importing, setImporting] = useState(false);

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

    // Reset to first page when search term changes
    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm]);

    // Ensure current page is in range when rooms or search changes
    useEffect(() => {
        const q = (searchTerm || '').toLowerCase();
        const filteredCount = rooms.filter(r => {
            if (!q) return true;
            return (
                (r.roomId || r._id || '').toString().toLowerCase().includes(q) ||
                (r.building || '').toLowerCase().includes(q) ||
                (r.roomName || '').toLowerCase().includes(q)
            );
        }).length;
        const maxPage = Math.max(0, Math.floor((filteredCount - 1) / PAGE_SIZE));
        if (currentPage > maxPage) setCurrentPage(maxPage);
    }, [rooms, searchTerm, currentPage]);

    const confirmDelete = async () => {
        if (!deleteReason) return;
        try {
            await deleteExamRoom(deleteTarget._id);
            setRooms((prev) => prev.filter((r) => r._id !== deleteTarget._id));
            closeDelete();
        } catch (err) {
            alert('Error deleting room: ' + (err.message || err));
        }
    };

    const parseCsv = (text) => {
        const lines = (text || '').trim().split(/\r?\n/).filter(Boolean);
        if (!lines.length) return [];
        const headers = lines[0].split(',').map(h => h.trim());
        return lines.slice(1).map(line => {
            const cells = line.split(',');
            const obj = {};
            headers.forEach((h, idx) => obj[h] = (cells[idx] || '').trim());
            return obj;
        });
    };

    const normalizeCsvRow = (row = {}) => {
        const text = (value) => {
            if (value === undefined || value === null) return '';
            return String(value).trim();
        };
        const numeric = (value) => {
            if (value === undefined || value === null || value === '') return NaN;
            const num = Number(value);
            return Number.isFinite(num) ? num : NaN;
        };

        return {
            roomId: text(row.roomId ?? row.id ?? ''),
            campus: text(row.building ?? row.campus ?? ''),
            room: text(row.room ?? row.roomName ?? ''),
            maxStudents: numeric(row.capacity ?? row.maxStudents ?? row.maxstudents ?? row.capacityValue)
        };
    };

    const handleImportCsv = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImporting(true);
        try {
            const text = await file.text();
            const rows = parseCsv(text);
            let success = 0;
            let skipped = 0;
            let failed = 0;
            for (const row of rows) {
                const payload = normalizeCsvRow(row);
                if (!payload.roomId || !payload.campus || !payload.room || !Number.isFinite(payload.maxStudents) || payload.maxStudents <= 0) {
                    skipped += 1;
                    continue;
                }
                try {
                    await createExamRoom(payload);
                    success += 1;
                } catch (err) {
                    console.error('Failed to import exam room row', row, err);
                    failed += 1;
                }
            }
            const data = await fetchExamRooms();
            setRooms(data || []);
            const total = rows.length;
            const notes = [];
            if (skipped) notes.push(`${skipped} dòng thiếu dữ liệu`);
            if (failed) notes.push(`${failed} dòng lỗi API`);
            alert(`Đã import ${success}/${total} phòng thi${notes.length ? ` (${notes.join(', ')})` : ''}.`);
        } catch (err) {
            alert(err.message || 'Lỗi import CSV phòng thi');
        } finally {
            setImporting(false);
            e.target.value = '';
        }
    };

    const handleEdit = (room) => {
        navigate(`/admin/exam-rooms/edit/${room._id}`);
    };

    // Derived lists for search + pagination
    const filteredRooms = rooms.filter(r => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
            (r.roomId || r._id || '').toString().toLowerCase().includes(q) ||
            (r.building || '').toLowerCase().includes(q) ||
            (r.roomName || '').toLowerCase().includes(q)
        );
    });

    const total = filteredRooms.length;
    const startIndex = currentPage * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, total);
    const paginatedRooms = filteredRooms.slice(startIndex, endIndex);

    const prevPage = () => setCurrentPage(p => Math.max(0, p - 1));
    const nextPage = () => {
        const maxPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);
        setCurrentPage(p => Math.min(maxPage, p + 1));
    };

    return (
       <div id="page-content-wrapper" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header Section */}
            <div className="bg-white border-bottom p-4" style={{ borderRadius: 0 }}>
                <h1 className="h3 mb-3">Quản lý phòng thi</h1>
                
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
                    <div className="d-flex" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button className="btn btn-outline-secondary" onClick={() => document.getElementById('examroom-import-input').click()} disabled={importing}>
                            📥 Import CSV
                        </button>
                        <input id="examroom-import-input" type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImportCsv} />
                        <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={() => navigate('/admin/exam-rooms/add')}>
                            + Thêm phòng thi
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container-fluid p-4" style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
                <div className="alert alert-info" style={{ fontSize: '0.9rem' }}>
                    <strong>Định dạng CSV (phòng thi/ca thi):</strong> header: <code>roomId,building,roomName,capacity</code> (capacity là số).
                </div>
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
                                    {paginatedRooms.map((r, idx) => (
                                        <tr key={r._id}>
                                            <td style={{ padding: '1rem' }}>{startIndex + idx + 1}</td>
                                            <td style={{ padding: '1rem' }}>{r.campus}</td>
                                            <td style={{ padding: '1rem' }}>{r.room}</td>
                                            <td style={{ padding: '1rem' }}>{r.maxStudents}</td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEdit(r)}>✎</button>
                                                <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => openDelete(r)}>🗑</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {paginatedRooms.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center p-4 text-muted">Không có kết quả</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        <div className="d-flex justify-content-between align-items-center p-3" style={{ borderTop: '1px solid #e9ecef' }}>
                            <span className="text-muted">
                                {total === 0
                                    ? `Hiển thị 0 trên 0`
                                    : `Hiển thị ${startIndex + 1}-${endIndex} trên ${total}`}
                            </span>
                            <div>
                                <button className="btn btn-outline-secondary me-2" onClick={prevPage} disabled={currentPage === 0}>Trước</button>
                                <button className="btn btn-outline-secondary" onClick={nextPage} disabled={endIndex >= total}>Sau</button>
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
                                    <p>Bạn có muốn xoá phòng thi này ra khỏi danh sách không?</p>
                                    <div className="mb-3">
                                        <label className="form-label">Chọn nguyên nhân xoá</label>
                                        <select className="form-select" value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)}>
                                            <option value="">-- Chọn nguyên nhân --</option>
                                            <option value="Hủy phòng">Hủy phòng</option>
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