import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCourse, updateCourse, fetchCourseEnrolledStudents, enrollStudentsInCourse, removeStudentFromCourse } from './api/course_api.jsx';
import { fetchStudents, updateStudent } from './api/student_api.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';

const CourseEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courseId, setCourseId] = useState('');
  const [courseName, setCourseName] = useState('');
  const [maxStudents, setMaxStudents] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [onlyEligible, setOnlyEligible] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');

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
          const enrolled = await fetchCourseEnrolledStudents(id);
          setEnrolledStudents(enrolled || []);
        }
      } catch (err) {
        navigate('/admin/course');
      }
    })();
    return () => (mounted = false);
  }, [id, navigate]);

  useEffect(() => {
    // Preload all students list for selection modal
    let mounted = true;
    (async () => {
      try {
        const data = await fetchStudents();
        if (mounted) setAllStudents(data || []);
      } catch {
        if (mounted) setAllStudents([]);
      }
    })();
    return () => (mounted = false);
  }, []);

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

  const handleEnrollAll = async () => {
    setEnrolling(true);
    try {
      const enrolled = await fetchCourseEnrolledStudents(id);
      setEnrolledStudents(enrolled || []);
    } catch (err) {
      alert(err.message || 'Lỗi khi cập nhật danh sách sinh viên.');
    } finally {
      setEnrolling(false);
    }
  };

  const openAddStudents = () => {
    setSelectedIds(new Set());
    setShowAddModal(true);
  };

  const closeAddStudents = () => setShowAddModal(false);

  const toggleSelect = (sid) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(sid)) next.delete(sid); else next.add(sid);
      return next;
    });
  };

  const confirmAddSelected = async () => {
    try {
      const ids = Array.from(selectedIds);
      if (!ids.length) return closeAddStudents();
      await enrollStudentsInCourse(id, ids);
      const enrolled = await fetchCourseEnrolledStudents(id);
      setEnrolledStudents(enrolled || []);
      closeAddStudents();
    } catch (err) {
      alert(err.message || 'Lỗi khi thêm sinh viên đã chọn.');
    }
  };

  const setEligibility = async (student, eligible) => {
    try {
      await updateStudent(student._id, { eligibleForExam: eligible });
      setEnrolledStudents(prev => prev.map(s => s._id === student._id ? { ...s, eligibleForExam: eligible } : s));
    } catch (err) {
      alert(err.message || 'Lỗi cập nhật điều kiện dự thi.');
    }
  };

  const openDeleteConfirm = (student) => {
    setDeleteTarget(student);
    setDeleteReason('');
    setShowDeleteModal(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
    setDeleteReason('');
  };

  const confirmRemoveStudent = async () => {
    if (!deleteReason) return;
    try {
      await removeStudentFromCourse(id, deleteTarget._id);
      setEnrolledStudents(prev => prev.filter(s => s._id !== deleteTarget._id));
      closeDeleteConfirm();
    } catch (err) {
      alert(err.message || 'Lỗi xoá sinh viên khỏi học phần.');
    }
  };

  const handleExportCsv = () => {
    const headers = ['studentId', 'name', 'email', 'class', 'eligibleForExam'];
    const rows = enrolledStudents.map(s => headers.map(h => {
      if (h === 'eligibleForExam') return s.eligibleForExam ? 'true' : 'false';
      return s[h] || '';
    }).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `course_${courseId || 'students'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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

              <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary me-2" onClick={handleCancel} disabled={loading}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Đang cập nhật...' : 'OK'}</button>
              </div>
            </form>

            <hr className="my-4" />
            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Sinh viên trong học phần</h5>
                <div className="d-flex" style={{ gap: '0.5rem' }}>
                  <button type="button" className="btn btn-outline-secondary" onClick={handleExportCsv}>📤 Export CSV</button>
                  <button type="button" className="btn btn-primary" onClick={openAddStudents}>+ Thêm sinh viên</button>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Mã SV</th>
                      <th>Họ tên</th>
                      <th>Email</th>
                      <th>Lớp</th>
                      <th>Đủ điều kiện dự thi</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledStudents.map(s => (
                      <tr key={s._id}>
                        <td>{s.studentId || '-'}</td>
                        <td>{s.name}</td>
                        <td>{s.email}</td>
                        <td>{s.class}</td>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={!!s.eligibleForExam}
                            onChange={(e) => setEligibility(s, e.target.checked)}
                          />
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => openDeleteConfirm(s)}
                          >
                            🗑
                          </button>
                        </td>
                      </tr>
                    ))}
                    {enrolledStudents.length === 0 && (
                      <tr><td colSpan={6} className="text-muted">Chưa có sinh viên trong học phần</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {showAddModal && (
              <div>
                <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, zIndex: 1050 }} />
                <div style={{ position: 'fixed', inset: 0, zIndex: 1060, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="card" style={{ width: 800 }}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="card-title mb-0">Chọn sinh viên thêm vào học phần</h5>
                        <button className="btn btn-outline-secondary" onClick={closeAddStudents}>Đóng</button>
                      </div>
                      <div className="input-group mb-3">
                        <input className="form-control" placeholder="Tìm kiếm SV..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                      </div>
                      <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th></th>
                              <th>Mã SV</th>
                              <th>Họ tên</th>
                              <th>Email</th>
                              <th>Lớp</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allStudents
                              .filter(s => {
                                const q = (searchTerm || '').toLowerCase();
                                if (!q) return true;
                                return (
                                  (s.studentId || '').toLowerCase().includes(q) ||
                                  (s.name || '').toLowerCase().includes(q) ||
                                  (s.email || '').toLowerCase().includes(q)
                                );
                              })
                              .map(s => {
                                const already = enrolledStudents.some(es => es._id === s._id);
                                const checked = selectedIds.has(s._id);
                                return (
                                  <tr key={s._id} className={already ? 'table-secondary' : ''}>
                                    <td>
                                      <input
                                        type="checkbox"
                                        className="form-check-input"
                                        disabled={already}
                                        checked={checked}
                                        onChange={() => toggleSelect(s._id)}
                                      />
                                    </td>
                                    <td>{s.studentId || '-'}</td>
                                    <td>{s.name}</td>
                                    <td>{s.email}</td>
                                    <td>{s.class}</td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                      <div className="d-flex justify-content-end">
                        <button className="btn btn-secondary me-2" onClick={closeAddStudents}>Huỷ</button>
                        <button className="btn btn-primary" onClick={confirmAddSelected}>Thêm đã chọn</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showDeleteModal && (
              <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, zIndex: 1050 }} />
            )}

            {showDeleteModal && (
              <div style={{ position: 'fixed', inset: 0, zIndex: 1060, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="card" style={{ width: 520 }}>
                  <div className="card-body">
                    <h5 className="card-title">Xác nhận xoá sinh viên</h5>
                    <p>Bạn có muốn xoá sinh viên <strong>{deleteTarget?.name}</strong> ra khỏi học phần không?</p>
                    <div className="mb-3">
                      <label className="form-label">Chọn nguyên nhân xoá</label>
                      <select className="form-select" value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)}>
                        <option value="">-- Chọn nguyên nhân --</option>
                        <option value="Thôi học">Thôi học</option>
                        <option value="Không đủ điều kiện">Không đủ điều kiện</option>
                        <option value="Lỗi dữ liệu">Lỗi dữ liệu</option>
                        <option value="Nguyên nhân khác">Nguyên nhân khác</option>
                      </select>
                    </div>
                    <div className="d-flex justify-content-end">
                      <button className="btn btn-secondary me-2" onClick={closeDeleteConfirm}>Không</button>
                      <button className="btn btn-danger" onClick={confirmRemoveStudent} disabled={!deleteReason}>Có</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseEdit;
