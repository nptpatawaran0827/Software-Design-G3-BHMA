import React, { useState, useRef, useEffect } from "react";
import "./style/LandingPage.css";
import logo from './assets/logo.png';
import cloudBackground from './assets/bg-cloud.jpg';
import doctorImage from './assets/doctor.png';
import AboutSection from './AboutSection';
import DevelopersSection from './DevelopersSection';

const CLOUD_BACKGROUND = cloudBackground;
const BHC_LOGO = logo;
const DOCTOR_IMAGE = doctorImage;

function LandingPage({ onHealthWorkerClick, onResidentClick }) {
  const [clickedRole, setClickedRole] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const aboutSectionRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (wrapperRef.current) {
        setScrollY(wrapperRef.current.scrollTop);
      }
    };

    const wrapper = wrapperRef.current;
    if (wrapper) {
      wrapper.addEventListener('scroll', handleScroll);
      return () => wrapper.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleRoleSelection = (role) => {
    setClickedRole(role);
    
    if (role === 'health-worker') {
      setTimeout(() => {
        if (onHealthWorkerClick) onHealthWorkerClick();
      }, 150);
    } else if (role === 'resident') {
      if (onResidentClick) {
        onResidentClick();
      }
    }
  };

  const scrollToAbout = () => {
    aboutSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const heroParallaxStyle = CLOUD_BACKGROUND ? {
    backgroundImage: `url(${CLOUD_BACKGROUND})`,
    backgroundPosition: `center ${scrollY * 0.5}px`
  } : {};

  return (
    <div className="landing-page-wrapper" ref={wrapperRef}>
      {/* SECTION 1: Landing Page */}
      <div 
        className={`landing-page ${CLOUD_BACKGROUND ? 'with-bg-image' : ''}`}
        style={heroParallaxStyle}
      >
        <div className="main-container">
          <div className="header-logo">
            <img src={BHC_LOGO} alt="BHC Logo" className="logo-image" />
            <div>
              <div className="logo-text">
                Barangay <span className="highlight">Health</span>
              </div>
              <div className="logo-subtext">Center</div>
            </div>
          </div>

          <div className="content-grid">
            <div className="left-content">
              <h1 className="welcome-title">
                Welcome to the Barangay Health Center
              </h1>
              <p className="welcome-subtitle">
                Providing quality healthcare services and monitoring<br />
                for our local community.
              </p>

              <button className="get-started-btn" onClick={scrollToAbout}>
                About →
              </button>

              <div className="role-card">
                <p className="role-question">
                  Are you a resident or health worker?
                </p>
                
                <div className="role-buttons">
                  <button
                    className={`role-btn resident-btn ${clickedRole === 'resident' ? 'active' : ''}`}
                    onClick={() => handleRoleSelection('resident')}
                  >
                    RESIDENT
                  </button>

                  <button
                    className={`role-btn health-btn ${clickedRole === 'health-worker' ? 'active' : ''}`}
                    onClick={() => handleRoleSelection('health-worker')}
                  >
                    HEALTH WORKER
                  </button>
                </div>
              </div>
            </div>

            <div className="right-content">
              <div className="doctor-placeholder">
                <img src={DOCTOR_IMAGE} alt="Healthcare Professional" className="doctor-image" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: About System */}
      <AboutSection ref={aboutSectionRef} scrollY={scrollY} />

      {/* SECTION 3: Developers */}
      <DevelopersSection scrollY={scrollY} />
    </div>
  );
}

export default LandingPage;