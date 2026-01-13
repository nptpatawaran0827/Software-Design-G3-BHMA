import React from 'react';

const Header = ({ onNavigate }) => {
  return (
    <div className="p-3 mb-4 rounded-4 shadow-sm text-white d-flex align-items-center justify-content-between" 
         style={{ backgroundColor: '#4da3ff', height: '80px', margin: '20px' }}>
      
      <h2 className="m-0 fw-bold tracking-wider px-3" style={{ fontSize: '1.5rem', letterSpacing: '2px' }}>
        BARANGAY HEALTH RECORDS and ANALYTICS SYSTEM
      </h2>

      
      </div>
    
  );
};

export default Header;