import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = ({ onLogout }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Sidebar - Ensure this component uses <Link> internally */}
      <div style={{ width: '250px', flexShrink: 0 }}>
        <Sidebar onLogout={onLogout} />
      </div>
      
      {/* Main Content Area */}


      
      <div style={{ 
        flexGrow: 1, 
        backgroundColor: '#f8f9fa', 
        overflowY: 'auto',
        position: 'relative' 
      }}>
        <Outlet /> 
      </div>
    </div>
  );
};

export default MainLayout;