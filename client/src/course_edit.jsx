import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCourse, updateCourse } from './api/course_api.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';

const CourseEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courseId, setCourseId] = useState('');
  const [courseName, setCourseName] = useState('');
  const [maxStudents, setMaxStudents] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseEdit;
