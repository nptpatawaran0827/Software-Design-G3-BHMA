import React, { forwardRef } from 'react';
import './style/AboutSection.css';
import aboutBgImage from './assets/bg-cloud.jpg'; 

const ABOUT_BG = aboutBgImage; 

const AboutSection = forwardRef(({ scrollY = 0 }, ref) => {
  return (
    <section 
      ref={ref} 
      className="about-system-section"
      style={{
        backgroundImage: `url(${ABOUT_BG})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="about-system-overlay"></div>
      <div className="about-system-container">
        <h1 className="section-title">About the System</h1>

        <p className="section-description">
          Our Barangay Health Center Management System is designed to streamline healthcare 
          monitoring and analytics for health workers while making it easier for residents to access services.
        </p>

        <div className="features-card">
          <h2 className="section-card-title">Key Features</h2>
          
          <div className="features-grid">
            <div className="feature-item">
              <h3 className="feature-title">• Monitoring & Analytics</h3>
              <p className="feature-desc">
                Health workers can efficiently track and analyze patient data and health trends
              </p>
            </div>

            <div className="feature-item">
              <h3 className="feature-title">• Resident Self-Registration</h3>
              <p className="feature-desc">
                Residents can submit their personal details and health information online
              </p>
            </div>

            <div className="feature-item">
              <h3 className="feature-title">• Approval System</h3>
              <p className="feature-desc">
                Health workers review and approve resident submissions to ensure data accuracy and security
              </p>
            </div>

            <div className="feature-item">
              <h3 className="feature-title">• Faster Processing</h3>
              <p className="feature-desc">
                Reduces waiting time and paperwork for both health workers and residents
              </p>
            </div>

            <div className="feature-item">
              <h3 className="feature-title">• Centralized Records</h3>
              <p className="feature-desc">
                All health records are organized in one secure, accessible platform
              </p>
            </div>
          </div>
        </div>

        <div className="mission-card">
          <h2 className="section-card-title">Our Mission</h2>
          <p className="mission-text">
            To deliver accessible, quality healthcare services to all residents and promote 
            a healthier community through preventive care, health education, and efficient digital solutions.
          </p>
        </div>
      </div>
    </section>
  );
});

AboutSection.displayName = 'AboutSection';

export default AboutSection;