import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const SubjectAdd = () => {
  const navigate = useNavigate();
  const [maHp, setMaHp] = useState('');
  const [tenHp, setTenHp] = useState('');
  const [soTC, setSoTC] = useState('');
  const [error, setError] = useState('');

  const loadSubjects = () => {
    try {
      const raw = localStorage.getItem('subjects');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  const saveSubjects = (subjects) => {
    localStorage.setItem('subjects', JSON.stringify(subjects));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    setError('');
    if (!maHp || !tenHp || !soTC) {
      setError('Vui lòng điền tất cả các trường.');
      return;
    }
    const subjects = loadSubjects();
    if (subjects.find((s) => s.maHp === maHp)) {
      setError('Mã học phần đã tồn tại.');
      return;
    }
    const newSubject = { maHp, tenHp, soTC };
    subjects.unshift(newSubject);
    saveSubjects(subjects);
    navigate('/admin/course');
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
                <input type="text" className="form-control" value={maHp} onChange={(e) => setMaHp(e.target.value)} />
              </div>

              <div className="mb-3">
                <label className="form-label">Tên học phần</label>
                <input type="text" className="form-control" value={tenHp} onChange={(e) => setTenHp(e.target.value)} />
              </div>

              <div className="mb-3">
                <label className="form-label">Số tín chỉ</label>
                <input type="number" className="form-control" value={soTC} onChange={(e) => setSoTC(e.target.value)} />
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

export default SubjectAdd;
