import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCourses, deleteCourse, createCourse } from './api/course_api.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


const CourseManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate();

    const removeAccents = (str) => {
        if (!str) return "";
        // Ép kiểu String(str) để đảm bảo không lỗi nếu str là số
        return String(str).normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .replace(/đ/g, "d")
                  .replace(/Đ/g, "D")
                  .toLowerCase(); 
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await fetchCourses();
                if (mounted) {
                    if (Array.isArray(data)) {
                        setCourses(data);
                    } else if (data && data.courses && Array.isArray(data.courses)) {
                        setCourses(data.courses);
                    } else {
                        setCourses([]);
                    }
                }
            } catch (err) { 
                console.error('Failed to fetch courses:', err);
                if (mounted) setCourses([]);
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

    const openDelete = (course) => {
        setDeleteTarget(course);
        setDeleteReason('');
        setShowDeleteModal(true);
    };

    const closeDelete = () => {
        setShowDeleteModal(false);
        setDeleteTarget(null);
        setDeleteReason('');
    };

    const confirmDelete = async () => {
        if (!deleteReason) return;
        try {
            await deleteCourse(deleteTarget._id);
            setCourses((prev) => prev.filter((s) => s._id !== deleteTarget._id));
            closeDelete();
        } catch (err) {
            alert('Error deleting course: ' + (err.message || err));
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

    const handleImportCsv = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImporting(true);
        try {
            const text = await file.text();
            const rows = parseCsv(text);
            let success = 0;
            for (const row of rows) {
                try {
                    await createCourse({
                        courseId: row.courseId,
                        courseName: row.courseName,
                        maxStudents: row.maxStudents ? Number(row.maxStudents) : undefined
                    });
                    success += 1;
                } catch (err) {
                    console.error('Failed to import course row', row, err);
                }
            }
            const data = await fetchCourses();
            setCourses(data || []);
            alert(`Đã import ${success} học phần.`);
        } catch (err) {
            alert(err.message || 'Lỗi import CSV học phần');
        } finally {
            setImporting(false);
            e.target.value = '';
        }
    };

    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm]);

    const safeCourses = Array.isArray(courses) ? courses : [];

    const filteredCourses = safeCourses.filter(s => {
        if (!s) return false;

        if (!searchTerm) return true;
        
        const q = removeAccents(searchTerm);
        const id = removeAccents(s.courseId);
        const name = removeAccents(s.courseName);
        
        return id.includes(q) || name.includes(q);
    });

    useEffect(() => {
        const q = (searchTerm || '').toLowerCase();
        const filteredCount = courses.filter(s => {
            if (!q) return true;
            return (
                (s.courseId || '').toLowerCase().includes(q) ||
                (s.courseName || '').toLowerCase().includes(q)
            );
        }).length;
        const maxPage = Math.max(0, Math.floor((filteredCount - 1) / PAGE_SIZE));
        if (currentPage > maxPage) setCurrentPage(maxPage);
    }, [courses, searchTerm, currentPage]);

    // const filteredCourses = courses.filter(s => {
    //     if (!searchTerm) return true;
    //     const q = searchTerm.toLowerCase();
    //     return (
    //         (s.courseId || '').toLowerCase().includes(q) ||
    //         (s.courseName || '').toLowerCase().includes(q)
    //     );
    // });

    const total = filteredCourses.length;
    const startIndex = currentPage * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, total);
    const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

    const prevPage = () => setCurrentPage(p => Math.max(0, p - 1));
    const nextPage = () => {
        const maxPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);
        setCurrentPage(p => Math.min(maxPage, p + 1));
    };

    return (
        <div id="page-content-wrapper" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header Section */}
            <div className="bg-white border-bottom p-4" style={{ borderRadius: 0 }}>
                <h1 className="h3 mb-3">Quản lý học phần</h1>
                
                {/* Search Bar and Button Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap'}}>
                    {/* Search Bar */}
                    <div className="input-group" style={{ maxWidth: '900px' }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Tìm kiếm học phần..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ borderRadius: '0.375rem' }}
                        />
                        <button className="btn btn-outline-secondary" type="button" id="search-button">
                            🔍
                        </button>
                    </div>
                    <div className="d-flex" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button className="btn btn-outline-secondary" onClick={() => document.getElementById('course-import-input').click()} disabled={importing}>
                            📥 Import CSV
                        </button>
                        <input id="course-import-input" type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImportCsv} />
                        {/* Add Button */}
                        <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={() => navigate('/admin/course/add')}>
                            + Thêm học phần
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container-fluid p-4" style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
                <div className="alert alert-info" style={{ fontSize: '0.9rem' }}>
                    <strong>Định dạng CSV (học phần):</strong> header: <code>courseId,courseName,maxStudents</code>. maxStudents là số (tùy chọn).
                </div>
                <div className="card" style={{ boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)' }}>
                    <div className="card-body p-0">
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table table-striped table-hover m-0">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ padding: '1rem' }}>Mã học phần</th>
                                        <th style={{ padding: '1rem' }}>Tên học phần</th>
                                        <th style={{ padding: '1rem' }}>Số tín chỉ</th>
                                        <th style={{ padding: '1rem' }}>Giảng viên</th>
                                        <th style={{ padding: '1rem', textAlign: 'center' }}>Số lượng sinh viên</th>
                                        <th style={{ padding: '1rem', textAlign: 'center' }}>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedCourses.map((s, idx) => (
                                        <tr key={s._id}>
                                            <td style={{ padding: '1rem' }}>{s.courseId || '-'}</td>
                                            <td style={{ padding: '1rem' }}>{s.courseName || '-'}</td>
                                            <td style={{ padding: '1rem' }}>{s.credits || '-'}</td>
                                            <td style={{ padding: '1rem' }}>{s.professor || '-'}</td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>{s.currentEnrollment || 0}</td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate(`/admin/course/edit/${s._id}`)}>✎</button>
                                                <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => openDelete(s)}>🗑</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {paginatedCourses.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center p-4 text-muted">Không có kết quả</td>
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
                {showDeleteModal && (
                    <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, zIndex: 1050 }} />
                )}

                {showDeleteModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1060, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="card" style={{ width: 520 }}>
                            <div className="card-body">
                                <h5 className="card-title">Xác nhận xoá</h5>
                                <p>Bạn có muốn xoá học phần này ra khỏi danh sách không?</p>
                                <div className="mb-3">
                                    <label className="form-label">Chọn nguyên nhân xoá</label>
                                    <select className="form-select" value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)}>
                                        <option value="">-- Chọn nguyên nhân --</option>
                                        <option value="Hủy chương trình">Hủy chương trình</option>
                                        <option value="Trùng mã">Trùng mã</option>
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
        </div>
    );
}

export default CourseManagement;