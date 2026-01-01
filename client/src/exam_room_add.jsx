import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createExamRoom } from './api/exam_room_api.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';

const ExamRoomAdd = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [building, setBuilding] = useState('');
  const [roomName, setRoomName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    const trimmedRoomId = roomId.trim();
    const trimmedBuilding = building.trim();
    const trimmedRoomName = roomName.trim();
    const numericCapacity = Number(capacity);

    if (!trimmedRoomId || !trimmedBuilding || !trimmedRoomName || !Number.isFinite(numericCapacity) || numericCapacity <= 0) {
      setError('Vui lòng nhập đầy đủ thông tin và sức chứa hợp lệ.');
      return;
    }
    setLoading(true);
    try {
      await createExamRoom({ roomId: trimmedRoomId, campus: trimmedBuilding, room: trimmedRoomName, maxStudents: numericCapacity });
      navigate('/admin/exam-rooms');
    } catch (err) {
      setError(err.message || 'Lỗi khi thêm phòng thi.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/exam-rooms');
  };

  return (
    <div id="page-content-wrapper" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="bg-white border-bottom p-4" style={{ borderRadius: 0 }}>
        <h1 className="h3 mb-3">Thêm phòng thi</h1>
      </div>

      <div className="container-fluid p-4" style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <div className="card">
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleAdd}>

              <div className="mb-3">
                <label className="form-label">STT (Mã)</label>
                <input type="text" className="form-control" value={roomId} onChange={(e) => setRoomId(e.target.value)} disabled={loading} />
              </div>

              <div className="mb-3">
                <label className="form-label">Giảng đường</label>
                <input type="text" className="form-control" value={building} onChange={(e) => setBuilding(e.target.value)} disabled={loading} />
              </div>

              <div className="mb-3">
                <label className="form-label">Tên phòng thi</label>
                <input type="text" className="form-control" value={roomName} onChange={(e) => setRoomName(e.target.value)} disabled={loading} />
              </div>

              <div className="mb-3">
                <label className="form-label">Sức chứa</label>
                <input type="number" className="form-control" value={capacity} onChange={(e) => setCapacity(e.target.value)} disabled={loading} />
              </div>

              <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary me-2" onClick={handleCancel}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Đang thêm...' : 'Thêm'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamRoomAdd;
