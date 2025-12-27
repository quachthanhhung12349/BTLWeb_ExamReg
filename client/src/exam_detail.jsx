import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExamDetail, addSession, deleteSession } from './api/exam_api'; 

const ExamDetail = () => {
    const { id } = useParams(); // Lấy ID từ URL
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);

    // Form thêm ca thi
    const [sessionForm, setSessionForm] = useState({
        course: '', examDate: '', startTime: '', endTime: '', roomId: '' 
    });

    useEffect(() => {
        loadData();
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

    const handleAddSession = async (e) => {
        e.preventDefault();
        try {
            await addSession(id, sessionForm);
            alert('Thêm ca thi thành công!');
            setSessionForm({ course: '', examDate: '', startTime: '', endTime: '', roomId: '' });
            loadData(); // Tải lại để thấy dữ liệu mới
        } catch (error) {
            alert(error.message);
        }
    };

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
                        Thời gian: {new Date(exam.startDate).toLocaleDateString('en-GB')} - {new Date(exam.endDate).toLocaleDateString('en-GB')}
                    </p>
                </div>
            </div>

            <div className="row">
                {/* Form Thêm */}
                <div className="col-md-4">
                    <div className="card p-3 shadow-sm">
                        <h5 className="mb-3">Thêm Ca thi (Session)</h5>
                        <form onSubmit={handleAddSession}>
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
                            <div className="mb-3">
                                <label>Phòng thi (Nhập tên/ID)</label>
                                <input type="text" className="form-control" placeholder="VD: 302-G2"
                                    value={sessionForm.roomId}
                                    onChange={e => setSessionForm({...sessionForm, roomId: e.target.value})} />
                            </div>
                            <button type="submit" className="btn btn-success w-100">Lưu Ca thi</button>
                        </form>
                    </div>
                </div>

                {/* Danh sách */}
                <div className="col-md-8">
                    <div className="card shadow-sm">
                        <div className="card-header bg-white fw-bold">Danh sách Ca thi ({exam.sessions.length})</div>
                        <table className="table table-hover mb-0">
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
                                            <td>{new Date(ss.examDate).toLocaleDateString('vi-VN')}</td>
                                            <td>
                                                {new Date(ss.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} 
                                                {' - '} 
                                                {new Date(ss.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td>{ss.roomId || 'Chưa xếp'}</td>
                                            <td>
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
    );
};

export default ExamDetail;