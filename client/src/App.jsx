import { useState, useEffect } from 'react'
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LayoutAdmin from './layout_admin.jsx';
import Login from './Login.jsx';
import DashboardAdmin from './dashboard_admin.jsx';
import StudentManagement from './student_management.jsx';
import SubjectManagement from './subject_management.jsx';
import ExamManagement from './exam_management.jsx';
import ExamRoomManagement from './exam_room_management.jsx';
import StudentExamRegistrationPage from './student_exam_registration.jsx';

import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const role = localStorage.getItem('userRole');
    if (loggedIn && role) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
  }, []);

  const handleLoginSuccess = (role) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', role);
    setIsLoggedIn(true);
    setUserRole(role);
  };

  // Hàm xử lý đăng xuất chung cho cả Admin và Student
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    setUserRole(null);
    window.location.href = '/login';
  };

  const authed = isLoggedIn; 
  const currentRole = userRole;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        
        {/* --- ROUTES ADMIN --- */}
        <Route
          path="/admin"
          element={
            authed && currentRole === 'admin' ? (
              <LayoutAdmin activeLink="StudentManagement">
                <StudentManagement />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            authed && currentRole === 'admin' ? (
              <LayoutAdmin activeLink="Dashboard">
                <DashboardAdmin />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/admin/student"
          element={
            authed && currentRole === 'admin' ? (
              <LayoutAdmin activeLink="StudentManagement">
                <StudentManagement />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/admin/course"
          element={
            authed && currentRole === 'admin' ? (
              <LayoutAdmin activeLink="CourseManagement">
                <SubjectManagement />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/admin/reports"
          element={
            authed && currentRole === 'admin' ? (
              <LayoutAdmin activeLink="Reports">
                <ExamManagement />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/admin/settings"
          element={
            authed && currentRole === 'admin' ? (
              <LayoutAdmin activeLink="Settings">
                <ExamRoomManagement />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* --- ROUTE STUDENT --- */}
        <Route 
          path="/student" 
          element={
            authed && currentRole === 'student' ? (
              <StudentExamRegistrationPage onLogout={handleLogout} /> 
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route 
          path="/" 
          element={
            !authed ? <Navigate to="/login" replace /> :
            currentRole === 'admin' ? <Navigate to="/admin" replace /> :
            currentRole === 'student' ? <Navigate to="/student" replace /> :
            <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;