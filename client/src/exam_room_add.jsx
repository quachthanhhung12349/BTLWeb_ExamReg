import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const ExamRoomAdd = () => {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [building, setBuilding] = useState('');
  const [roomName, setRoomName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [error, setError] = useState('');

  const loadRooms = () => {
    try {
      const raw = localStorage.getItem('examRooms');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  const saveRooms = (rooms) => {
    localStorage.setItem('examRooms', JSON.stringify(rooms));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    setError('');
    if (!id || !building || !roomName || !capacity) {
      setError('Vui lòng điền tất cả các trường.');
      return;
    }
    const rooms = loadRooms();
    if (rooms.find((r) => r.id === id)) {
      setError('Mã phòng đã tồn tại.');
      return;
    }
    const newRoom = { id, building, roomName, capacity: Number(capacity) };
    rooms.unshift(newRoom);
    saveRooms(rooms);
    navigate('/admin/settings');
  };

  const handleCancel = () => {
    navigate('/admin/settings');
  };

  return (
    <div id="page-content-wrapper" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="bg-white border-bottom p-4" style={{ borderRadius: 0 }}>
        <h1 className="h3 mb-3">Thêm ca thi</h1>
      </div>

      <div className="container-fluid p-4" style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <div className="card">
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleAdd}>
              <div className="mb-3">
                <label className="form-label">STT (Mã)</label>
                <input type="text" className="form-control" value={id} onChange={(e) => setId(e.target.value)} />
              </div>

              <div className="mb-3">
                <label className="form-label">Giảng đường</label>
                <input type="text" className="form-control" value={building} onChange={(e) => setBuilding(e.target.value)} />
              </div>

              <div className="mb-3">
                <label className="form-label">Tên phòng thi</label>
                <input type="text" className="form-control" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
              </div>

              <div className="mb-3">
                <label className="form-label">Sức chứa</label>
                <input type="number" className="form-control" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
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

export default ExamRoomAdd;
