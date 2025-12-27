import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { getExams, createExam, deleteExam } from './api/exam_api'; // Import API
import { useNavigate } from 'react-router-dom';

const ExamManagement = () => {
    const [exams, setExams] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false); // State để hiện popup thêm mới
    const navigate = useNavigate();
    
    // State form thêm mới
    const [formData, setFormData] = useState({
        examId: '',
        examName: '',
        startDate: '',
        endDate: ''
    });

    // 1. Load dữ liệu từ Server khi vào trang
    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const data = await getExams();
            if (data.success) setExams(data.exams);
        } catch (error) {
            console.error('Lỗi tải dữ liệu:', error);
        }
    };

    // 2. Xử lý thêm mới
    const handleCreate = async () => {
        try {
            await createExam(formData);
            alert('Thêm kỳ thi thành công!');
            setShowModal(false);
            fetchExams(); // Tải lại danh sách
            setFormData({ examId: '', examName: '', startDate: '', endDate: '' }); // Reset form
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };

    // 3. Xử lý xóa
    const handleDelete = async (id) => {
        if (window.confirm('Bạn chắc chắn muốn xóa kỳ thi này?')) {
            try {
                await deleteExam(id);
                fetchExams();
            } catch (error) {
                alert('Lỗi: ' + error.message);
            }
        }
    };

    return (
       <div id="page-content-wrapper" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* --- HEADER --- */}
            <div className="bg-white border-bottom p-4" style={{ borderRadius: 0 }}>
                <h1 className="h3 mb-3">Quản lý Kỳ thi</h1> {/* Đổi tiêu đề */}
                
                <div style={{ display: 'flex', justifyContent: 'space-between'}}>
                    <div className="input-group" style={{ maxWidth: '600px' }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Tìm kiếm mã hoặc tên kỳ thi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="btn btn-outline-secondary" type="button">🔍</button>
                    </div>
                    {/* Nút mở Modal thêm mới */}
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        + Thêm Kỳ thi
                    </button>
                </div>
            </div>

            {/* --- LIST CONTENT --- */}
            <div className="container-fluid p-4" style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
                <div className="card shadow-sm">
                    <div className="card-body p-0">
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table table-striped table-hover m-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="p-3">Mã kỳ thi</th>
                                        <th className="p-3">Tên kỳ thi</th>
                                        <th className="p-3">Ngày bắt đầu</th>
                                        <th className="p-3">Ngày kết thúc</th>
                                        <th className="p-3 text-center">Số ca thi</th>
                                        <th className="p-3 text-center">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exams.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center p-4">Chưa có dữ liệu</td></tr>
                                    ) : (
                                        exams.filter(e => e.examName.toLowerCase().includes(searchTerm.toLowerCase()) || e.examId.toLowerCase().includes(searchTerm.toLowerCase()))
                                        .map((exam) => (
                                            <tr key={exam._id}>
                                                <td className="p-3 fw-bold text-primary">{exam.examId}</td>
                                                <td className="p-3">{exam.examName}</td>
                                                <td className="p-3">{new Date(exam.startDate).toLocaleDateString('vi-VN')}</td>
                                                <td className="p-3">{new Date(exam.endDate).toLocaleDateString('vi-VN')}</td>
                                                <td className="p-3 text-center">
                                                    <span className="badge bg-secondary">{exam.sessions ? exam.sessions.length : 0}</span>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <button className="btn btn-sm btn-outline-primary me-2"onClick={() => navigate(`/admin/exam/${exam._id}`)}>Chi tiết</button>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(exam._id)}>🗑</button>
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

            {/* --- MODAL THÊM MỚI (Popup đơn giản) --- */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Tạo Kỳ thi Mới</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label>Mã kỳ thi</label>
                                    <input type="text" className="form-control" 
                                        value={formData.examId} 
                                        onChange={(e) => setFormData({...formData, examId: e.target.value})} 
                                        placeholder="VD: K1-2024"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label>Tên kỳ thi</label>
                                    <input type="text" className="form-control" 
                                        value={formData.examName} 
                                        onChange={(e) => setFormData({...formData, examName: e.target.value})} 
                                        placeholder="VD: Kỳ thi hết môn Web"
                                    />
                                </div>
                                <div className="row">
                                    <div className="col-6 mb-3">
                                        <label>Ngày bắt đầu</label>
                                        <input type="date" className="form-control" 
                                            value={formData.startDate} 
                                            onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
                                        />
                                    </div>
                                    <div className="col-6 mb-3">
                                        <label>Ngày kết thúc</label>
                                        <input type="date" className="form-control" 
                                            value={formData.endDate} 
                                            onChange={(e) => setFormData({...formData, endDate: e.target.value})} 
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="button" className="btn btn-primary" onClick={handleCreate}>Lưu lại</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExamManagement;