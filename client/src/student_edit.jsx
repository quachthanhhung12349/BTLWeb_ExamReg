import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchStudent, updateStudent } from './api/student_api.jsx';
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

export default StudentEdit;
