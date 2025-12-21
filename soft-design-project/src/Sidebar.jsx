import React from 'react';
import logoImage from './assets/logo.png'; 

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { name: 'Home', icon: '🏠' },
    { name: 'Records', icon: '📋' },
    { name: 'Analytics', icon: '📊' },
    { name: 'Scan & Upload', icon: '📥' },
  ];

  return (
    <div className="sidebar bg-white border-end vh-100 shadow-sm" style={{ width: '240px' }}>
      <div className="p-4 text-center border-bottom">
        <img src={logoImage} alt="Logo" style={{ width: '100px' }} />
      </div>
      
      <div className="nav flex-column nav-pills p-3 gap-2">
        {menuItems.map((item) => (
          <button 
            key={item.name} 
            onClick={() => setActiveTab(item.name)} // Change page on click
            className={`nav-link text-start d-flex align-items-center gap-3 border-0 w-100 ${
              activeTab === item.name ? 'active bg-teal' : 'text-dark bg-transparent'
            }`}
            style={activeTab === item.name ? { backgroundColor: '#00695c', color: 'white' } : {}}
          >
            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span> 
            <span className="fw-semibold">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;