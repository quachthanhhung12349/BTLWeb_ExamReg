import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchExamRoom, updateExamRoom } from './api/exam_room_api.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';

const ExamRoomEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [building, setBuilding] = useState('');
  const [roomName, setRoomName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetchExamRoom(id);
        if (mounted) {
          if (!r) return navigate('/admin/exam-rooms');
          setRoomId(r.roomId || '');
          setBuilding(r.campus || '');
          setRoomName(r.room || '');
          setCapacity(r.maxStudents || '');
        }
      } catch (err) {
        navigate('/admin/exam-rooms');
      }
    })();
    return () => (mounted = false);
  }, [id, navigate]);

  const handleOk = async (e) => {
    e.preventDefault();
    setError('');
    if (!roomId || !building || !roomName || !capacity) {
      setError('Vui lòng điền tất cả các trường.');
      return;
    }
    setLoading(true);
    try {
      await updateExamRoom(id, { roomId, building, roomName, capacity: Number(capacity) });
      navigate('/admin/exam-rooms');
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật ca thi.');
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
        <h1 className="h3 mb-3">Chỉnh sửa ca thi</h1>
      </div>

      <div className="container-fluid p-4" style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <div className="card">
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleOk}>

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
                <button type="submit" className="btn btn-primary">OK</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamRoomEdit;
