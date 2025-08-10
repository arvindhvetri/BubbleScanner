// components/Layout.jsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './Sidebar.css';

const Layout = () => {
  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <h2 className="sidebar-title">📊 EvalEase</h2>
        <ul>
          <li><NavLink to="/results" end>Dashboard</NavLink></li>
          <li><NavLink to="answers">Student Answers</NavLink></li>
          <li><NavLink to="scores">Score Table</NavLink></li>
          <li><NavLink to="subject-analysis">Subject Analysis</NavLink></li>

        </ul>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
