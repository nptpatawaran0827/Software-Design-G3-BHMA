import React, { useState, useEffect } from 'react';
import logoImage from './assets/logo.png'; 

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Auto-collapse on mobile, auto-expand on desktop
      if (!mobile) {
        setIsCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { name: 'Home', icon: '🏠' },
    { name: 'Records', icon: '📋' },
    { name: 'Analytics', icon: '📊' },
    { name: 'Heatmap', icon: '🔥' },  //ADDED HEATMAP BUTTON
    { name: 'Scan & Upload', icon: '📥' },
  ];

  // On mobile, sidebar collapses automatically; on desktop, always show full width
  const sidebarWidth = isMobile && isCollapsed ? '80px' : '240px';

    return (
    <div 
      className={`sidebar bg-white border-end vh-100 shadow-sm ${isCollapsed && isMobile ? 'collapsed' : 'expanded'}`}
      style={{ 
        width: sidebarWidth,
        transition: 'width 0.3s ease-in-out',
        overflowY: 'auto'
      }}
    >
      {/* Header with Logo */}
      <div className="sidebar-header p-3 d-flex align-items-center justify-content-between border-bottom">
        {!isCollapsed && <img src={logoImage} alt="Logo" style={{ width: '60px' }} />}
      </div>
      
      {/* Navigation Menu */}
      <div className="nav flex-column nav-pills p-2 gap-2">
        {menuItems.map((item) => (
          <button 
            key={item.name} 
            onClick={() => setActiveTab(item.name)}
            className={`nav-link text-start d-flex align-items-center gap-3 border-0 ${
              activeTab === item.name ? 'active' : ''
            }`}
            style={{
              backgroundColor: activeTab === item.name ? '#00695c' : 'transparent',
              color: activeTab === item.name ? 'white' : '#212529',
              borderRadius: '8px',
              padding: '12px 16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontWeight: activeTab === item.name ? 'bold' : 'normal'
            }}
            title={isCollapsed ? item.name : ''}
          >
            <span style={{ fontSize: '1.2rem', minWidth: '24px', display: 'flex', alignItems: 'center' }}>
              {item.icon}
            </span> 
            {!isCollapsed && <span>{item.name}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};


export default Sidebar;