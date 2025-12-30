import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "./assets/logo.png";

const Sidebar = ({ onLogout }) => {
    const location = useLocation();

    const [studentInfo, setStudentInfo] = useState({
        name: "Đang tải...",
        role: "Sinh viên"
    });

    useEffect(() => {
        const fetchRealProfile = async () => {
            try {
                const sId = localStorage.getItem("studentId");
                if (!sId) return;

                // Gọi API mà trang Phiếu báo dự thi đang dùng
                const response = await fetch(`http://localhost:5000/api/exam-registrations/${sId}/view-slips`);
                const data = await response.json();

                if (response.ok && data.studentInfo) {
                    setStudentInfo({
                        name: data.studentInfo.name,
                        role: "Sinh viên"
                    });
                }
            } catch (error) {
                console.error("Lỗi khi lấy thông tin Sidebar:", error);
            }
        };

        fetchRealProfile();
    }, []);

    const isActive = (path) => location.pathname === path;

    return (
        <aside
            className="bg-white border-end d-flex flex-column p-3 shadow-sm"
            style={{ width: "280px", minWidth: "280px", height: "100vh", position: "sticky", top: 0 }}
        >
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

            <div className="mt-auto pt-3 border-top">
                <div className="d-flex align-items-center p-2 mb-2 rounded-3 bg-light border">
                    <div className="rounded-circle bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center me-3" style={{ width: "38px", height: "38px" }}>
                        <i className="bi bi-person-fill text-secondary fs-5"></i>
                    </div>
                    <div style={{ lineHeight: '1.1' }}>
                        <div className="fw-bold text-dark" style={{ fontSize: "0.9rem" }}>
                            {studentInfo.name}
                        </div>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                            {studentInfo.role}
                        </div>
                    </div>
                </div>


                <button onClick={onLogout} className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center">
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Đăng xuất
                </button>
            </div>
        </aside >
    );
};

export default Sidebar;