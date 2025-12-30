import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPortal } from "react-dom"; 
import logo from "./assets/logo.png";

const Sidebar = ({ onLogout }) => {
    const location = useLocation();
    const [studentInfo, setStudentInfo] = useState({
        name: localStorage.getItem("studentName") || "Đang tải...",
        role: "Sinh viên"
    });

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchStudentProfile = async () => {
            const sId = localStorage.getItem("studentId");
            if (!sId || sId === 'admin') return;
            try {
                const response = await fetch(`http://localhost:5000/api/exam-registrations/${sId}/view-slips`);
                const data = await response.json();
                if (response.ok && data.studentInfo) {
                    setStudentInfo({ name: data.studentInfo.name, role: "Sinh viên" });
                    localStorage.setItem("studentName", data.studentInfo.name);
                }
            } catch (err) { console.error("Lỗi lấy thông tin:", err); }
        };
        fetchStudentProfile();
    }, []);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage("Mật khẩu xác nhận không khớp!");
            return;
        }
        const sId = localStorage.getItem("studentId");
        try {
            const response = await fetch(`http://localhost:5000/api/exam-registrations/users/${sId}/password`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    oldPassword: passwordData.oldPassword,
                    newPassword: passwordData.newPassword
                })
            });
            const data = await response.json();
            if (response.ok) {
                alert("Đổi mật khẩu thành công!");
                setShowPasswordModal(false);
                setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
                setMessage("");
                window.location.reload(); 
            } else {
                setMessage(data.message || "Có lỗi xảy ra");
            }
        } catch (err) { setMessage("Lỗi kết nối server"); }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Sidebar Chính */}
            <aside
                className="bg-white border-end d-flex flex-column p-3 shadow-sm"
                style={{ width: "280px", minWidth: "280px", height: "100vh", position: "sticky", top: 0, zIndex: 100 }}
            >
                {/* Logo Section */}
                <div className="d-flex align-items-center mb-4 px-2 pt-2">
                    <img
                        src={logo}
                        alt="Logo"
                        className="me-3"
                        style={{ width: "45px", height: "45px", objectFit: "contain" }}
                    />
                    <div style={{ lineHeight: "1.2" }}>
                        <h1 className="h6 fw-bold mb-0 text-primary text-uppercase" style={{ letterSpacing: '0.5px' }}>Cổng Đào Tạo</h1>
                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>Đại học Công nghệ</small>
                    </div>
                </div>

                <hr className="text-secondary opacity-25 my-2" />

                {/* Danh sách Menu điều hướng */}
                <ul className="nav nav-pills flex-column gap-2 mb-auto mt-3">
                    <li className="nav-item">
                        <Link
                            to="/student/registration"
                            className={`nav-link d-flex align-items-center ${isActive("/student/registration") || isActive("/student") ? "active shadow-sm" : "text-dark"}`}
                            style={isActive("/student/registration") || isActive("/student") ? { backgroundColor: '#4f46e5', fontWeight: '500' } : { opacity: 0.8 }}
                        >
                            <i className="bi bi-pencil-square me-3"></i>
                            Đăng ký thi
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link
                            to="/student/courses"
                            className={`nav-link d-flex align-items-center ${isActive("/student/courses") ? "active shadow-sm" : "text-dark"}`}
                            style={isActive("/student/courses") ? { backgroundColor: '#4f46e5', fontWeight: '500' } : { opacity: 0.8 }}
                        >
                            <i className="bi bi-journal-check me-3"></i>
                            Môn phải thi
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link
                            to="/student/exam-slip"
                            className={`nav-link d-flex align-items-center ${isActive("/student/exam-slip") ? "active shadow-sm" : "text-dark"}`}
                            style={isActive("/student/exam-slip") ? { backgroundColor: '#4f46e5', fontWeight: '500' } : { opacity: 0.8 }}
                        >
                            <i className="bi bi-file-earmark-text me-3"></i>
                            Phiếu báo dự thi
                        </Link>
                    </li>
                </ul>

                {/* Phần Thông tin người dùng & Menu chức năng (Dropdown) */}
                <div className="mt-auto pt-3 border-top dropdown">
                    <div 
                        className="d-flex align-items-center p-2 rounded-3 bg-light border" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false"
                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        <div className="rounded-circle bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center me-3" style={{ width: "38px", height: "38px" }}>
                            <i className="bi bi-person-fill text-secondary fs-5"></i>
                        </div>
                        <div className="flex-grow-1" style={{ lineHeight: '1.1' }}>
                            <div className="fw-bold text-dark" style={{ fontSize: "0.9rem" }}>
                                {studentInfo.name}
                            </div>
                            <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                {studentInfo.role}
                            </div>
                        </div>
                        <i className="bi bi-chevron-up text-muted small"></i>
                    </div>

                    {/* Menu trỏ lên khi click vào tên */}
                    <ul className="dropdown-menu shadow w-100 mb-2 border-0 animate slideIn">
                        <li>
                            <button className="dropdown-item d-flex align-items-center py-2" onClick={() => setShowPasswordModal(true)}>
                                <i className="bi bi-key me-2 text-primary"></i>
                                Đổi mật khẩu
                            </button>
                        </li>
                        <li><hr className="dropdown-divider mx-2" /></li>
                        <li>
                            <button className="dropdown-item d-flex align-items-center py-2 text-danger" onClick={onLogout}>
                                <i className="bi bi-box-arrow-right me-2"></i>
                                Đăng xuất
                            </button>
                        </li>
                    </ul>
                </div>
            </aside>

            {/* Modal Đổi mật khẩu - Sử dụng Portal để không bị các màn hình khác đè lên */}
            {showPasswordModal && createPortal(
                <div 
                    className="modal fade show d-block" 
                    tabIndex="-1" 
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999 }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-bottom-0 pb-0 pt-4 px-4">
                                <h5 className="modal-title fw-bold">Thay đổi mật khẩu</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => {setShowPasswordModal(false); setMessage("");}}
                                ></button>
                            </div>
                            
                            <form onSubmit={handleChangePassword}>
                                <div className="modal-body p-4">
                                    {message && <div className="alert alert-danger py-2 small mb-3">{message}</div>}
                                    
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-secondary">Mật khẩu hiện tại</label>
                                        <input 
                                            type="password" 
                                            className="form-control" 
                                            placeholder="Nhập mật khẩu cũ"
                                            required 
                                            onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})} 
                                        />
                                    </div>
                                    
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-secondary">Mật khẩu mới</label>
                                        <input 
                                            type="password" 
                                            className="form-control" 
                                            placeholder="Tối thiểu 6 ký tự"
                                            required 
                                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} 
                                        />
                                    </div>
                                    
                                    <div className="mb-1">
                                        <label className="form-label small fw-bold text-secondary">Xác nhận mật khẩu mới</label>
                                        <input 
                                            type="password" 
                                            className="form-control" 
                                            placeholder="Nhập lại mật khẩu mới"
                                            required 
                                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                                        />
                                    </div>
                                </div>
                                
                                <div className="modal-footer border-top-0 pb-4 px-4">
                                    <button 
                                        type="button" 
                                        className="btn btn-light px-4 fw-medium" 
                                        onClick={() => {setShowPasswordModal(false); setMessage("");}}
                                    >
                                        Hủy
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary px-4 shadow-sm fw-medium" 
                                        style={{ backgroundColor: '#4f46e5', border: 'none' }}
                                    >
                                        Cập nhật
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body // Gắn trực tiếp vào body để nằm trên mọi lớp UI khác
            )}
        </>
    );
};

export default Sidebar;