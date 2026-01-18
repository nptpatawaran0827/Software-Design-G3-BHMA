import React, { useState, useEffect } from 'react';
import logoImage from './assets/logo2.png'; 

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

  const menuItems = [
    { name: 'Home', icon: '🏠', file: 'HomePage' },
    { name: 'Records', icon: '📋', file: 'RecordsPage' },
    { name: 'Analytics', icon: '📊', file: 'AnalyticsPage' },
  ];

  const sidebarWidth = isMobile && isCollapsed ? '80px' : '240px';

  return (
    <div 
      className="sidebar bg-white border-end shadow-sm d-flex flex-column"
      style={{ 
        width: sidebarWidth,
        transition: 'width 0.3s ease-in-out',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      <div className="sidebar-header p-4 d-flex align-items-center justify-content-center border-bottom">
        {!isCollapsed && <img src={logoImage} alt="Logo" style={{ width: '150px' }} />}
      </div>
      
      <div className="nav flex-column nav-pills p-3 gap-3 flex-grow-1">
        {menuItems.map((item) => (
          <button 
            key={item.name} 
            onClick={() => setActiveTab(item.name)}
            className={`nav-link text-start d-flex align-items-center gap-3 border-0 transition-all ${
              activeTab === item.name ? 'active shadow-sm' : 'text-dark bg-transparent'
            }`}
            style={{
              ...(activeTab === item.name ? { backgroundColor: '#00695c', color: 'white' } : {}),
              padding: '16px 20px',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}
            title={item.file}
          >
            <span style={{ fontSize: '1.5rem', minWidth: '30px' }}>{item.icon}</span> 
            {!isCollapsed && (
              <div className="d-flex flex-column">
                <span className="fw-bold" style={{ fontSize: '1.1rem' }}>{item.name}</span>
                <small style={{ fontSize: '0.7rem', opacity: 0.7 }}>{item.file}</small>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;