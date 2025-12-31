import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from "./assets/logo.png";

const SidebarAdmin = ({ activeLink }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [adminInfo] = useState({
        name: localStorage.getItem("userName") || "Admin",
        role: "Quản trị viên"
    });

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
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

            {/* Menu điều hướng */}
            <ul className="nav nav-pills flex-column gap-2 mb-auto mt-3">
                <li className="nav-item">
                    <Link
                        to="/admin/dashboard"
                        className={`nav-link d-flex align-items-center ${isActive("/admin/dashboard") ? "active shadow-sm" : "text-dark"}`}
                        style={isActive("/admin/dashboard") ? { backgroundColor: '#4f46e5', fontWeight: '500' } : { opacity: 0.8 }}
                    >
                        <i className="bi bi-speedometer2 me-3"></i>
                        Dashboard
                    </Link>
                </li>
                <li className="nav-item">
                    <Link
                        to="/admin/student"
                        className={`nav-link d-flex align-items-center ${isActive("/admin/student") ? "active shadow-sm" : "text-dark"}`}
                        style={isActive("/admin/student") ? { backgroundColor: '#4f46e5', fontWeight: '500' } : { opacity: 0.8 }}
                    >
                        <i className="bi bi-people me-3"></i>
                        Quản lý sinh viên
                    </Link>
                </li>
                <li className="nav-item">
                    <Link
                        to="/admin/course"
                        className={`nav-link d-flex align-items-center ${isActive("/admin/course") ? "active shadow-sm" : "text-dark"}`}
                        style={isActive("/admin/course") ? { backgroundColor: '#4f46e5', fontWeight: '500' } : { opacity: 0.8 }}
                    >
                        <i className="bi bi-book me-3"></i>
                        Quản lý học phần
                    </Link>
                </li>
                <li className="nav-item">
                    <Link
                        to="/admin/reports"
                        className={`nav-link d-flex align-items-center ${activeLink === 'Reports' ? "active shadow-sm" : "text-dark"}`}
                        style={activeLink === 'Reports' ? { backgroundColor: '#4f46e5', fontWeight: '500' } : { opacity: 0.8 }}
                    >
                        <i className="bi bi-file-earmark-text me-3"></i>
                        Quản lý kỳ thi
                    </Link>
                </li>
                <li className="nav-item">
                    <Link
                        to="/admin/exam-rooms"
                        className={`nav-link d-flex align-items-center ${isActive("/admin/exam-rooms") ? "active shadow-sm" : "text-dark"}`}
                        style={isActive("/admin/exam-rooms") ? { backgroundColor: '#4f46e5', fontWeight: '500' } : { opacity: 0.8 }}
                    >
                        <i className="bi bi-building me-3"></i>
                        Quản lý phòng thi
                    </Link>
                </li>
                <li className="nav-item">
                    <Link
                        to="/admin/reg-conditions"
                        className={`nav-link d-flex align-items-center ${isActive("/admin/reg-conditions") ? "active shadow-sm" : "text-dark"}`}
                        style={isActive("/admin/reg-conditions") ? { backgroundColor: '#4f46e5', fontWeight: '500' } : { opacity: 0.8 }}
                    >
                        <i className="bi bi-shield-check me-3"></i>
                        Quản lý điều kiện thi
                    </Link>
                </li>
            </ul>

            {/* User Info & Dropdown */}
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
                            {adminInfo.name}
                        </div>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                            {adminInfo.role}
                        </div>
                    </div>
                    <i className="bi bi-chevron-up text-muted small"></i>
                </div>

                <ul className="dropdown-menu shadow w-100 mb-2 border-0 animate slideIn">
                    <li>
                        <button className="dropdown-item d-flex align-items-center py-2 text-danger" onClick={handleLogout}>
                            <i className="bi bi-box-arrow-right me-2"></i>
                            Đăng xuất
                        </button>
                    </li>
                </ul>
            </div>
        </aside>
    );
};

export default SidebarAdmin;
