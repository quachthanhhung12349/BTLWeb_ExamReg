import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExamDetail, addSession, deleteSession, updateSession } from './api/exam_api'; 
import { fetchExamRooms } from './api/exam_room_api';

const ExamDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Data states
    const [exam, setExam] = useState(null);
    const [rooms, setRooms] = useState([]); // State chứa danh sách phòng thi
    const [loading, setLoading] = useState(true);

    // Form state
    const [sessionForm, setSessionForm] = useState({
        course: '', examDate: '', startTime: '', endTime: '', roomId: '' 
    });

    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [editingSessionId, setEditingSessionId] = useState(null);

    // Format Helpers
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    const formatTimeForInput = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };

    // Load dữ liệu ban đầu
    useEffect(() => {
        loadData();
        loadRooms(); // Tải danh sách phòng thi
    }, []);

    const loadData = async () => {
        try {
            const data = await getExamDetail(id);
            if (data.success) setExam(data.exam);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadRooms = async () => {
        try {
            const roomList = await fetchExamRooms(); // Gọi API lấy phòng
            setRooms(roomList || []);
        } catch (error) {
            console.error("Lỗi tải phòng:", error);
        }
    };

    // Xử lý Submit (Thêm/Sửa)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await updateSession(id, editingSessionId, sessionForm);
                alert('Cập nhật ca thi thành công!');
                handleCancelEdit();
            } else {
                await addSession(id, sessionForm);
                alert('Thêm ca thi thành công!');
                // Reset form giữ lại ngày để nhập tiếp cho tiện
                setSessionForm(prev => ({ ...prev, course: '', startTime: '', endTime: '' })); 
            }
            loadData();
        } catch (error) {
            alert(error.message);
        }
    };

    // Bắt đầu sửa
    const handleEditClick = (session) => {
        setIsEditing(true);
        setEditingSessionId(session._id);
        
        // Fill data vào form
        setSessionForm({
            course: session.course,
            examDate: session.examDate.split('T')[0],
            startTime: formatTimeForInput(session.startTime),
            endTime: formatTimeForInput(session.endTime),
            roomId: session.roomId || '' // Nếu có ID phòng thì điền vào
        });
    };

    // Hủy sửa
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingSessionId(null);
        setSessionForm({ course: '', examDate: '', startTime: '', endTime: '', roomId: '' });
    };

    // Xóa
    const handleDeleteSession = async (sessionId) => {
        if(window.confirm('Xóa ca thi này?')) {
            try {
                await deleteSession(id, sessionId);
                loadData();
            } catch (error) {
                alert(error.message);
            }
        }
    };

    // Helper: Tìm tên phòng dựa vào ID (để hiển thị trong bảng)
    const getRoomName = (id) => {
        const found = rooms.find(r => r._id === id || r.roomId === id);
        return found ? found.roomId : id;
    };

    if (loading) return <div className="p-4">Đang tải...</div>;
    if (!exam) return <div className="p-4">Không tìm thấy kỳ thi!</div>;

    return (
        <div className="container-fluid p-4">
            <button className="btn btn-outline-secondary mb-3" onClick={() => navigate('/admin/reports')}>
                ← Quay lại danh sách
            </button>

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h2 className="text-primary">{exam.examName} ({exam.examId})</h2>
                    <p className="mb-0">
                        Thời gian: {formatDate(exam.startDate)} - {formatDate(exam.endDate)}
                    </p>
                </div>
            </div>

            <div className="row">
                {/* FORM INPUT */}
                <div className="col-md-4">
                    <div className={`card p-3 shadow-sm ${isEditing ? 'border-warning' : ''}`}>
                        <h5 className={`mb-3 ${isEditing ? 'text-warning' : 'text-success'}`}>
                            {isEditing ? '✏️ Chỉnh sửa Ca thi' : '+ Thêm Ca thi mới'}
                        </h5>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-2">
                                <label>Môn thi</label>
                                <input type="text" className="form-control" required placeholder="VD: Tin học cơ sở"
                                    value={sessionForm.course}
                                    onChange={e => setSessionForm({...sessionForm, course: e.target.value})} />
                            </div>
                            <div className="mb-2">
                                <label>Ngày thi</label>
                                <input type="date" className="form-control" required
                                    value={sessionForm.examDate}
                                    onChange={e => setSessionForm({...sessionForm, examDate: e.target.value})} />
                            </div>
                            <div className="row">
                                <div className="col-6 mb-2">
                                    <label>Bắt đầu</label>
                                    <input type="time" className="form-control" required
                                        value={sessionForm.startTime}
                                        onChange={e => setSessionForm({...sessionForm, startTime: e.target.value})} />
                                </div>
                                <div className="col-6 mb-2">
                                    <label>Kết thúc</label>
                                    <input type="time" className="form-control" required
                                        value={sessionForm.endTime}
                                        onChange={e => setSessionForm({...sessionForm, endTime: e.target.value})} />
                                </div>
                            </div>
                            
                            {/* --- SELECT BOX PHÒNG THI --- */}
                            <div className="mb-3">
                                <label>Phòng thi</label>
                                <select 
                                    className="form-select"
                                    value={sessionForm.roomId}
                                    onChange={e => setSessionForm({...sessionForm, roomId: e.target.value})}
                                >
                                    <option value="">-- Chọn phòng thi --</option>
                                    {rooms.map(r => (
                                        <option key={r._id} value={r._id}>
                                            {r.roomId} (Sức chứa: {r.maxStudents})
                                        </option>
                                    ))}
                                </select>
                                <small className="text-muted">Chọn phòng từ danh sách có sẵn</small>
                            </div>

                            <button type="submit" className={`btn w-100 ${isEditing ? 'btn-warning' : 'btn-success'}`}>
                                {isEditing ? 'Lưu thay đổi' : 'Lưu Ca thi'}
                            </button>
                            
                            {isEditing && (
                                <button type="button" className="btn btn-secondary w-100 mt-2" onClick={handleCancelEdit}>
                                    Hủy bỏ
                                </button>
                            )}
                        </form>
                    </div>
                </div>

                {/* TABLE LIST */}
                <div className="col-md-8">
                    <div className="card shadow-sm">
                        <div className="card-header bg-white fw-bold">Danh sách Ca thi ({exam.sessions.length})</div>
                        <div className="table-responsive">
                            <table className="table table-hover mb-0 align-middle">
                                <thead>
                                    <tr>
                                        <th>Môn</th>
                                        <th>Ngày</th>
                                        <th>Giờ</th>
                                        <th>Phòng</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exam.sessions.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center text-muted p-3">Chưa có ca thi nào</td></tr>
                                    ) : (
                                        exam.sessions.map((ss, idx) => (
                                            <tr key={idx}>
                                                <td className="fw-bold">{ss.course}</td>
                                                <td>{formatDate(ss.examDate)}</td>
                                                <td>
                                                    {new Date(ss.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} 
                                                    {' - '} 
                                                    {new Date(ss.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td>
                                                    {/* Hiển thị tên phòng thay vì ID loằng ngoằng */}
                                                    {ss.roomId ? (
                                                        <span className="badge bg-light text-dark border">
                                                            {getRoomName(ss.roomId)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted fst-italic">Chưa xếp</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-info me-2" 
                                                        onClick={() => handleEditClick(ss)}>Sửa</button>
                                                    <button className="btn btn-sm btn-outline-danger" 
                                                        onClick={() => handleDeleteSession(ss._id)}>Xóa</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamDetail;