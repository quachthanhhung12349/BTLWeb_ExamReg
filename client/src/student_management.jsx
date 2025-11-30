import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


const StudentManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const raw = localStorage.getItem('students');
            const parsed = raw ? JSON.parse(raw) : null;
            // if parsed is a non-empty array use it; otherwise seed sample data
            if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                setStudents(parsed);
            } else {
                // seed with temporary sample data if none or empty
                const seed = [
                    { maSv: '23021701', hoTen: 'Lý Đức Tú', ngaySinh: '2005-06-19', lop: 'K68I-CS3', email: '23021701@vnu.edu.vn' },
                    { maSv: '23021702', hoTen: 'Nguyễn Văn A', ngaySinh: '2004-03-12', lop: 'K68I-CS1', email: '23021702@vnu.edu.vn' },
                    { maSv: '23021703', hoTen: 'Trần Thị B', ngaySinh: '2003-11-05', lop: 'K68I-CS2', email: '23021703@vnu.edu.vn' },
                    { maSv: '23021704', hoTen: 'Phạm Văn C', ngaySinh: '2005-01-22', lop: 'K68I-CS3', email: '23021704@vnu.edu.vn' },
                    { maSv: '23021705', hoTen: 'Hoàng Thị D', ngaySinh: '2004-07-30', lop: 'K68I-CS1', email: '23021705@vnu.edu.vn' },
                    { maSv: '23021706', hoTen: 'Lê Văn E', ngaySinh: '2005-09-10', lop: 'K68I-CS2', email: '23021706@vnu.edu.vn' },
                ];
                setStudents(seed);
                // also persist seed so subsequent reloads reflect it
                localStorage.setItem('students', JSON.stringify(seed));
            }
        } catch (e) {
            const fallback = [
                { maSv: '23021701', hoTen: 'Lý Đức Tú', ngaySinh: '2005-06-19', lop: 'K68I-CS3', email: '23021701@vnu.edu.vn' },
                { maSv: '23021702', hoTen: 'Nguyễn Văn A', ngaySinh: '2004-03-12', lop: 'K68I-CS1', email: '23021702@vnu.edu.vn' },
                { maSv: '23021703', hoTen: 'Trần Thị B', ngaySinh: '2003-11-05', lop: 'K68I-CS2', email: '23021703@vnu.edu.vn' },
                { maSv: '23021704', hoTen: 'Phạm Văn C', ngaySinh: '2005-01-22', lop: 'K68I-CS3', email: '23021704@vnu.edu.vn' },
                { maSv: '23021705', hoTen: 'Hoàng Thị D', ngaySinh: '2004-07-30', lop: 'K68I-CS1', email: '23021705@vnu.edu.vn' },
                { maSv: '23021706', hoTen: 'Lê Văn E', ngaySinh: '2005-09-10', lop: 'K68I-CS2', email: '23021706@vnu.edu.vn' },
            ];
            setStudents(fallback);
            localStorage.setItem('students', JSON.stringify(fallback));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('students', JSON.stringify(students));
    }, [students]);


    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteReason, setDeleteReason] = useState('');

    const openDelete = (student) => {
        setDeleteTarget(student);
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
        setStudents((prev) => prev.filter((s) => s.maSv !== deleteTarget.maSv));
        closeDelete();
    };

    const handleEdit = (student) => {
        navigate(`/admin/student/edit/${student.maSv}`);
    };

    return (
        <div id="page-content-wrapper" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header Section */}
            <div className="bg-white border-bottom p-4" style={{ borderRadius: 0 }}>
                <h1 className="h3 mb-3">Quản lý sinh viên</h1>
                
                {/* Search Bar and Button Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between'}}>
                    {/* Search Bar */}
                    <div className="input-group" style={{ maxWidth: '900px' }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Tìm kiếm sinh viên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ borderRadius: '0.375rem' }}
                        />
                        <button className="btn btn-outline-secondary" type="button" id="search-button">
                            🔍
                        </button>
                    </div>
                    {/* Add Button */}
                    <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={() => navigate('/admin/student/add')}>
                        + Thêm sinh viên
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
                                        <th style={{ padding: '1rem' }}>Mã sinh viên</th>
                                        <th style={{ padding: '1rem' }}>Họ tên sinh viên</th>
                                        <th style={{ padding: '1rem' }}>Ngày sinh</th>
                                        <th style={{ padding: '1rem' }}>Lớp</th>
                                        <th style={{ padding: '1rem' }}>Email</th>
                                        <th style={{ padding: '1rem', textAlign: 'center' }}>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.filter(s => {
                                        if (!searchTerm) return true;
                                        const q = searchTerm.toLowerCase();
                                        return (
                                            s.maSv.toLowerCase().includes(q) ||
                                            s.hoTen.toLowerCase().includes(q) ||
                                            s.email.toLowerCase().includes(q) ||
                                            (s.lop && s.lop.toLowerCase().includes(q))
                                        );
                                    }).map((s) => (
                                        <tr key={s.maSv}>
                                            <td style={{ padding: '1rem' }}>{s.maSv}</td>
                                            <td style={{ padding: '1rem' }}>{s.hoTen}</td>
                                            <td style={{ padding: '1rem' }}>{s.ngaySinh}</td>
                                            <td style={{ padding: '1rem' }}>{s.lop}</td>
                                            <td style={{ padding: '1rem' }}>{s.email}</td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEdit(s)}>✎</button>
                                                <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => openDelete(s)}>🗑</button>
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
                {showDeleteModal && (
                    <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, zIndex: 1050 }} />
                )}

                {showDeleteModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1060, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="card" style={{ width: 520 }}>
                            <div className="card-body">
                                <h5 className="card-title">Xác nhận xoá</h5>
                                <p>Bạn có muốn xoá sinh viên này ra khỏi danh sách sinh viên không?</p>
                                <div className="mb-3">
                                    <label className="form-label">Chọn nguyên nhân xoá sinh viên</label>
                                    <select className="form-select" value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)}>
                                        <option value="">-- Chọn nguyên nhân --</option>
                                        <option value="Buộc thôi học">Buộc thôi học</option>
                                        <option value="Thôi học">Thôi học</option>
                                        <option value="Đã tốt nghiệp">Đã tốt nghiệp</option>
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
        </div>
    );
}

export default StudentManagement;