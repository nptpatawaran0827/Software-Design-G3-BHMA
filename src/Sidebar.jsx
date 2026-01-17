import React, { useState, useEffect } from 'react';
import logoImage from './assets/logo.png'; 

const Sidebar = ({ activeTab, setActiveTab }) => {
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

  // Map the names to your actual logical tabs
  const menuItems = [
    { name: 'Home', icon: '🏠', file: 'HomePage' },
    { name: 'Records', icon: '📋', file: 'RecordsPage' },
    { name: 'Analytics', icon: '📊', file: 'AnalyticsPage' },
  ];

  const sidebarWidth = isMobile && isCollapsed ? '80px' : '240px';

  return (
    <div 
      className={`sidebar bg-white border-end vh-100 shadow-sm ${isCollapsed && isMobile ? 'collapsed' : 'expanded'}`}
      style={{ 
        width: sidebarWidth,
        transition: 'width 0.3s ease-in-out',
        position: 'sticky',
        top: 0
      }}
    >
      <div className="sidebar-header p-3 d-flex align-items-center justify-content-between border-bottom">
        {!isCollapsed && <img src={logoImage} alt="Logo" style={{ width: '60px' }} />}
      </div>
      
      <div className="nav flex-column nav-pills p-2 gap-2">
        {menuItems.map((item) => (
          <button 
            key={item.name} 
            onClick={() => setActiveTab(item.name)} // This triggers the renderContent() in Home.jsx
            className={`nav-link text-start d-flex align-items-center gap-3 border-0 transition-all ${
              activeTab === item.name ? 'active shadow-sm' : 'text-dark bg-transparent'
            }`}
            style={activeTab === item.name ? { backgroundColor: '#00695c', color: 'white' } : {}}
            title={item.file} // Shows the filename when hovering
          >
            <span style={{ fontSize: '1.2rem', minWidth: '24px' }}>{item.icon}</span> 
            {!isCollapsed && (
              <div className="d-flex flex-column">
                <span className="fw-semibold">{item.name}</span>
                {/* Optional: subtile filename text */}
                <small style={{ fontSize: '0.65rem', opacity: 0.7 }}>{item.file}</small>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;