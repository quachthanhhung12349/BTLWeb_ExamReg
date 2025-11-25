import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import React from 'react';
import ReactDOM from 'react-dom';

import LayoutAdmin from './layout_admin.jsx';
import SidebarAdmin from './sidebar_admin.jsx';
import StudentManagement from './student_management.jsx';

import './App.css'

function App() {
  const currentPage = 'StudentManagement';

  return (
    <LayoutAdmin activeLink={currentPage}>
      <StudentManagement />
    </LayoutAdmin>
  );
};

export default App
