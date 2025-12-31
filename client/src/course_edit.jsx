import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCourse, updateCourse } from './api/course_api.jsx';
import { fetchStudents } from './api/student_api.jsx';
import { getStudentsByCourse, addCourseToStudent, removeCourseFromStudent } from './api/courseStudent_api.jsx';
import { exportTableToExcel } from './utils/excelExport';
import 'bootstrap/dist/css/bootstrap.min.css';

const CourseEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courseId, setCourseId] = useState('');
  const [courseName, setCourseName] = useState('');
  const [maxStudents, setMaxStudents] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [courseStudents, setCourseStudents] = useState([]);
  const [courseStudentsDetails, setCourseStudentsDetails] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const c = await fetchCourse(id);
        if (mounted) {
          if (!c) return navigate('/admin/course');
          setCourseId(c.courseId || '');
          setCourseName(c.courseName || '');
          setMaxStudents(c.maxStudents || '');

          // Fetch course's students
          try {
            const result = await getStudentsByCourse(c.courseId);
            if (mounted) {
              setCourseStudents(result.list || []);
              // Fetch all students to get full details
              const allStudentsData = await fetchStudents();
              const detailedStudents = result.list.map(cs => {
                const studentDetail = allStudentsData.find(s => s.studentId === cs.studentId);
                return studentDetail || { studentId: cs.studentId, name: cs.studentId };
              });
              setCourseStudentsDetails(detailedStudents);
            }
          } catch (err) {
            console.error('Failed to fetch course students:', err);
          }
        }
      } catch (err) {
        navigate('/admin/course');
      }
    })();
    return () => (mounted = false);
  }, [id, navigate]);

  const handleOk = async (e) => {
    e.preventDefault();
    setError('');
    if (!courseId || !courseName) {
      setError('Vui lòng điền tất cả các trường.');
      return;
    }
    setLoading(true);
    try {
      await updateCourse(id, { courseId, courseName, maxStudents: Number(maxStudents) });
      navigate('/admin/course');
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật học phần.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/course');
  };

  const openStudentModal = async () => {
    setLoadingStudents(true);
    try {
      const students = await fetchStudents();
      setAllStudents(students || []);
      
      // Initialize selected students from courseStudents
      const selectedSet = new Set();
      courseStudents.forEach(cs => {
        const student = students?.find(s => s.studentId === cs.studentId);
        if (student) {
          selectedSet.add(student._id);
        }
      });
      setSelectedStudents(selectedSet);
    } catch (err) {
      alert('Lỗi tải danh sách sinh viên: ' + err.message);
    } finally {
      setLoadingStudents(false);
    }
    setShowStudentModal(true);
  };

  const closeStudentModal = () => {
    setShowStudentModal(false);
    setAllStudents([]);
    setSelectedStudents(new Set());
    setStudentSearchTerm('');
  };

  const toggleStudent = (studentMongoId) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentMongoId)) {
      newSelected.delete(studentMongoId);
    } else {
      newSelected.add(studentMongoId);
    }
    setSelectedStudents(newSelected);
  };

  const saveStudents = async () => {
    setLoadingStudents(true);
    try {
      // Remove students that are no longer selected
      for (const cs of courseStudents) {
        const studentInAllStudents = allStudents.find(s => s.studentId === cs.studentId);
        if (studentInAllStudents && !selectedStudents.has(studentInAllStudents._id)) {
          await removeCourseFromStudent(cs.studentId, courseId);
        }
      }

      // Add new selected students
      for (const studentMongoId of selectedStudents) {
        const student = allStudents.find(s => s._id === studentMongoId);
        if (student && !courseStudents.some(cs => cs.studentId === student.studentId)) {
          await addCourseToStudent(student.studentId, courseId);
        }
      }

      // Refresh course students
      const result = await getStudentsByCourse(courseId);
      setCourseStudents(result.list || []);
      // Update student details
      const detailedStudents = result.list.map(cs => {
        const studentDetail = allStudents.find(s => s.studentId === cs.studentId);
        return studentDetail || { studentId: cs.studentId, name: cs.studentId };
      });
      setCourseStudentsDetails(detailedStudents);
      closeStudentModal();
    } catch (err) {
      alert('Lỗi cập nhật sinh viên: ' + err.message);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Xuất Excel danh sách sinh viên đang học
  const handleExportStudents = async () => {
    if (courseStudentsDetails.length === 0) {
      alert('Không có sinh viên nào để xuất!');
      return;
    }

    try {
      const columns = [
        { header: 'STT', key: 'index', width: 8 },
        { header: 'Mã sinh viên', key: 'studentId', width: 20 },
        { header: 'Họ tên', key: 'name', width: 35 },
        { header: 'Ngày sinh', key: 'birthday', width: 22 },
        { header: 'Lớp', key: 'class', width: 20 }
      ];

      const tableData = courseStudentsDetails.map((s, index) => ({
        index: (index + 1).toString(),
        studentId: s.studentId || '-',
        name: s.name || '-',
        birthday: s.birthday 
          ? new Date(s.birthday).toLocaleDateString('vi-VN')
          : '-',
        class: s.class || '-'
      }));

      const filename = `DanhSachSinhVien_${courseId}_${new Date().toISOString().split('T')[0]}.xlsx`;
      exportTableToExcel(
        tableData, 
        columns, 
        filename,
        'Danh sách sinh viên',
        `Danh Sách Sinh Viên Học Phần: ${courseId} - ${courseName}`
      );
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };


  return (
    <div id="page-content-wrapper" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="bg-white border-bottom p-4" style={{ borderRadius: 0 }}>
        <h1 className="h3 mb-3">Chỉnh sửa học phần</h1>
      </div>

      <div className="container-fluid p-4" style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <div className="card">
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleOk}>
              <div className="mb-3">
                <label className="form-label">Mã học phần</label>
                <input type="text" className="form-control" value={courseId} onChange={(e) => setCourseId(e.target.value)} disabled={loading} />
              </div>

              <div className="mb-3">
                <label className="form-label">Tên học phần</label>
                <input type="text" className="form-control" value={courseName} onChange={(e) => setCourseName(e.target.value)} disabled={loading} />
              </div>

              <div className="mb-3">
                <label className="form-label">Số lượng tối đa</label>
                <input type="number" className="form-control" value={maxStudents} onChange={(e) => setMaxStudents(e.target.value)} disabled={loading} />
              </div>

              <div className="mb-3">
                <label className="form-label">Sinh viên đang học</label>
                <div className="d-flex gap-2 align-items-center mb-2">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={openStudentModal}
                    disabled={loading}
                  >
                    + Thêm sinh viên
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-success"
                    onClick={handleExportStudents}
                    disabled={courseStudentsDetails.length === 0}
                  >
                    � Xuất Excel
                  </button>
                </div>
                {courseStudentsDetails.length > 0 && (
                  <div>
                    <p className="text-muted mb-2">Các sinh viên đã đăng ký ({courseStudentsDetails.length}):</p>
                    <ul className="list-group">
                      {courseStudentsDetails.map((student, idx) => (
                        <li key={student._id || idx} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{student.studentId}</strong> - {student.name}
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={async () => {
                              try {
                                await removeCourseFromStudent(student.studentId, courseId);
                                const result = await getStudentsByCourse(courseId);
                                setCourseStudents(result.list || []);
                                // Update student details
                                const allStudentsData = await fetchStudents();
                                const detailedStudents = result.list.map(cs => {
                                  const studentDetail = allStudentsData.find(s => s.studentId === cs.studentId);
                                  return studentDetail || { studentId: cs.studentId, name: cs.studentId };
                                });
                                setCourseStudentsDetails(detailedStudents);
                              } catch (err) {
                                alert('Lỗi xóa sinh viên: ' + err.message);
                              }
                            }}
                            disabled={loading}
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary me-2" onClick={handleCancel} disabled={loading}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Đang cập nhật...' : 'OK'}</button>
              </div>
            </form>

          </div>
        </div>
      </div>

      {showStudentModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, zIndex: 1050 }} />
      )}

      {showStudentModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1060, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '90%', maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">Chọn sinh viên</h5>
            </div>
            <div className="card-body" style={{ overflowY: 'auto', maxHeight: 'calc(90vh - 180px)' }}>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm sinh viên theo mã hoặc tên..."
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                />
              </div>
              {loadingStudents ? (
                <p className="text-center">Đang tải...</p>
              ) : allStudents.length === 0 ? (
                <p className="text-center text-muted">Không có sinh viên nào</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table table-striped table-hover m-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '50px', textAlign: 'center' }}>Chọn</th>
                        <th>Mã sinh viên</th>
                        <th>Họ tên</th>
                        <th>Lớp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allStudents
                        .filter(student => {
                          if (!studentSearchTerm) return true;
                          const search = studentSearchTerm.toLowerCase();
                          return (
                            (student.studentId || '').toLowerCase().includes(search) ||
                            (student.name || '').toLowerCase().includes(search)
                          );
                        })
                        .map(student => (
                        <tr key={student._id}>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={selectedStudents.has(student._id)}
                              onChange={() => toggleStudent(student._id)}
                            />
                          </td>
                          <td>{student.studentId || '-'}</td>
                          <td>{student.name || '-'}</td>
                          <td>{student.class || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="card-footer d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeStudentModal}
                disabled={loadingStudents}
              >
                Huỷ
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={saveStudents}
                disabled={loadingStudents}
              >
                {loadingStudents ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseEdit;
