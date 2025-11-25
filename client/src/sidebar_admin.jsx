import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const items = [
    { key: 'Dashboard', label: 'Dashboard' },
    { key: 'StudentManagement', label: 'Quản lý sinh viên' },
    { key: 'CourseManagement', label: 'Quản lý học phần' },
    { key: 'Reports', label: 'Quản lý ca thi' },
    { key: 'Settings', label: 'Quản lý phòng thi' },
];

const SidebarAdmin = ({ activeLink, onNavigate }) => {
    return (
        <aside className="sidebar-admin bg-light border-end">
            <div className="sidebar-top">
                <h5 className="sidebar-title">Admin</h5>
            </div>

            <nav className="nav flex-column list-group list-group-flush" aria-label="Admin navigation">
                {items.map((it) => {
                    const isActive = activeLink === it.key;
                    const className = `list-group-item list-group-item-action ${isActive ? 'active' : ''}`.trim();
                    return (
                        <a
                            role="button"
                            key={it.key}
                            className={className}
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (typeof onNavigate === 'function') onNavigate(it.key);
                            }}
                        >
                            {it.label}
                        </a>
                    );
                })}
            </nav>

            <div className="user-info text-muted">AdminUser</div>
        </aside>
    );
};

export default SidebarAdmin;
