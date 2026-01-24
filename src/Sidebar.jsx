import React from "react";
import { NavLink } from "react-router-dom";
import logoImage from "./assets/logo2.png";
import "./style/Sidebar.css";

const Sidebar = ({ onLogout, isOpen, onClose }) => {
  return (
    <div className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-header">
        <img src={logoImage} alt="Logo" />
      </div>

      <div className="nav flex-column nav-pills">
        <NavLink
          to="/Dashboard"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={onClose} // Close sidebar on mobile when clicking
        >
          <span>🏠</span>
          <span className="nav-text">Home</span>
        </NavLink>

        <NavLink
          to="/Records"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={onClose}
        >
          <span>📋</span>
          <span className="nav-text">Records</span>
        </NavLink>

        <NavLink
          to="/Analytics"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={onClose}
        >
          <span>📊</span>
          <span className="nav-text">Analytics</span>
        </NavLink>

        <NavLink
          to="/Heatmap"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={onClose}
        >
          <span>🔥</span>
          <span className="nav-text">Heatmap</span>
        </NavLink>
      </div>

      <div className="sidebar-logout">
        <button onClick={onLogout} className="btn btn-outline-danger">
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
