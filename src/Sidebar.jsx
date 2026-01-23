import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom"; // Use NavLink for routing
import logoImage from "./assets/logo2.png";


const Sidebar = ({ onLogout }) => {
  // Accept onLogout prop
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setIsCollapsed(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update paths to match your App.jsx Routes
  const menuItems = [
    { name: 'Home', icon: '🏠', path: '/Dashboard' },
    { name: 'Records', icon: '📋', path: '/Records' },
    { name: 'Analytics', icon: '📊', path: '/Analytics' },
    { name: 'Heatmap', icon: '🔥', path: '/Heatmap' },
  ];

  const sidebarWidth = isMobile && isCollapsed ? "80px" : "240px";

  return (
    <div
      className="sidebar bg-white border-end shadow-sm d-flex flex-column"
      style={{
        width: sidebarWidth,
        transition: "width 0.3s ease-in-out",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div className="sidebar-header p-4 d-flex align-items-center justify-content-center border-bottom">
        {!isCollapsed && (
          <img src={logoImage} alt="Logo" style={{ width: "150px" }} />
        )}
      </div>

      <div className="nav flex-column nav-pills p-3 gap-3 flex-grow-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `nav-link text-start d-flex align-items-center gap-3 border-0 transition-all ${
                isActive
                  ? "active shadow-sm text-white"
                  : "text-dark bg-transparent"
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? "#00695c" : "transparent",
              padding: "16px 20px",
              fontSize: "1.1rem",
              fontWeight: "600",
              textDecoration: "none",
            })}
          >
            <span style={{ fontSize: "1.5rem", minWidth: "30px" }}>
              {item.icon}
            </span>
            {!isCollapsed && (
              <span className="fw-bold" style={{ fontSize: "1.1rem" }}>
                {item.name}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Added Logout Button at the bottom */}
      <div className="p-3 border-top">
        <button
          onClick={onLogout}
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
          style={{ fontWeight: "600" }}
        >
          <span>🚪</span> {!isCollapsed && "Logout"}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
