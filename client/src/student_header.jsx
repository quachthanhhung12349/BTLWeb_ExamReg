import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const HeaderStudent = ({ title, subTitle, studentId = "23021701", children }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("New"); // New = Chưa đọc, Dismissed = Đã đọc
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
  try {
    const res = await axios.get(`http://localhost:5000/api/notifications?studentId=${studentId}`);
    setNotifications(res.data);
  } catch (err) {
    console.error("Lỗi fetch thông báo", err);
  }
};

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotifyClick = async (id) => {
  try {
    await axios.put(`http://localhost:5000/api/notifications/read/${id}/${studentId}`);

    setNotifications(prev => 
      prev.map(n => n._id === id ? { ...n, isRead: true } : n)
    );

    console.log("Đã đánh dấu thông báo đã đọc:", id);
  } catch (err) {
    console.error("Lỗi khi đánh dấu đã đọc:", err);
  }
};

  // --- LOGIC LỌC THÔNG BÁO ---
  // Lấy danh sách chưa đọc
  const unreadNotifications = notifications.filter(n => !n.isRead);
  
  // Lọc thông báo hiển thị theo Tab
  const filteredNotifications = notifications.filter(n => 
    activeTab === "New" ? !n.isRead : n.isRead
  );

  return (
    <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom bg-white p-3 rounded-3 shadow-sm position-relative">
      <div>
        <h2 className="h4 fw-bold text-dark mb-1">{title}</h2>
        <p className="text-muted small mb-0">{subTitle}</p>
      </div>

      <div className="d-flex align-items-center gap-3">
        <div className="d-flex align-items-center gap-2 me-2">
          {/* Bell Icon & Dropdown */}
          <div className="position-relative" ref={dropdownRef}>
            <div 
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 rounded-3 position-relative" 
              style={{ backgroundColor: '#e9ecef', cursor: 'pointer', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-bell text-dark" viewBox="0 0 16 16">
                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
              </svg>
              {unreadNotifications.length > 0 && (
                <span className="position-absolute badge rounded-circle bg-danger" style={{ top: '-2px', right: '-2px', fontSize: '0.65rem', border: '2px solid white' }}>
                  {unreadNotifications.length}
                </span>
              )}
            </div>

            {/* Notification Dropdown UI */}
            {showDropdown && (
              <div className="position-absolute end-0 mt-2 bg-white shadow-lg rounded-3 border" style={{ width: '350px', zIndex: 1000, maxHeight: '500px', overflowY: 'auto' }}>
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                  <div className="d-flex gap-3">
                    <span 
                      className={`fw-bold cursor-pointer ${activeTab === 'New' ? 'text-primary border-bottom border-primary border-3' : 'text-muted opacity-75'}`}
                      onClick={() => setActiveTab('New')}
                      style={{ cursor: 'pointer', paddingBottom: '5px' }}
                    >
                      New ({unreadNotifications.length})
                    </span>
                    <span 
                      className={`fw-bold cursor-pointer ${activeTab === 'Dismissed' ? 'text-primary border-bottom border-primary border-3' : 'text-muted opacity-75'}`}
                      onClick={() => setActiveTab('Dismissed')}
                      style={{ cursor: 'pointer', paddingBottom: '5px' }}
                    >
                      Dismissed
                    </span>
                  </div>
                  <i className="bi bi-x-lg text-muted" style={{ cursor: 'pointer' }} onClick={() => setShowDropdown(false)}></i>
                </div>

                <div className="list-group list-group-flush">
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((n) => (
                      <div 
                        key={n._id} 
                        className={`list-group-item list-group-item-action p-3 ${!n.isRead ? 'bg-light' : ''}`} 
                        style={{ cursor: 'pointer', borderLeft: !n.isRead ? '4px solid #0d6efd' : 'none' }}
                        onClick={() => handleNotifyClick(n._id)}
                      >
                        <div className="d-flex justify-content-between">
                          <small className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.7rem' }}>Kỳ thi & Lịch thi</small>
                          {!n.isRead && <span className="text-primary">●</span>}
                        </div>
                        <h6 className={`mb-1 ${!n.isRead ? 'text-primary fw-bold' : 'text-dark'}`} style={{ fontSize: '0.9rem' }}>{n.title}</h6>
                        <p className="mb-1 text-muted small text-truncate">{n.text}</p>
                        <div className="d-flex justify-content-between align-items-end mt-2">
                          <span className={`badge rounded-pill border small ${!n.isRead ? 'text-danger border-danger' : 'text-muted border-secondary'}`}>
                             {activeTab === 'New' ? 'Upcoming' : 'Read'}
                          </span>
                          <div className="text-end">
                              <div className="text-muted fw-bold" style={{ fontSize: '0.75rem' }}>
                                  {new Date(n.date).toLocaleDateString('vi-VN')}
                              </div>
                              <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                  {new Date(n.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-5 text-center text-muted">
                        <i className="bi bi-chat-left-dots fs-2 d-block mb-2"></i>
                        Không có thông báo nào trong mục này
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default HeaderStudent;