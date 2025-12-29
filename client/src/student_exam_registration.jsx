import React, { useState, useEffect } from "react";
import axios from "axios"; // Đừng quên cài đặt: npm install axios
import Sidebar from "./sidebar_student.jsx";
import HeaderStudent from "./student_header.jsx";

const RegistrationPage = ({ onLogout }) => {
  const [search, setSearch] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Giả sử lấy mã sinh viên từ hệ thống đăng nhập
  const studentId = "23021701";
  const API_BASE_URL = "http://localhost:5000/api/registration";

  // 1. Hàm lấy dữ liệu từ Backend
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/status/${studentId}`);
      setSubjects(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách môn học:", error);
      alert("Không thể tải danh sách môn học. Hãy kiểm tra kết nối Backend!");
      setLoading(false);
    }
  };

  // Gọi hàm fetch khi component mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  // 2. Xử lý Đăng ký
  const handleRegister = async (courseId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, {
        studentId,
        courseId
      });

      if (response.data.success) {
        // CẬP NHẬT TRỰC TIẾP STATE ĐỂ UI THAY ĐỔI NGAY LẬP TỨC
        setSubjects(prevSubjects =>
          prevSubjects.map(s =>
            s.code === courseId ? { ...s, registered: true } : s
          )
        );
        alert("Đăng ký thành công!");
        // Vẫn gọi fetchSubjects để đảm bảo dữ liệu đồng bộ hoàn toàn với DB
        fetchSubjects();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Đăng ký thất bại");
    }
  };

  // 3. Xử lý Hủy đăng ký
  const handleUnregister = async (courseId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đăng ký môn này?")) {
      try {
        const response = await axios.post(`${API_BASE_URL}/unregister`, {
          studentId,
          courseId
        });

        if (response.data.success) {
          // CẬP NHẬT TRỰC TIẾP STATE
          setSubjects(prevSubjects =>
            prevSubjects.map(s =>
              s.code === courseId ? { ...s, registered: false } : s
            )
          );
          fetchSubjects();
        }
      } catch (error) {
        alert(error.response?.data?.message || "Hủy đăng ký thất bại");
      }
    }
  };

  // Logic lọc tìm kiếm
  const filtered = subjects.filter(s =>
    s.code.toLowerCase().includes(search.toLowerCase()) ||
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="d-flex vh-100 bg-light">
      <Sidebar onLogout={onLogout} />

      <main className="flex-grow-1 p-4 overflow-auto">
        <HeaderStudent
          title="Đăng ký ca thi"
          subTitle="Học kỳ 1 năm học 2023-2024"
          notificationCount={3}
        >
          <button className="btn btn-primary d-flex align-items-center shadow-sm" style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5' }}>
            Đăng ký nhanh
          </button>
        </HeaderStudent>

        {/* SEARCH BAR */}
        <div className="bg-white p-3 rounded-3 shadow-sm mb-4 border">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-search"></i></span>
            <input
              type="text"
              placeholder="Tìm kiếm theo mã học phần..."
              className="form-control border-start-0 shadow-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="card shadow-sm border-0 mb-4 rounded-3 overflow-hidden">
          <div className="card-body p-0">
            {loading ? (
              <div className="p-5 text-center">Đang tải dữ liệu...</div>
            ) : (
              <table className="table table-hover mb-0 align-middle">
                <thead className="bg-light text-uppercase">
                  <tr>
                    <th className="p-3 ps-4 text-secondary small fw-bold">STT</th>
                    <th className="p-3 text-secondary small fw-bold">Mã môn</th>
                    <th className="p-3 text-secondary small fw-bold">Tên môn</th>
                    <th className="p-3 text-secondary small fw-bold text-center">Tín chỉ</th>
                    <th className="p-3 text-secondary small fw-bold">Trạng thái</th>
                    <th className="p-3 text-secondary small fw-bold text-end pe-4">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, index) => (
                    <tr key={s.id}>
                      <td className="p-3 ps-4 fw-bold text-muted">{index + 1}</td>
                      <td className="p-3 fw-semibold text-dark">{s.code}</td>
                      <td className="p-3">{s.name}</td>
                      <td className="p-3 text-center text-muted">{s.credits}</td>
                      <td className="p-3">
                        {s.registered ? (
                          <span className="badge bg-success bg-opacity-10 text-success border px-2 py-1 fw-normal" style={{ fontSize: '0.75rem' }}>Đã đăng ký</span>
                        ) : (
                          <span className="text-muted small fst-italic">Chưa đăng ký</span>
                        )}
                      </td>
                      <td className="p-3 text-end pe-4">
                        {!s.registered ? (
                          <button
                            className="btn btn-primary btn-sm px-3 fw-bold"
                            onClick={() => handleRegister(s.code)}
                            style={{ backgroundColor: '#2563eb' }}
                          >
                            Đăng ký
                          </button>
                        ) : (
                          <button
                            className="btn btn-outline-danger btn-sm px-3 fw-bold"
                            onClick={() => handleUnregister(s.code)}
                          >
                            Hủy
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card-footer bg-white border-top p-3 d-flex justify-content-between align-items-center">
            <span className="text-muted" style={{ fontSize: '0.9rem' }}>
              Hiển thị {filtered.length} môn học
            </span>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary px-3 py-1 bg-white text-dark shadow-sm border-light-subtle rounded-2">Trước</button>
              <button className="btn btn-outline-secondary px-3 py-1 bg-white text-dark shadow-sm border-light-subtle rounded-2">Sau</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegistrationPage;