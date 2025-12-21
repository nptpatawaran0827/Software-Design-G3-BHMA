import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
// Import your new components
import RecordsPage from './RecordsPage';
import AnalyticsPage from './AnalyticsPage';

function Home({ onLogout }) {
  const [activeTab, setActiveTab] = useState('Home');

  const renderContent = () => {
    switch (activeTab) {
      case 'Records':
        return <RecordsPage />;
      case 'Analytics':
        return <AnalyticsPage />;
      case 'Scan & Upload':
        return <div className="p-4"><h3>Scan & Upload Page</h3></div>;
      default:
        return (
          <div className="p-4">
            <div className="home-card shadow-sm p-5 bg-white rounded-4">
              <h1 className="fw-bold display-4">Welcome</h1>
              <p className="lead text-muted">Brgy. Health Record Management System</p>
              <hr />
              <button className="btn btn-dark px-4 py-2" onClick={onLogout}>Logout</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container d-flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-wrapper flex-grow-1 bg-light">
        {/* Dynamic Title for Header */}
        <Header title={activeTab === 'Home' ? 'DASHBOARD' : activeTab.toUpperCase()} />
        <main>{renderContent()}</main>
      </div>
    </div>
  );
}

export default Home;