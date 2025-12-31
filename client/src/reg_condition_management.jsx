import React, { useState, useEffect } from 'react';
import { getStudentsByCourse, updateCondition } from './api/courseStudent_api';
import 'bootstrap/dist/css/bootstrap.min.css';

const RegConditionManagement = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // 1. Lấy danh sách môn học
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/admin/courses');
                if (response.ok) {
                    const data = await response.json();
                    const list = Array.isArray(data) ? data : (data.list || data.courses || []);
                    setCourses(list);
                } else {
                    console.error("Lỗi lấy môn học:", response.status);
                }
            } catch (err) {
                console.error("Lỗi kết nối server:", err);
            }
        };
        fetchCourses();
    }, []);

    // 2. Tải sinh viên khi chọn môn
    useEffect(() => {
        if (!selectedCourse) {
            setStudents([]);
            return;
        }
        const loadStudents = async () => {
            setLoading(true);
            try {
                const data = await getStudentsByCourse(selectedCourse);
                const list = data.success ? data.list : (Array.isArray(data) ? data : []);
                setStudents(list);
            } catch (err) {
                setStudents([]);
            } finally {
                setLoading(false);
            }
        };
        loadStudents();
    }, [selectedCourse]);

    // 3. Xử lý Cấm thi / Cho phép
    const handleToggle = async (student) => {
        const newStatus = !student.metCondition;
        const newNote = newStatus ? '' : 'Cấm thi'; // Ghi chú mặc định
        try {
            await updateCondition(student._id, newStatus, newNote);
            setStudents(prev => prev.map(s => 
                s._id === student._id ? { ...s, metCondition: newStatus, note: newNote } : s
            ));
        } catch (err) {
            alert("Lỗi cập nhật: " + err.message);
        }
    };

    const filtered = students.filter(s => {
        const q = searchTerm.toLowerCase();
        return (s.studentId && s.studentId.toLowerCase().includes(q)) || 
               (s.studentName && s.studentName.toLowerCase().includes(q));
    });

    return (
        <div id="page-content-wrapper" className="w-100 d-flex flex-column">
            {/* Header */}
            <div className="bg-white border-bottom p-4">
                <h1 className="h3 mb-3">Quản lý điều kiện dự thi</h1>
                <div className="d-flex gap-3 align-items-center flex-wrap">
                    <div style={{ minWidth: '300px' }}>
                        <label className="form-label small fw-bold text-muted">Chọn học phần:</label>
                        <select 
                            className="form-select" 
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                            <option value="">-- Chọn học phần --</option>
                            {courses.map(course => (
                                <option key={course._id} value={course.courseId}>
                                    {course.courseId} - {course.courseName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <label className="form-label small fw-bold text-muted">Tìm kiếm sinh viên:</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Nhập tên hoặc MSSV..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={!selectedCourse}
                        />
                    </div>
                </div>
            </div>

            {/* Table Content */}
            <div className="container-fluid p-4 bg-light flex-grow-1">
                <div className="card shadow-sm border-0">
                    <div className="card-body p-0">
                        {!selectedCourse ? (
                            <div className="text-center p-5 text-muted">
                                <i className="bi bi-arrow-up-circle d-block fs-1 mb-3 text-secondary"></i>
                                Vui lòng chọn một học phần để xem danh sách.
                            </div>
                        ) : loading ? (
                            <div className="text-center p-5">
                                <div className="spinner-border text-primary" role="status"></div>
                                <div className="mt-2">Đang tải dữ liệu...</div>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped table-hover m-0 align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="p-3">MSSV</th>
                                            <th className="p-3">Họ và tên</th>
                                            <th className="p-3 text-center">Trạng thái</th>
                                            <th className="p-3">Ghi chú</th>
                                            <th className="p-3 text-center">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.length > 0 ? filtered.map((s) => (
                                            <tr key={s._id} className={!s.metCondition ? "table-danger" : ""}>
                                                <td className="p-3 fw-bold">{s.studentId}</td>
                                                <td className="p-3">{s.studentName || '---'}</td>
                                                <td className="p-3 text-center">
                                                    <span className={`badge ${s.metCondition ? 'bg-success' : 'bg-danger'}`}>
                                                        {s.metCondition ? 'Đủ điều kiện' : 'Cấm thi'}
                                                    </span>
                                                </td>
                                                <td className="p-3"><small className="text-muted">{s.note}</small></td>
                                                <td className="p-3 text-center">
                                                    <button 
                                                        className={`btn btn-sm ${s.metCondition ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                                        style={{ width: '100px' }}
                                                        onClick={() => handleToggle(s)}
                                                    >
                                                        {s.metCondition ? 'Cấm thi' : 'Cho phép'}
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="5" className="text-center p-4 text-muted">Không tìm thấy sinh viên nào.</td></tr>
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

export default RegConditionManagement;