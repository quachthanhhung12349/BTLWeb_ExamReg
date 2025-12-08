import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { NavLink, useNavigate } from 'react-router-dom';

const items = [
    { key: 'Dashboard', label: 'Dashboard', path: '/admin/dashboard' },
    { key: 'StudentManagement', label: 'Quản lý sinh viên', path: '/admin/student' },
    { key: 'CourseManagement', label: 'Quản lý học phần', path: '/admin/course' },
    { key: 'Reports', label: 'Quản lý ca thi', path: '/admin/reports' },
    { key: 'Settings', label: 'Quản lý phòng thi', path: '/admin/settings' },
];

const SidebarAdmin = ({ activeLink }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    return (
        <aside className="sidebar-admin bg-light border-end">
            <div className="sidebar-top">
                <h5 className="sidebar-title">Đăng ký thi</h5>
            </div>

            <nav className="nav flex-column list-group list-group-flush" aria-label="Admin navigation">
                {items.map((it) => (
                    <NavLink
                        key={it.key}
                        to={it.path}
                        className={({ isActive }) => `list-group-item list-group-item-action ${isActive ? 'active' : ''}`.trim()}
                    >
                        {it.label}
                    </NavLink>
                ))}
            </nav>

            <div className="user-info">
                <button 
                    className={`user-dropdown-btn ${dropdownOpen ? 'active' : ''}`}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                    <div>
                        <div style={{ fontWeight: 600 }}>AdminUser</div>
                        <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>Administrator</div>
                    </div>
                </button>
                
                {dropdownOpen && (
                    <div className="dropdown-menu-custom">
                        <button onClick={handleLogout}>
                            Đăng xuất
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default SidebarAdmin;
