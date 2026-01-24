import React, { useState, useEffect } from "react";
import StreetHeatmap from "./components/StreetHeatmap";
import { getSeverityFilters } from "./utils/diagnosisSeverity";
import HeaderBanner from "./HeaderBanner";
import "./style/HeatmapPage.css";

/**
 * HEATMAP PAGE COMPONENT
 * Displays two modes:
 * 1. Diagnosis mode - Shows most common diagnosis per street by severity
 * 2. Condition mode - Shows health conditions (original functionality)
 */

const HeatmapPage = ({ onLogout }) => {
  // ===== STATE =====
  const [viewMode, setViewMode] = useState("diagnosis"); // 'condition' or 'diagnosis'
  const [filterValue, setFilterValue] = useState("All");
  const [severityOptions, setSeverityOptions] = useState([]);

  // ===== EFFECTS =====
  useEffect(() => {
    // Load severity filters for diagnosis mode
    setSeverityOptions(getSeverityFilters());
  }, []);

  // ===== EVENT HANDLERS =====
  const handleViewModeChange = (e) => {
    setViewMode(e.target.value);
    setFilterValue("All"); // Reset filter when changing modes
  };

  const handleFilterChange = (e) => {
    setFilterValue(e.target.value);
  };

  const handleAcceptResident = (residentData) => {
    console.log("Resident accepted:", residentData);
  };

  // ===== RENDER =====
  return (
    <div className="dashboard-container d-flex">
      <div className="main-wrapper flex-grow-1 bg-light d-flex flex-column">
        <main className="flex-grow-1 main-content">
          <HeaderBanner
            onAcceptResident={handleAcceptResident}
            onLogout={onLogout}
          />

          <div className="heatmap-page-container">
            {/* HEADER */}
            <div className="heatmap-header">
              <h1>BARANGAY HEALTH MAP</h1>
              <p>
                Real-time heatmap visualization of health conditions across
                streets
              </p>
            </div>

            {/* CONTROLS */}
            <div className="heatmap-controls">
              {/* View Mode Toggle */}
              <div className="control-group">
                <label htmlFor="view-mode">📋 View Mode:</label>
                <select
                  id="view-mode"
                  value={viewMode}
                  onChange={handleViewModeChange}
                  className="control-select"
                >
                  <option value="diagnosis">
                    🔍 Most Common Diagnosis (by Street)
                  </option>
                  <option value="condition">💚 Health Conditions</option>
                </select>
              </div>

              {/* CONDITIONAL FILTER: Diagnosis Mode */}
              {viewMode === "diagnosis" ? (
                <div className="control-group">
                  <label htmlFor="severity-filter">
                    🎯 Filter by Severity:
                  </label>
                  <select
                    id="severity-filter"
                    value={filterValue}
                    onChange={handleFilterChange}
                    className="control-select"
                  >
                    <option value="All">All Severities</option>
                    {severityOptions.map((severity) => (
                      <option key={severity} value={severity}>
                        {severity}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                /* CONDITIONAL FILTER: Condition Mode */
                <div className="control-group">
                  <label htmlFor="condition-filter">
                    🎯 Filter by Condition:
                  </label>
                  <select
                    id="condition-filter"
                    value={filterValue}
                    onChange={handleFilterChange}
                    className="control-select"
                  >
                    <option value="All">All Conditions</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              )}
            </div>

            {/* MAP CONTAINER */}
            <div className="heatmap-map-container">
              <StreetHeatmap viewMode={viewMode} filterValue={filterValue} />
            </div>

            {/* LEGEND - Dynamic based on view mode */}
            <div className="heatmap-legend">
              {viewMode === "diagnosis" ? (
                // ===== DIAGNOSIS LEGEND =====
                <>
                  <h3>📊 Severity Legend (Diagnosis Mode)</h3>
                  <p>
                    Color indicates the severity level of the most common
                    diagnosis in each street.
                  </p>

                  <div className="legend-item">
                    <div
                      className="legend-color"
                      style={{ backgroundColor: "#FF0000" }}
                    />
                    <span>
                      <strong>🔴 High:</strong> Critical conditions requiring
                      urgent attention
                      <br />
                      <small>
                        (Hypertension, Diabetes, Heart Disease, Stroke, etc.)
                      </small>
                    </span>
                  </div>

                  <div className="legend-item">
                    <div
                      className="legend-color"
                      style={{ backgroundColor: "#FF7F00" }}
                    />
                    <span>
                      <strong>🟠 Medium:</strong> Moderate conditions requiring
                      monitoring
                      <br />
                      <small>
                        (Respiratory Infection, Asthma, Pneumonia, Arthritis,
                        etc.)
                      </small>
                    </span>
                  </div>

                  <div className="legend-item">
                    <div
                      className="legend-color"
                      style={{ backgroundColor: "#FFFF00" }}
                    />
                    <span>
                      <strong>🟡 Low:</strong> Minor conditions, usually
                      self-limiting
                      <br />
                      <small>(Flu, Sore Throat, Cough, Headache, etc.)</small>
                    </span>
                  </div>

                  <div className="legend-item">
                    <div
                      className="legend-color"
                      style={{ backgroundColor: "#00FF00" }}
                    />
                    <span>
                      <strong>🟢 Healthy:</strong> No health concerns detected
                    </span>
                  </div>
                </>
              ) : (
                // ===== CONDITION LEGEND (Original) =====
                <>
                  <h3>📊 Condition Legend (Traditional Mode)</h3>
                  <p>
                    Color intensity indicates overall health status severity
                    across streets.
                  </p>

                  <div className="legend-item">
                    <div
                      className="legend-color"
                      style={{ backgroundColor: "#0000FF" }}
                    />
                    <span>
                      <strong>🔵 Good:</strong> No health concerns detected
                    </span>
                  </div>

                  <div className="legend-item">
                    <div
                      className="legend-color"
                      style={{ backgroundColor: "#00FF00" }}
                    />
                    <span>
                      <strong>🟢 Fair:</strong> Minor health issues present
                    </span>
                  </div>

                  <div className="legend-item">
                    <div
                      className="legend-color"
                      style={{ backgroundColor: "#FFFF00" }}
                    />
                    <span>
                      <strong>🟡 Poor:</strong> Significant health concerns
                    </span>
                  </div>

                  <div className="legend-item">
                    <div
                      className="legend-color"
                      style={{ backgroundColor: "#FF7F00" }}
                    />
                    <span>
                      <strong>🟠 Critical:</strong> Urgent intervention needed
                    </span>
                  </div>

                  <div className="legend-item">
                    <div
                      className="legend-color"
                      style={{ backgroundColor: "#FF0000" }}
                    />
                    <span>
                      <strong>🔴 Emergency:</strong> Immediate action required
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* INFO SECTION */}
            <div className="heatmap-info">
              <h3>ℹ️ How to Use This Map</h3>
              <ul>
                <li>
                  <strong>🔍 Zoom:</strong> Use mouse scroll wheel or +/-
                  buttons to zoom in/out
                </li>
                <li>
                  <strong>👆 Pan:</strong> Click and drag the map to move around
                </li>
                <li>
                  <strong>🔄 Switch Views:</strong> Toggle between Diagnosis and
                  Condition views at the top
                </li>
                <li>
                  <strong>🎯 Filter:</strong> Use the dropdown menu to show
                  specific conditions or severity levels
                </li>
                <li>
                  <strong>ℹ️ Details:</strong> Click on any colored marker to
                  see detailed information
                </li>
                <li>
                  <strong>📍 Marker Size:</strong> Larger markers indicate more
                  cases in that street
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HeatmapPage;
