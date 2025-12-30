import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const NotificationDetail = () => {
  const { id } = useParams();
  const [notify, setNotify] = useState(null);
  const studentId = "23021701"; // Nên lấy từ localStorage hoặc AuthContext

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/notifications/detail/${id}`);
        setNotify(res.data);

        // Tự động đánh dấu đã đọc khi xem nội dung
        await axios.put(`http://localhost:5000/api/notifications/read/${id}/${studentId}`);
      } catch (err) {
        console.error("Lỗi khi tải thông báo:", err);
      }
    };
    if (id) fetchDetail();
  }, [id, studentId]);

  if (!notify) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status"></div>
      <span className="ms-2">Đang tải thông báo...</span>
    </div>
  );

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container">
        <div className="card shadow-sm mx-auto border-0 rounded-4 overflow-hidden" style={{ maxWidth: '850px' }}>
          <div className="card-header bg-primary text-white p-4 border-0">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="badge bg-white text-primary text-uppercase mb-2" style={{ fontSize: '0.7rem' }}>Kỳ thi & Lịch thi</span>
                <h2 className="fw-bold mb-1">{notify.title}</h2>
              </div>
              <button className="btn btn-sm btn-light rounded-pill px-3" onClick={() => window.close()}>Đóng Tab</button>
            </div>
            <div className="mt-3 opacity-75 small">
              <i className="bi bi-person-circle me-1"></i> Người gửi: <strong>{notify.sender?.staffName || "Ban Quản lý"}</strong>
              <span className="mx-2">|</span>
              <i className="bi bi-calendar3 me-1"></i> Ngày gửi: {new Date(notify.date).toLocaleString('vi-VN')}
            </div>
          </div>


          <div className="card-body p-4 p-md-5 bg-white">
            <div className="text-dark" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '1.1rem' }}>
              {notify.text}
            </div>


            <div className="mt-5 p-4 rounded-4" style={{ backgroundColor: '#f8f9fa', borderLeft: '5px solid #0d6efd' }}>
              <h6 className="fw-bold text-primary mb-3">
                <i className="bi bi-info-circle-fill me-2"></i>Lưu ý quan trọng cho sinh viên:
              </h6>
              <ul className="mb-0 text-secondary">
                <li className="mb-2">Kiểm tra kỹ mã phòng thi và giờ thi trước khi di chuyển.</li>
                <li>Vui lòng mang theo <strong>Thẻ sinh viên</strong> hoặc giấy tờ tùy thân có ảnh.</li>
                <li className="mt-2">Thông báo này được gửi tự động từ hệ thống Cổng Đào Tạo của Nhà trường.</li>
              </ul>
            </div>
          </div>

          <div className="card-footer bg-white text-center py-4 border-top-0">
            <p className="text-muted small mb-0">© 2024 Cổng Đào Tạo - Đại học Công nghệ</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetail;