import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const SubjectEdit = () => {
  const { maHp: paramMa } = useParams();
  const navigate = useNavigate();
  const [maHp, setMaHp] = useState('');
  const [tenHp, setTenHp] = useState('');
  const [soTC, setSoTC] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('subjects');
      const subjects = raw ? JSON.parse(raw) : [];
      const s = subjects.find((x) => x.maHp === paramMa);
      if (s) {
        setMaHp(s.maHp);
        setTenHp(s.tenHp);
        setSoTC(s.soTC);
      } else {
        navigate('/admin/course');
      }
    } catch (e) {
      navigate('/admin/course');
    }
  }, [paramMa, navigate]);

  const handleOk = (e) => {
    e.preventDefault();
    setError('');
    if (!maHp || !tenHp || !soTC) {
      setError('Vui lòng điền tất cả các trường.');
      return;
    }
    const raw = localStorage.getItem('subjects');
    const subjects = raw ? JSON.parse(raw) : [];
    const dup = subjects.find((s) => s.maHp === maHp && s.maHp !== paramMa);
    if (dup) {
      setError('Mã học phần đã tồn tại.');
      return;
    }
    const updated = subjects.map((s) => (s.maHp === paramMa ? { maHp, tenHp, soTC } : s));
    localStorage.setItem('subjects', JSON.stringify(updated));
    navigate('/admin/course');
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
                <button type="submit" className="btn btn-primary">OK</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectEdit;
