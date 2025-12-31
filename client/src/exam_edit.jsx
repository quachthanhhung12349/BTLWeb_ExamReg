import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getApiBase } from './api/base';

/**
 * Component chinh sua ky thi.
 * @returns {JSX.Element}
 */
const ExamEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    semester: '1',
    year: '',
    description: '',
    status: 'active',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(true);

  const formatForInput = (isoDateString) => {
    if (!isoDateString) return '';
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const baseUrl = await getApiBase();
        const response = await fetch(`${baseUrl}/api/exams/${id}`);
        
        if (response.ok) {
          const data = await response.json();
          setFormData({
            name: data.name || data.examName || '',
            semester: data.semester || '1',
            year: data.year || '',
            description: data.description || '',
            status: data.status || 'active',
            startDate: formatForInput(data.startDate),
            endDate: formatForInput(data.endDate)
          });
        } else {
          alert('Không tìm thấy kỳ thi!');
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const baseUrl = await getApiBase();
      const response = await fetch(`${baseUrl}/api/exams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Cập nhật thành công!');
        navigate('/admin/reports'); 
      } else {
        const err = await response.json();
        alert('Lỗi cập nhật: ' + (err.message || 'Không xác định'));
      }
    } catch (error) {
      console.error('Lỗi gửi form:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="text-center mt-5">⏳ Đang tải thông tin kỳ thi...</div>;

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header bg-warning text-dark">
          <h4 className="mb-0"><i className="bi bi-pencil-square"></i> Chỉnh sửa Kỳ thi</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-bold">Tên kỳ thi</label>
              <input 
                type="text" 
                className="form-control" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Học kỳ</label>
                <select 
                  className="form-select" 
                  name="semester" 
                  value={formData.semester} 
                  onChange={handleChange}
                >
                  <option value="1">Học kỳ 1</option>
                  <option value="2">Học kỳ 2</option>
                  <option value="Hè">Học kỳ Hè</option>
                </select>
              </div>
              
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Năm học</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="year" 
                  value={formData.year} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Ngày bắt đầu</label>
                <input 
                  type="date" 
                  className="form-control" 
                  name="startDate" 
                  value={formData.startDate} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Ngày kết thúc</label>
                <input 
                  type="date" 
                  className="form-control" 
                  name="endDate" 
                  value={formData.endDate} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            {/* Mô tả */}
            <div className="mb-3">
              <label className="form-label fw-bold">Mô tả</label>
              <textarea 
                className="form-control" 
                name="description" 
                rows="3" 
                value={formData.description} 
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Trạng thái */}
            <div className="mb-3">
              <label className="form-label fw-bold">Trạng thái</label>
              <select 
                className="form-select" 
                name="status" 
                value={formData.status} 
                onChange={handleChange}
              >
                <option value="active">Đang mở (Active)</option>
                <option value="completed">Đã kết thúc (Completed)</option>
                <option value="upcoming">Sắp diễn ra (Upcoming)</option>
              </select>
            </div>

            {/* Nút bấm */}
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-save me-2"></i>Lưu thay đổi
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => navigate('/admin/reports')}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExamEdit;