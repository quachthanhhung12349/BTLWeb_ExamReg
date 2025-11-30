import React, { useState } from "react";
import logo from "./assets/logo.png";

const mockSubjects = [
  { id: 1, code: "INT3306", name: "Phát triển ứng dụng Web", credits: 3, registered: false },
  { id: 2, code: "INT3405E", name: "Học máy", credits: 3, registered: true },
  { id: 3, code: "PHI1006", name: "Triết học Mác – Lênin", credits: 3, registered: false },
  { id: 4, code: "INT2212", name: "Kiến trúc máy tính", credits: 4, registered: false },
  { id: 5, code: "PHI1002", name: "Chủ nghĩa xã hội khoa học", credits: 2, registered: true },
];

export default function StudentExamRegistrationPage({ onLogout }) {
  const [search, setSearch] = useState("");
  const [subjects, setSubjects] = useState(mockSubjects);

  const handleRegister = (id) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, registered: true } : s))
    );
  };

  const handleUnregister = (id) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, registered: false } : s))
    );
  };

  const filtered = subjects.filter(
    (s) =>
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="d-flex vh-100 bg-light">
      <aside 
        className="bg-white border-end d-flex flex-column p-3 shadow-sm" 
        style={{ width: "280px", minWidth: "280px", zIndex: 1000 }}
      >
        {/* LOGO & TITLE */}
        <div className="d-flex align-items-center mb-4 px-2 pt-2">
          <img 
            src={logo} 
            alt="Logo" 
            className="me-3"
            style={{ 
                width: "45px",       
                height: "45px",      
                objectFit: "contain" 
            }} 
          />
          <div style={{ lineHeight: "1.2" }}>
             <h1 className="h6 fw-bold mb-0 text-primary text-uppercase" style={{ letterSpacing: '0.5px' }}>Cổng Đào Tạo</h1>
             <small className="text-muted" style={{ fontSize: '0.75rem' }}>Đại học Công nghệ</small>
          </div>
        </div>

        <hr className="text-secondary opacity-25 my-2" />

        {/* 2. MENU */}
        <ul className="nav nav-pills flex-column gap-2 mb-auto mt-3">
          <li className="nav-item">
            <a 
                className="nav-link active d-flex align-items-center shadow-sm" 
                href="#" 
                style={{ backgroundColor: '#4f46e5', fontWeight: '500' }}
            >
              <i className="bi bi-pencil-square me-3"></i>
              Đăng ký thi
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link text-dark d-flex align-items-center" href="#" style={{ opacity: 0.8 }}>
              <i className="bi bi-journal-check me-3"></i>
              Môn đã đăng ký
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link text-dark d-flex align-items-center" href="#" style={{ opacity: 0.8 }}>
              <i className="bi bi-file-earmark-text me-3"></i>
              Phiếu báo dự thi
            </a>
          </li>
        </ul>

        <div className="mt-auto pt-3 border-top">
            {/* Thông tin user */}
            <div className="d-flex align-items-center p-2 mb-2 rounded-3 bg-light border">
                <div 
                    className="rounded-circle bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center me-3" 
                    style={{ width: "38px", height: "38px" }}
                >
                    <i className="bi bi-person-fill text-secondary fs-5"></i>
                </div>
                
                <div style={{ lineHeight: '1.1' }}>
                    <div className="fw-bold text-dark" style={{ fontSize: "0.9rem" }}>Nguyễn Văn A</div>
                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>Sinh viên</div>
                </div>
            </div>

            {/* Nút đăng xuất */}
            <button 
                onClick={onLogout} 
                className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center" 
                title="Đăng xuất"
            >
                <i className="bi bi-box-arrow-right me-2"></i>
                Đăng xuất
            </button>
        </div>
      </aside>

      <main className="flex-grow-1 p-4 overflow-auto bg-light">
        
        {/* HEADER PAGE */}
        <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 className="h4 fw-bold text-dark mb-1">Đăng ký ca thi</h2>
                <p className="text-muted small mb-0">Học kỳ 1 năm học 2023-2024</p>
            </div>
            
            <button className="btn btn-primary d-flex align-items-center shadow-sm" style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5' }}>
                <i className="bi bi-plus-lg me-2"></i> Đăng ký nhanh
            </button>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white p-3 rounded-3 shadow-sm mb-4 border">
            <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-search"></i></span>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo mã học phần hoặc tên môn học..."
                    className="form-control border-start-0 shadow-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>

        {/* TABLE */}
        <div className="card shadow-sm border-0 mb-4 rounded-3 overflow-hidden">
            <div className="card-body p-0">
                <table className="table table-hover mb-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th className="p-3 ps-4 text-secondary text-uppercase small" style={{ fontWeight: '600' }}>STT</th>
                            <th className="p-3 text-secondary text-uppercase small" style={{ fontWeight: '600' }}>Mã môn</th>
                            <th className="p-3 text-secondary text-uppercase small" style={{ fontWeight: '600' }}>Tên môn</th>
                            <th className="p-3 text-secondary text-uppercase small text-center" style={{ fontWeight: '600' }}>Tín chỉ</th>
                            <th className="p-3 text-secondary text-uppercase small" style={{ fontWeight: '600' }}>Trạng thái</th>
                            <th className="p-3 text-secondary text-uppercase small text-end pe-4" style={{ fontWeight: '600' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? (
                            filtered.map((s, index) => (
                            <tr key={s.id}>
                                <td className="p-3 ps-4 fw-bold text-muted">{index + 1}</td>
                                <td className="p-3 fw-semibold text-dark">{s.code}</td>
                                <td className="p-3">{s.name}</td>
                                <td className="p-3 text-center text-muted">{s.credits}</td>
                                <td className="p-3">
                                {s.registered ? (
                                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">
                                        Đã đăng ký
                                    </span>
                                ) : (
                                    <span className="text-muted small fst-italic">Chưa đăng ký</span>
                                )}
                                </td>
                                <td className="p-3 text-end pe-4">
                                {!s.registered ? (
                                    <button
                                    className="btn btn-primary btn-sm px-3 fw-bold"
                                    onClick={() => handleRegister(s.id)}
                                    style={{ backgroundColor: '#2563eb' }}
                                    >
                                    Đăng ký
                                    </button>
                                ) : (
                                    <button
                                    className="btn btn-outline-danger btn-sm px-3 fw-bold"
                                    onClick={() => handleUnregister(s.id)}
                                    >
                                    Hủy
                                    </button>
                                )}
                                </td>
                            </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center p-5 text-muted">
                                    <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                                    Không tìm thấy môn học nào phù hợp
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* PAGINATION FOOTER */}
            <div className="card-footer bg-white border-top p-3 d-flex justify-content-between align-items-center">
                 <div className="text-muted small">
                     Hiển thị <strong>1-{filtered.length}</strong> trên <strong>32</strong> kết quả
                 </div>
                 
                 <nav>
                    <ul className="pagination pagination-sm mb-0">
                        <li className="page-item disabled">
                            <span className="page-link border-0 text-muted bg-light rounded-start">Trước</span>
                        </li>
                        <li className="page-item"><a className="page-link border-0 text-dark fw-bold bg-white" href="#">1</a></li>
                        <li className="page-item"><a className="page-link border-0 text-muted bg-white" href="#">2</a></li>
                        <li className="page-item"><a className="page-link border-0 text-muted bg-white" href="#">3</a></li>
                        <li className="page-item">
                            <a className="page-link border-0 text-primary bg-light rounded-end" href="#">Sau</a>
                        </li>
                    </ul>
                 </nav>
            </div>
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="d-flex gap-3">
            <button className="btn btn-success shadow-sm">
                <i className="bi bi-download me-2"></i>
                Tải phiếu báo dự thi
            </button>
            <button className="btn btn-white border bg-white shadow-sm text-primary">
                <i className="bi bi-printer me-2"></i>
                In danh sách
            </button>
        </div>

      </main>
    </div>
  );
}