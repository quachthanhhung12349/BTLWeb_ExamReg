import React, { useState, useEffect } from 'react';
import { getStudentsByCourse, updateCondition, seedData } from './api/courseStudent_api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const RegConditionManagement = () => {
    // State dữ liệu
    // abcxyz abcxyz
    // abc abc
    const [searchCourse, setSearchCourse] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    // State phân trang
    const [currentPage, setCurrentPage] = useState(0);
    const PAGE_SIZE = 10;

    // Reset trang về 0 khi tìm kiếm mới
    useEffect(() => {
        setCurrentPage(0);
    }, [students]);

    // Xử lý tìm kiếm (Gọi API)
    const handleSearch = async (e) => {
        e.preventDefault(); // Chặn reload form
        if (!searchCourse.trim()) {
            alert("Vui lòng nhập mã học phần!");
            return;
        }
        
        setLoading(true);
        setSearched(true);
        try {
            const data = await getStudentsByCourse(searchCourse);
            if (data.success) {
                setStudents(data.list);
            } else {
                setStudents([]);
            }
        } catch (error) {
            alert('Lỗi: ' + error.message);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    // Xử lý sự kiện khi nhấn Enter
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
    };

    // Xử lý Cấm thi / Cho phép thi
    const handleToggle = async (student) => {
        const newStatus = !student.metCondition;
        try {
            await updateCondition(student._id, newStatus);
            // Cập nhật state cục bộ
            setStudents(prev => prev.map(s => 
                s._id === student._id ? { ...s, metCondition: newStatus } : s
            ));
        } catch (error) {
            alert('Lỗi cập nhật: ' + error.message);
        }
    };

    // Tạo dữ liệu test
    const handleTestSeed = async () => {
        const sid = prompt("Nhập mã SV test:");
        const cid = prompt("Nhập mã Môn test:");
        if(sid && cid) {
            await seedData(sid, cid);
            alert("Đã thêm! Hãy tìm kiếm lại để thấy.");
        }
    };

    // --- LOGIC PHÂN TRANG (Client-side pagination) ---
    const total = students.length;
    const startIndex = currentPage * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, total);
    const paginatedStudents = students.slice(startIndex, endIndex);

    const prevPage = () => setCurrentPage(p => Math.max(0, p - 1));
    const nextPage = () => {
        const maxPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);
        setCurrentPage(p => Math.min(maxPage, p + 1));
    };

    return (
        <div id="page-content-wrapper" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* --- HEADER SECTION --- */}
            <div className="bg-white border-bottom p-4" style={{ borderRadius: 0 }}>
                <h1 className="h3 mb-3">Quản lý điều kiện dự thi</h1>
                
                <div style={{ display: 'flex', justifyContent: 'space-between'}}>
                    {/* Thanh tìm kiếm */}
                    <div className="input-group" style={{ maxWidth: '900px' }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Nhập mã học phần (VD: INT3306)..."
                            value={searchCourse}
                            onChange={(e) => setSearchCourse(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={{ borderRadius: '0.375rem' }}
                        />
                        <button 
                            className="btn btn-outline-secondary" 
                            type="button" 
                            id="search-button"
                            onClick={handleSearch}
                        >
                            🔍
                        </button>
                    </div>

                    {/* Nút Test Data */}
                    <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={handleTestSeed}>
                        + Test Data
                    </button>
                </div>
            </div>

            {/* --- CONTENT SECTION --- */}
            <div className="container-fluid p-4" style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
                <div className="card" style={{ boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)' }}>
                    <div className="card-body p-0">
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table table-striped table-hover m-0">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ padding: '1rem' }}>Mã sinh viên</th>
                                        <th style={{ padding: '1rem' }}>Mã học phần</th>
                                        <th style={{ padding: '1rem', textAlign: 'center' }}>Trạng thái</th>
                                        <th style={{ padding: '1rem', textAlign: 'center' }}>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="4" className="text-center p-4">Đang tải dữ liệu...</td></tr>
                                    ) : paginatedStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center p-4 text-muted">
                                                {searched ? 'Không tìm thấy sinh viên nào.' : 'Vui lòng nhập mã môn để xem danh sách.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedStudents.map((s) => (
                                            <tr key={s._id}>
                                                <td style={{ padding: '1rem', verticalAlign: 'middle' }}>{s.studentId}</td>
                                                <td style={{ padding: '1rem', verticalAlign: 'middle' }}>{s.courseId}</td>
                                                <td style={{ padding: '1rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                                    {s.metCondition ? (
                                                        <span className="badge bg-success">Đủ điều kiện</span>
                                                    ) : (
                                                        <span className="badge bg-danger">Cấm thi</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                                    <button 
                                                        className={`btn btn-sm ${s.metCondition ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                                        style={{ minWidth: '100px' }}
                                                        onClick={() => handleToggle(s)}
                                                    >
                                                        {s.metCondition ? '🚫 Cấm thi' : '✅ Cho phép'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* --- PAGINATION --- */}
                        <div className="d-flex justify-content-between align-items-center p-3" style={{ borderTop: '1px solid #e9ecef' }}>
                            <span className="text-muted">
                                {total === 0
                                    ? `Hiển thị 0 trên 0`
                                    : `Hiển thị ${startIndex + 1}-${endIndex} trên ${total}`}
                            </span>
                            <div>
                                <button 
                                    className="btn btn-outline-secondary me-2" 
                                    onClick={prevPage} 
                                    disabled={currentPage === 0}
                                >
                                    Trước
                                </button>
                                <button 
                                    className="btn btn-outline-secondary" 
                                    onClick={nextPage} 
                                    disabled={endIndex >= total}
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegConditionManagement;