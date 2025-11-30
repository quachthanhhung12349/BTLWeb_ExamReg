import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const StudentAdd = () => {
  const navigate = useNavigate();
  const [maSv, setMaSv] = useState('');
  const [hoTen, setHoTen] = useState('');
  const [ngaySinh, setNgaySinh] = useState('');
  const [lop, setLop] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const loadStudents = () => {
    try {
      const raw = localStorage.getItem('students');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  const saveStudents = (students) => {
    localStorage.setItem('students', JSON.stringify(students));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    setError('');
    if (!maSv || !hoTen || !ngaySinh || !lop || !email) {
      setError('Vui lòng điền tất cả các trường.');
      return;
    }

    const students = loadStudents();
    const dupId = students.find((s) => s.maSv === maSv);
    if (dupId) {
      setError('Mã sinh viên đã tồn tại.');
      return;
    }
    const dupEmail = students.find((s) => s.email === email);
    if (dupEmail) {
      setError('Email đã tồn tại.');
      return;
    }

    const newStudent = {
      maSv,
      hoTen,
      ngaySinh,
      lop,
      email,
    };

    students.unshift(newStudent);
    saveStudents(students);

    navigate('/admin/student');
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
                <input type="text" className="form-control" value={maSv} onChange={(e) => setMaSv(e.target.value)} />
              </div>

              <div className="mb-3">
                <label className="form-label">Họ tên sinh viên</label>
                <input type="text" className="form-control" value={hoTen} onChange={(e) => setHoTen(e.target.value)} />
              </div>

              <div className="mb-3">
                <label className="form-label">Ngày sinh</label>
                <input type="date" className="form-control" value={ngaySinh} onChange={(e) => setNgaySinh(e.target.value)} />
              </div>

              <div className="mb-3">
                <label className="form-label">Lớp</label>
                <input type="text" className="form-control" value={lop} onChange={(e) => setLop(e.target.value)} />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary me-2" onClick={handleCancel}>Huỷ</button>
                <button type="submit" className="btn btn-primary">Thêm</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAdd;
