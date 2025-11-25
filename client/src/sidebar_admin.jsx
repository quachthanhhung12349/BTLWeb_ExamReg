import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { NavLink } from 'react-router-dom';

const items = [
    { key: 'Dashboard', label: 'Dashboard', path: '/admin/dashboard' },
    { key: 'StudentManagement', label: 'Quản lý sinh viên', path: '/admin/student' },
    { key: 'CourseManagement', label: 'Quản lý học phần', path: '/admin/course' },
    { key: 'Reports', label: 'Quản lý ca thi', path: '/admin/reports' },
    { key: 'Settings', label: 'Quản lý phòng thi', path: '/admin/settings' },
];

const SidebarAdmin = ({ activeLink }) => {
    return (
        <aside className="sidebar-admin bg-light border-end">
            <div className="sidebar-top">
                <h5 className="sidebar-title">Admin</h5>
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

            <div className="user-info text-muted">AdminUser</div>
        </aside>
    );
};

export default SidebarAdmin;
