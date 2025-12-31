import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchStudent, updateStudent } from './api/student_api.jsx';
import { fetchCourses } from './api/course_api.jsx';
import { getCoursesByStudent, addCourseToStudent, removeCourseFromStudent } from './api/courseStudent_api.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';

const StudentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [class_, setClass] = useState('');
  const [email, setEmail] = useState('');
  const [eligibleForExam, setEligibleForExam] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [studentCourses, setStudentCourses] = useState([]);
  const [studentCoursesDetails, setStudentCoursesDetails] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState(new Set());
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courseSearchTerm, setCourseSearchTerm] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const student = await fetchStudent(id);
        if (mounted) {
          if (student) {
            setStudentId(student.studentId);
            setName(student.name);
            setBirthDate(student.birthDate?.split('T')[0] || '');
            setClass(student.class);
            setEmail(student.email);
            setEligibleForExam(!!student.eligibleForExam);

            // Fetch student's courses
            try {
              const courses = await getCoursesByStudent(student.studentId);
              if (mounted) {
                setStudentCourses(courses || []);
                // Fetch all courses to get full details
                const allCoursesData = await fetchCourses();
                const detailedCourses = courses.map(sc => {
                  const courseDetail = allCoursesData.find(c => c.courseId === sc.courseId);
                  return courseDetail || { courseId: sc.courseId, courseName: sc.courseId };
                });
                setStudentCoursesDetails(detailedCourses);
              }
            } catch (err) {
              console.error('Failed to fetch student courses:', err);
            }
          } else {
            navigate('/admin/student');
          }
        }
      } catch (err) {
        console.error('Failed to fetch student:', err);
        if (mounted) navigate('/admin/student');
      }
    })();
    return () => (mounted = false);
  }, [id, navigate]);

  const isValidEmail = (em) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
  };

  const handleOk = async (e) => {
    e.preventDefault();
    setError('');
    if (!studentId || !name || !birthDate || !class_ || !email) {
      setError('Vui lòng điền tất cả các trường.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Email không hợp lệ.');
      return;
    }

    setLoading(true);
    try {
      await updateStudent(id, {
        studentId,
        name,
        birthDate,
        class: class_,
        email,
        eligibleForExam
      });
      navigate('/admin/student');
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật sinh viên.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/student');
  };

  const openCourseModal = async () => {
    setLoadingCourses(true);
    try {
      const courses = await fetchCourses();
      setAllCourses(courses || []);
      
      // Initialize selected courses from studentCourses
      const selectedSet = new Set();
      studentCourses.forEach(sc => {
        const course = courses?.find(c => c.courseId === sc.courseId);
        if (course) {
          selectedSet.add(course._id);
        }
      });
      setSelectedCourses(selectedSet);
    } catch (err) {
      alert('Lỗi tải danh sách học phần: ' + err.message);
    } finally {
      setLoadingCourses(false);
    }
    setShowCourseModal(true);
  };

  const closeCourseModal = () => {
    setShowCourseModal(false);
    setAllCourses([]);
    setSelectedCourses(new Set());
    setCourseSearchTerm('');
  };

  const toggleCourse = (courseId) => {
    const newSelected = new Set(selectedCourses);
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId);
    } else {
      newSelected.add(courseId);
    }
    setSelectedCourses(newSelected);
  };

  const saveCourses = async () => {
    setLoadingCourses(true);
    try {
      // Remove courses that are no longer selected
      for (const sc of studentCourses) {
        const courseInAllCourses = allCourses.find(c => c.courseId === sc.courseId);
        if (courseInAllCourses && !selectedCourses.has(courseInAllCourses._id)) {
          await removeCourseFromStudent(studentId, sc.courseId);
        }
      }

      // Add new selected courses
      for (const courseId of selectedCourses) {
        const course = allCourses.find(c => c._id === courseId);
        if (course && !studentCourses.some(sc => sc.courseId === course.courseId)) {
          await addCourseToStudent(studentId, course.courseId);
        }
      }

      // Refresh student courses
      const updatedCourses = await getCoursesByStudent(studentId);
      setStudentCourses(updatedCourses || []);
      // Update course details shown in the UI so changes appear immediately
      try {
        const allCoursesData = (allCourses && allCourses.length) ? allCourses : await fetchCourses();
        const detailedCourses = (updatedCourses || []).map(sc => {
          const courseDetail = allCoursesData.find(c => c.courseId === sc.courseId);
          return courseDetail || { courseId: sc.courseId, courseName: sc.courseId };
        });
        setStudentCoursesDetails(detailedCourses);
      } catch (err) {
        console.error('Failed to refresh course details after save:', err);
        setStudentCoursesDetails((updatedCourses || []).map(sc => ({ courseId: sc.courseId, courseName: sc.courseId })));
      }
      closeCourseModal();
    } catch (err) {
      alert('Lỗi cập nhật học phần: ' + err.message);
    } finally {
      setLoadingCourses(false);
    }
  };

  return (
    <div id="page-content-wrapper" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="bg-white border-bottom p-4" style={{ borderRadius: 0 }}>
        <h1 className="h3 mb-3">Chỉnh sửa sinh viên</h1>
      </div>

      <div className="container-fluid p-4" style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <div className="card">
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleOk}>
              <div className="mb-3">
                <label className="form-label">Mã sinh viên</label>
                <input type="text" className="form-control" value={studentId} onChange={(e) => setStudentId(e.target.value)} disabled={loading} />
              </div>

              <div className="mb-3">
                <label className="form-label">Họ tên sinh viên</label>
                <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
              </div>

              <div className="mb-3">
                <label className="form-label">Ngày sinh</label>
                <input type="date" className="form-control" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} disabled={loading} />
              </div>

              <div className="mb-3">
                <label className="form-label">Lớp</label>
                <input type="text" className="form-control" value={class_} onChange={(e) => setClass(e.target.value)} disabled={loading} />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
              </div>

              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  id="eligibleForExam"
                  className="form-check-input"
                  checked={eligibleForExam}
                  onChange={(e) => setEligibleForExam(e.target.checked)}
                  disabled={loading}
                />
                <label htmlFor="eligibleForExam" className="form-check-label">
                  Đủ điều kiện dự thi
                </label>
              </div>

              <div className="mb-3">
                <label className="form-label">Học phần đang học</label>
                <div className="d-flex gap-2 align-items-center mb-2">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={openCourseModal}
                    disabled={loading}
                  >
                    + Thêm học phần đang học
                  </button>
                </div>
                {studentCoursesDetails.length > 0 && (
                  <div>
                    <p className="text-muted mb-2">Các học phần đã đăng ký ({studentCoursesDetails.length}):</p>
                    <ul className="list-group">
                      {studentCoursesDetails.map((course, idx) => (
                        <li key={course._id || idx} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{course.courseId}</strong> - {course.courseName}
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={async () => {
                              try {
                                await removeCourseFromStudent(studentId, course.courseId);
                                const updated = await getCoursesByStudent(studentId);
                                setStudentCourses(updated || []);
                                // Update course details
                                const allCoursesData = await fetchCourses();
                                const detailedCourses = updated.map(sc => {
                                  const courseDetail = allCoursesData.find(c => c.courseId === sc.courseId);
                                  return courseDetail || { courseId: sc.courseId, courseName: sc.courseId };
                                });
                                setStudentCoursesDetails(detailedCourses);
                              } catch (err) {
                                alert('Lỗi xóa học phần: ' + err.message);
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

      {showCourseModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, zIndex: 1050 }} />
      )}

      {showCourseModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1060, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '90%', maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">Chọn học phần</h5>
            </div>
            <div className="card-body" style={{ overflowY: 'auto', maxHeight: 'calc(90vh - 180px)' }}>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm học phần theo mã hoặc tên..."
                  value={courseSearchTerm}
                  onChange={(e) => setCourseSearchTerm(e.target.value)}
                />
              </div>
              {loadingCourses ? (
                <p className="text-center">Đang tải...</p>
              ) : allCourses.length === 0 ? (
                <p className="text-center text-muted">Không có học phần nào</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table table-striped table-hover m-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '50px', textAlign: 'center' }}>Chọn</th>
                        <th>Mã học phần</th>
                        <th>Tên học phần</th>
                        <th style={{ textAlign: 'center' }}>Tín chỉ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allCourses
                        .filter(course => {
                          if (!courseSearchTerm) return true;
                          const search = courseSearchTerm.toLowerCase();
                          return (
                            (course.courseId || '').toLowerCase().includes(search) ||
                            (course.courseName || '').toLowerCase().includes(search)
                          );
                        })
                        .map(course => (
                        <tr key={course._id}>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={selectedCourses.has(course._id)}
                              onChange={() => toggleCourse(course._id)}
                            />
                          </td>
                          <td>{course.courseId || '-'}</td>
                          <td>{course.courseName || '-'}</td>
                          <td style={{ textAlign: 'center' }}>{course.credits || '-'}</td>
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
                onClick={closeCourseModal}
                disabled={loadingCourses}
              >
                Huỷ
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={saveCourses}
                disabled={loadingCourses}
              >
                {loadingCourses ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}    </div>
  );
};

export default StudentEdit;