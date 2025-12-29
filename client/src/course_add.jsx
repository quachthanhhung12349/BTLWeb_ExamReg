import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCourse, enrollAllStudentsInCourse, enrollStudentsInCourse } from './api/course_api.jsx';
import { fetchStudents } from './api/student_api.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';

const CourseAdd = () => {
  const navigate = useNavigate();
  const [courseId, setCourseId] = useState('');
  const [courseName, setCourseName] = useState('');
  const [maxStudents, setMaxStudents] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [enrollAllAfterCreate, setEnrollAllAfterCreate] = useState(true);
  const [onlyEligible, setOnlyEligible] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
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

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    if (!courseId || !courseName) {
      setError('Vui lòng điền tất cả các trường.');
      return;
    }
    setLoading(true);
    try {
      const created = await createCourse({ courseId, courseName, maxStudents: Number(maxStudents) });
      if (enrollAllAfterCreate && created && created._id) {
        try {
          await enrollAllStudentsInCourse(created._id, onlyEligible);
        } catch (err2) {
          console.error('Auto-enroll failed:', err2);
          alert(err2.message || 'Tự động thêm sinh viên vào học phần thất bại.');
        }
      }
      // Enroll specifically selected students (if any)
      if (created && created._id && selectedIds.size) {
        try {
          await enrollStudentsInCourse(created._id, Array.from(selectedIds));
        } catch (err3) {
          console.error('Enroll selected failed:', err3);
          alert(err3.message || 'Thêm sinh viên đã chọn vào học phần thất bại.');
        }
      }
      navigate('/admin/course');
    } catch (err) {
      setError(err.message || 'Lỗi khi thêm học phần.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/course');
  };

  return (
    <div id="page-content-wrapper" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="bg-white border-bottom p-4" style={{ borderRadius: 0 }}>
        <h1 className="h3 mb-3">Thêm học phần</h1>
      </div>

      <div className="container-fluid p-4" style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <div className="card">
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleAdd}>

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
                <button type="button" className="btn btn-secondary me-2" onClick={handleCancel}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Đang thêm...' : 'Thêm'}</button>
              </div>
            </form>

            <hr className="my-4" />
            <div className="form-check mb-2">
              <input
                id="enrollAllAfterCreate"
                type="checkbox"
                className="form-check-input"
                checked={enrollAllAfterCreate}
                onChange={(e) => setEnrollAllAfterCreate(e.target.checked)}
              />
              <label htmlFor="enrollAllAfterCreate" className="form-check-label">
                Tự động thêm tất cả sinh viên vào học phần sau khi tạo
              </label>
            </div>
            <div className="form-check">
              <input
                id="onlyEligible"
                type="checkbox"
                className="form-check-input"
                checked={onlyEligible}
                onChange={(e) => setOnlyEligible(e.target.checked)}
                disabled={!enrollAllAfterCreate}
              />
              <label htmlFor="onlyEligible" className="form-check-label">
                Chỉ thêm sinh viên đủ điều kiện dự thi
              </label>
            </div>

            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="mb-0">Thêm sinh viên vào học phần</h5>
                <button type="button" className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Thêm sinh viên</button>
              </div>
              <small className="text-muted">Sinh viên đã chọn: {selectedIds.size}</small>
            </div>

            {showAddModal && (
              <div>
                <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, zIndex: 1050 }} />
                <div style={{ position: 'fixed', inset: 0, zIndex: 1060, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="card" style={{ width: 800 }}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="card-title mb-0">Chọn sinh viên</h5>
                        <button className="btn btn-outline-secondary" onClick={() => setShowAddModal(false)}>Đóng</button>
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
                                const checked = selectedIds.has(s._id);
                                return (
                                  <tr key={s._id}>
                                    <td>
                                      <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={checked}
                                        onChange={() => setSelectedIds(prev => { const next = new Set(prev); if (next.has(s._id)) next.delete(s._id); else next.add(s._id); return next; })}
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
                        <button className="btn btn-secondary me-2" onClick={() => setShowAddModal(false)}>Đóng</button>
                        <button className="btn btn-primary" onClick={() => setShowAddModal(false)}>Xong</button>
                      </div>
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

export default CourseAdd;
