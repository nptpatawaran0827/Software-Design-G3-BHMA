import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react";
import "./style/MainLayout.css";

const MainLayout = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="main-layout">
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="mobile-menu-btn"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay (for closing on mobile) */}
      {sidebarOpen && (
        <div onClick={closeSidebar} className="sidebar-overlay" />
      )}

      {/* Sidebar */}
      <Sidebar
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main Content Area */}
      <div className="main-content-area">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
