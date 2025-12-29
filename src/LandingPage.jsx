import React, { useState } from "react";
import "./style/LandingPage.css"; 
import logo from "./assets/logo.png";

function LandingPage({ onHealthWorkerClick }) {
  const [clickedRole, setClickedRole] = useState(null);

  const handleRoleSelection = (role) => {
    setClickedRole(role);
    
    // If Health Worker is clicked, trigger the prop from App.jsx
    if (role === 'health-worker') {
      setTimeout(() => {
        onHealthWorkerClick();
      }, 150);
    } else {
      // Logic for Resident can be added here later
      console.log("Resident selected");
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