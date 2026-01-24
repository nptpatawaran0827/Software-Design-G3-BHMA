import React from "react";
import "./style/DevelopersSection.css";
import developersBgImage from "./assets/bg-cloud.jpg";
import image1 from "./assets/Modar.png";
import image2 from "./assets/PALCULAN.jpg";
import image3 from "./assets/Hizon_FP.jpg";
import image4 from "./assets/Patawaran.png";
import image5 from "./assets/pelon_1.png";
import image6 from "./assets/example-1.jpg";

const DEVELOPERS_BG = developersBgImage;

const DevelopersSection = () => {
  const developers = [
    /* palitan nalang ng name, role and image */
    { id: 1, name: "Developer 1", role: "(ROLE)", image: image1 },
    { id: 2, name: "Developer 2", role: "(ROLE)", image: image2 },
    { id: 3, name: "Developer 3", role: "(ROLE)", image: image3 },
    { id: 4, name: "Developer 4", role: "(ROLE)", image: image4 },
    { id: 5, name: "Developer 5", role: "(ROLE)", image: image5 },
    { id: 6, name: "Developer 6", role: "(ROLE)", image: image6 },
  ];

  return (
    <section
      className="developers-system-section"
      style={{
        backgroundImage: `url(${DEVELOPERS_BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="developers-system-overlay"></div>
      <div className="developers-system-container">
        <h1 className="section-title">Meet the Developers</h1>
        <p className="section-subtitle">
          The talented team behind this innovative healthcare solution
        </p>

        {/* All Developers in One Grid */}
        <div className="developers-grid">
          {developers.map((dev) => (
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
