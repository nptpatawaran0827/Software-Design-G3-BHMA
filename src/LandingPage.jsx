import React, { useState } from "react";
import "./style/LandingPage.css"; 
import logo from "./assets/logo.png";




function LandingPage({ onHealthWorkerClick, onResidentClick }) {
  const [clickedRole, setClickedRole] = useState(null);

  const handleRoleSelection = (role) => {
    setClickedRole(role);
    
    if (role === 'health-worker') {
      setTimeout(() => {
        if (onHealthWorkerClick) onHealthWorkerClick();
      }, 150);
    } else if (role === 'resident') {
      // Log for debugging
      console.log('LandingPage: resident button clicked, invoking onResidentClick');

      // Call immediately (keeps feedback) and still keep small delay if desired
      if (onResidentClick) {
        onResidentClick();
      } else {
        console.warn('LandingPage: onResidentClick prop is not provided');
      }
    }
  };

  return (
    <div className="landing-page">
      <div className="landing-card">
        {/* Logo */}
        <img src={logo} alt="Barangay Logo" className="landing-logo" />

        {/* Welcome Banner */}
        <div className="welcome-banner">
          Welcome to the Barangay Health Center :
        </div>


        {/* Buttons */}
        <div className="landing-buttons">
          <button 
            className={`landing-btn resident-btn ${clickedRole === 'resident' ? 'active' : ''}`}
            onClick={() => handleRoleSelection('resident')}
          >
            RESIDENT
          </button>

          <button
            className={`landing-btn health-btn ${clickedRole === 'health-worker' ? 'active' : ''}`}
            onClick={() => handleRoleSelection('health-worker')}
          >
            HEALTH WORKER
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;