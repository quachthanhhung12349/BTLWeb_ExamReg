import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LayoutAdmin from './layout_admin.jsx';
import SidebarAdmin from './sidebar_admin.jsx';
import StudentManagement from './student_management.jsx';
import Login from './Login.jsx';
import DashboardAdmin from './dashboard_admin.jsx';
import SubjectManagement from './subject_management.jsx';
import ExamManagement from './exam_management.jsx';
import ExamRoomManagement from './exam_room_management.jsx';
import StudentAdd from './student_add.jsx';
import StudentEdit from './student_edit.jsx';
import SubjectAdd from './subject_add.jsx';
import SubjectEdit from './subject_edit.jsx';
import ExamRoomAdd from './exam_room_add.jsx';
import ExamRoomEdit from './exam_room_edit.jsx';

import './App.css'

function App() {
  const currentPage = 'StudentManagement';
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
  };

  //const authed = isLoggedIn || localStorage.getItem('isLoggedIn') === 'true';

const authed = true; //For debugging purposes only, remove later

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        {/* keep a default admin route and add specific admin subroutes so sidebar links work */}
        <Route
          path="/admin"
          element={
            authed ? (
              <LayoutAdmin activeLink={currentPage}>
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
            authed ? (
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
            authed ? (
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
          path="/admin/student/edit/:maSv"
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
            authed ? (
              <LayoutAdmin activeLink="CourseManagement">
                <SubjectManagement />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/admin/subject/add"
          element={
            authed ? (
              <LayoutAdmin activeLink="CourseManagement">
                <SubjectAdd />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/admin/subject/edit/:maHp"
          element={
            authed ? (
              <LayoutAdmin activeLink="CourseManagement">
                <SubjectEdit />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/admin/reports"
          element={
            authed ? (
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
            authed ? (
              <LayoutAdmin activeLink="Settings">
                <ExamRoomManagement />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/settings/add"
          element={
            authed ? (
              <LayoutAdmin activeLink="Settings">
                <ExamRoomAdd />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/admin/settings/edit/:id"
          element={
            authed ? (
              <LayoutAdmin activeLink="Settings">
                <ExamRoomEdit />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/" element={<Navigate to={authed ? '/admin' : '/login'} replace />} />
      </Routes>
    </Router>
  );
};

export default App
