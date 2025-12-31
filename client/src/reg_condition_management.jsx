import React, { useState, useEffect } from 'react';
import { getStudentsByCourse, updateCondition, seedData } from './api/courseStudent_api';
import { fetchStudents } from './api/student_api.jsx';
import { exportTableToExcel } from './utils/excelExport';
import 'bootstrap/dist/css/bootstrap.min.css';

/**
 * Component Quan ly dieu kien du thi.
 * @returns {JSX.Element}
 */
const RegConditionManagement = () => {
    const [courses, setCourses] = useState([]);
    // abcxyz abcxyz
    // abc abc
    const [selectedCourse, setSelectedCourse] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const PAGE_SIZE = 10;
    const [studentMap, setStudentMap] = useState({});

    // Fetch student directory once so we can attach names to course-student rows
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const all = await fetchStudents();
                if (!mounted) return;
                const map = {};
                (Array.isArray(all) ? all : []).forEach((s) => {
                    if (s && s.studentId) map[s.studentId] = s;
                });
                setStudentMap(map);
            } catch (err) {
                console.error('Failed to preload students:', err);
            }
        })();
        return () => { mounted = false; };
    }, []);

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
                const withNames = list.map((item) => ({
                    ...item,
                    studentName: item.studentName || studentMap[item.studentId]?.name || '---'
                }));
                setStudents(withNames);
            } catch (err) {
                setStudents([]);
            } finally {
                setLoading(false);
            }
        };
        loadStudents();
    }, [selectedCourse, studentMap]);

    // Reset về trang đầu khi đổi bộ lọc
    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm, selectedCourse]);

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

    // Tạo dữ liệu test
    const handleTestSeed = async () => {
        const sid = prompt("Nhập mã SV test:");
        const cid = prompt("Nhập mã Môn test:");
        if(sid && cid) {
            await seedData(sid, cid);
            alert("Đã thêm! Hãy tìm kiếm lại để thấy.");
        }
    };

    // Xuất Excel danh sách sinh viên đủ điều kiện
    const handleExportExcel = async () => {
        if (students.length === 0) {
            alert('Không có dữ liệu để xuất!');
            return;
        }

        try {
            // Fetch all students to get their details (name, birthday, class)
            const { fetchStudents } = await import('./api/student_api.jsx');
            const allStudentsData = await fetchStudents();

            const columns = [
                { header: 'STT', key: 'index', width: 8 },
                { header: 'Mã sinh viên', key: 'studentId', width: 20 },
                { header: 'Họ tên', key: 'name', width: 35 },
                { header: 'Ngày sinh', key: 'birthday', width: 22 },
                { header: 'Lớp', key: 'class', width: 20 },
                { header: 'Ký tên', key: 'signature', width: 20 }
            ];

            const tableData = students.map((s, index) => {
                const studentDetail = allStudentsData.find(sd => sd.studentId === s.studentId);
                return {
                    index: (index + 1).toString(),
                    studentId: s.studentId,
                    name: studentDetail?.name || '-',
                    birthday: (studentDetail?.birthDate || studentDetail?.birthday)
                        ? new Date(studentDetail.birthDate || studentDetail.birthday).toLocaleDateString('vi-VN')
                        : '-',
                    class: studentDetail?.class || '-',
                    signature: ''
                };
            });

            const filename = `DanhSachDieuKienDuThi_${new Date().toISOString().split('T')[0]}.xlsx`;
            exportTableToExcel(tableData, columns, filename, 'Danh sách', 'Danh Sách Sinh Viên Điều Kiện Dự Thi');
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };

    const normalize = (str) => {
        if (!str) return '';
        return String(str)
            .normalize('NFD')
            .replace(/[^\p{ASCII}]/gu, '')
            .toLowerCase();
    };

    const filtered = students.filter((s) => {
        if (!s) return false;
        if (!searchTerm) return true;
        const q = normalize(searchTerm);
        return normalize(s.studentId).includes(q) || normalize(s.studentName).includes(q);
    });

    // --- LOGIC PHÂN TRANG (Client-side pagination) ---
    useEffect(() => {
        const maxPage = Math.max(0, Math.ceil(filtered.length / PAGE_SIZE) - 1);
        if (currentPage > maxPage) setCurrentPage(maxPage);
    }, [filtered.length, currentPage]);

    const total = filtered.length;
    const startIndex = currentPage * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, total);
    const paginatedStudents = filtered.slice(startIndex, endIndex);

    const prevPage = () => setCurrentPage(p => Math.max(0, p - 1));
    const nextPage = () => {
        const maxPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);
        setCurrentPage(p => Math.min(maxPage, p + 1));
    };

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

                    {/* Nút Test Data và Xuất Excel */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn btn-primary" onClick={handleExportExcel} disabled={students.length === 0}>
                            📄 Xuất Excel
                        </button>
                        <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={handleTestSeed}>
                            + Test Data
                        </button>
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
                                        {paginatedStudents.length > 0 ? paginatedStudents.map((s) => (
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