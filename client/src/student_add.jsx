import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStudent } from './api/student_api.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';

const StudentAdd = () => {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [class_, setClass] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!studentId || !name || !birthDate || !class_ || !email) {
      setError('Vui lòng điền tất cả các trường.');
      return;
    }

    setLoading(true);
    try {
      await createStudent({
        studentId,
        name,
        birthDate,
        class: class_,
        email
      });
      navigate('/admin/student');
    } catch (err) {
      setError(err.message || 'Lỗi khi thêm sinh viên.');
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
        <h1 className="h3 mb-3">Thêm sinh viên</h1>
      </div>

      <div className="container-fluid p-4" style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <div className="card">
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleAdd}>
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

              <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary me-2" onClick={handleCancel} disabled={loading}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Đang thêm...' : 'Thêm'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAdd;
