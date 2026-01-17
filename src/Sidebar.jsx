import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom'; 
import logoImage from './assets/logo.png'; 

const Sidebar = () => {
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

  const menuItems = [
    { name: 'Home', icon: '🏠', path: '/Dashboard' },
    { name: 'Records', icon: '📋', path: '/Records' },
    { name: 'Analytics', icon: '📊', path: '/Analytics' },
  ];

  const sidebarWidth = isMobile && isCollapsed ? '80px' : '240px';

  return (
    <div 
      className={`sidebar bg-white border-end vh-100 shadow-sm ${isCollapsed && isMobile ? 'collapsed' : 'expanded'}`}
      style={{ 
        width: sidebarWidth,
        transition: 'width 0.3s ease-in-out',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}
    >
      {/* MODIFICATION: 
          1. Changed to flex-column and align-items-center to force the logo to the center.
          2. Removed justify-content-between.
      */}
      <div className="sidebar-header p-3 d-flex flex-column align-items-center border-bottom">
        <img 
          src={logoImage} 
          alt="Logo" 
          style={{ 
            width: isCollapsed && isMobile ? '40px' : '65px', 
            transition: 'width 0.3s ease' 
          }} 
        />
      </div>
      
      <div className="nav flex-column nav-pills p-2 gap-2">
        {menuItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            className={({ isActive }) => 
              `nav-link text-start d-flex align-items-center gap-3 border-0 transition-all ${
                isActive ? 'active shadow-sm' : 'text-dark bg-transparent'
              }`
            }
            style={({ isActive }) => 
              isActive ? { backgroundColor: '#00695c', color: 'white' } : {}
            }
          >
            <span style={{ fontSize: '1.2rem', minWidth: '24px' }}>{item.icon}</span> 
            {!(isCollapsed && isMobile) && (
              <div className="d-flex flex-column">
                <span className="fw-semibold">{item.name}</span>
                
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;