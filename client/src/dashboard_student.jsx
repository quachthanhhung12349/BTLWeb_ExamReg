import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar_student.jsx";
import HeaderStudent from "./student_header.jsx";
import { getStudentNotifications, markNotificationAsRead } from "./api/notification_api";

const DashboardStudent = ({ onLogout }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const studentId = localStorage.getItem("studentId");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    if (!studentId || studentId === 'admin') {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getStudentNotifications(studentId);
      setNotifications(data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNotification = async (notif) => {
    setSelectedNotification(notif);
    setShowDetailModal(true);
    
    // Mark as read
    if (!notif.isRead) {
      try {
        await markNotificationAsRead(notif._id, studentId);
        const updated = notifications.map(n => 
          n._id === notif._id ? { ...n, isRead: true } : n
        );
        setNotifications(updated);
      } catch (err) {
        console.error("Error marking as read:", err);
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="d-flex vh-100 bg-light">
      <Sidebar onLogout={onLogout} />

      <main className="flex-grow-1 p-4 overflow-auto">
        <HeaderStudent 
          title="Thông báo từ quản trị viên" 
          subTitle={`Tổng cộng ${notifications.length} thông báo`}
          notificationCount={unreadCount}
        />

        {/* Notifications List */}
        <div className="mt-4">
          {loading ? (
            <div className="alert alert-info">Đang tải thông báo...</div>
          ) : notifications.length === 0 ? (
            <div className="alert alert-secondary">Chưa có thông báo nào</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
              {notifications.map((notif) => (
                <div 
                  key={notif._id}
                  className="card shadow-sm border-0"
                  style={{
                    opacity: notif.isRead ? 0.8 : 1,
                    borderLeft: `4px solid ${notif.isRead ? '#ccc' : '#4f46e5'}`
                  }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title fw-bold mb-0">{notif.title}</h5>
                      {!notif.isRead && (
                        <span className="badge bg-primary">Mới</span>
                      )}
                    </div>
                    
                    <p className="card-text text-muted small mb-2">
                      {new Date(notif.date).toLocaleString('vi-VN')}
                    </p>
                    
                    <p className="card-text text-dark mb-3" style={{ minHeight: '60px' }}>
                      {notif.text.substring(0, 120)}
                      {notif.text.length > 120 ? '...' : ''}
                    </p>

                    <button
                      className="btn btn-primary btn-sm w-100"
                      onClick={() => handleOpenNotification(notif)}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedNotification && (
          <>
            <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, zIndex: 1050 }} />
            <div style={{ position: 'fixed', inset: 0, zIndex: 1060, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="card" style={{ width: '700px', maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto' }}>
                <div className="card-body p-4">
                  <h5 className="card-title fw-bold mb-2">{selectedNotification.title}</h5>
                  <p className="text-muted small mb-3">
                    {new Date(selectedNotification.date).toLocaleString('vi-VN')}
                  </p>
                  
                  <hr />
                  
                  <div className="card-text" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                    {selectedNotification.text}
                  </div>

                  <hr />

                  <div className="d-flex justify-content-end">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setShowDetailModal(false)}
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default DashboardStudent;
