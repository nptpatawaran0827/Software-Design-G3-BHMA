import React from 'react';
import './style/DevelopersSection.css';
import developersBgImage from './assets/bg-cloud.jpg'; 
import example from './assets/example-1.jpg';

const DEVELOPERS_BG = developersBgImage; 

const DevelopersSection = () => {
  const developers = [
    { id: 1, name: "Developer 1", role: "(ROLE)", image: example }, /* palitan nalang ng name, role and image */
    { id: 2, name: "Developer 2", role: "(ROLE)", image: example },
    { id: 3, name: "Developer 3", role: "(ROLE)", image: example },
    { id: 4, name: "Developer 4", role: "(ROLE)", image: example },
    { id: 5, name: "Developer 5", role: "(ROLE)", image: example },
    { id: 6, name: "Developer 6", role: "(ROLE)", image: example }
  ];

  const topRowDevs = developers.slice(0, 3);
  const bottomRowDevs = developers.slice(3, 6);

  return (
    <section 
      className="developers-system-section"
      style={{
        backgroundImage: `url(${DEVELOPERS_BG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="developers-system-overlay"></div>
      <div className="developers-system-container">
        <h1 className="section-title">Meet the Developers</h1>
        <p className="section-subtitle">
          The talented team behind this innovative healthcare solution
        </p>

        {/* Top Row - 3 Developers */}
        <div className="developers-row-top">
          {topRowDevs.map((dev) => (
            <div key={dev.id} className="developer-card">
              <div className="developer-image-wrapper">
                <img 
                  src={dev.image} 
                  alt={dev.name}
                  className="developer-image"
                />
              </div>
              <h3 className="developer-name">{dev.name}</h3>
              <p className="developer-role">{dev.role}</p>
            </div>
          ))}
        </div>

        {/* Bottom Row - 3 Developers */}
        <div className="developers-row-bottom">
          {bottomRowDevs.map((dev) => (
            <div key={dev.id} className="developer-card">
              <div className="developer-image-wrapper">
                <img 
                  src={dev.image} 
                  alt={dev.name}
                  className="developer-image"
                />
              </div>
              <h3 className="developer-name">{dev.name}</h3>
              <p className="developer-role">{dev.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DevelopersSection;