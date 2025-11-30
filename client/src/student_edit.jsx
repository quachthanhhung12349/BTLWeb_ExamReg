import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const StudentEdit = () => {
  const { maSv: paramMa } = useParams();
  const navigate = useNavigate();
  const [maSv, setMaSv] = useState('');
  const [hoTen, setHoTen] = useState('');
  const [ngaySinh, setNgaySinh] = useState('');
  const [lop, setLop] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('students');
      const students = raw ? JSON.parse(raw) : [];
      const s = students.find((x) => x.maSv === paramMa);
      if (s) {
        setMaSv(s.maSv);
        setHoTen(s.hoTen);
        setNgaySinh(s.ngaySinh);
        setLop(s.lop);
        setEmail(s.email);
      } else {
        // if student not found, go back
        navigate('/admin/student');
      }
    } catch (e) {
      navigate('/admin/student');
    }
  }, [paramMa, navigate]);

  const isValidEmail = (em) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
  };

  const handleOk = (e) => {
    e.preventDefault();
    setError('');
    if (!maSv || !hoTen || !ngaySinh || !lop || !email) {
      setError('Vui lòng điền tất cả các trường.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Email không hợp lệ.');
      return;
    }

    const raw = localStorage.getItem('students');
    const students = raw ? JSON.parse(raw) : [];

    // check duplicates excluding current
    const dupId = students.find((s) => s.maSv === maSv && s.maSv !== paramMa);
    if (dupId) {
      setError('Mã sinh viên đã tồn tại.');
      return;
    }
    const dupEmail = students.find((s) => s.email === email && s.maSv !== paramMa);
    if (dupEmail) {
      setError('Email đã tồn tại.');
      return;
    }

    const updated = students.map((s) => {
      if (s.maSv === paramMa) {
        return { maSv, hoTen, ngaySinh, lop, email };
      }
      return s;
    });
    localStorage.setItem('students', JSON.stringify(updated));
    navigate('/admin/student');
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
                <button type="submit" className="btn btn-primary">OK</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentEdit;
