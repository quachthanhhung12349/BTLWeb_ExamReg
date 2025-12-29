import { useState, useEffect } from 'react'
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LayoutAdmin from './layout_admin.jsx';
import Login from './Login.jsx';
import DashboardAdmin from './dashboard_admin.jsx';
import CourseManagement from './course_management.jsx';
import StudentManagement from './student_management.jsx';
import ExamManagement from './exam_management.jsx';
import ExamRoomManagement from './exam_room_management.jsx';
import StudentAdd from './student_add.jsx';
import StudentEdit from './student_edit.jsx';
import CourseAdd from './course_add.jsx';
import CourseEdit from './course_edit.jsx';
import ExamRoomAdd from './exam_room_add.jsx';
import ExamRoomEdit from './exam_room_edit.jsx';
import StudentExamRegistrationPage from './student_exam_registration.jsx';
import StudentCoursesPage from './student_courses.jsx';
import StudentExamSlipPage from './student_exam_slip.jsx';

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
          path="/admin/student/add"
          element={
            authed ? (
              <LayoutAdmin activeLink="StudentManagement">
                <StudentAdd />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/admin/student/edit/:id"
          element={
            authed ? (
              <LayoutAdmin activeLink="StudentManagement">
                <StudentEdit />
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
                <CourseManagement />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/admin/course/add"
          element={
            authed ? (
              <LayoutAdmin activeLink="CourseManagement">
                <CourseAdd />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/admin/course/edit/:id"
          element={
            authed && currentRole === 'admin' ? (
              <LayoutAdmin activeLink="CourseManagement">
                <CourseEdit />
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
          path="/admin/exam-rooms"
          element={
            authed && currentRole === 'admin' ? (
              <LayoutAdmin activeLink="ExamRoomManagement">
                <ExamRoomManagement />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/admin/exam-rooms/add"
          element={
            authed && currentRole === 'admin' ? (
              <LayoutAdmin activeLink="ExamRoomManagement">
                <ExamRoomAdd />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/admin/exam-rooms/edit/:id"
          element={
            authed && currentRole === 'admin' ? (
              <LayoutAdmin activeLink="ExamRoomManagement">
                <ExamRoomEdit />
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
              <StudentExamRegistrationPage onLogout={handleLogout} activeTab="registration" /> 
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route 
          path="/student/registration" 
          element={
            authed && currentRole === 'student' ? (
              <StudentExamRegistrationPage onLogout={handleLogout} activeTab="registration" /> 
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* 2. Trang Xem môn phải thi */}
        <Route 
          path="/student/courses" 
          element={
            authed && currentRole === 'student' ? (
              <StudentCoursesPage onLogout={handleLogout} activeTab="my-courses" /> 
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* 3. Trang Phiếu báo dự thi */}
        <Route 
          path="/student/exam-slip" 
          element={
            authed && currentRole === 'student' ? (
              <StudentExamSlipPage onLogout={handleLogout} activeTab="exam-slip" /> 
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