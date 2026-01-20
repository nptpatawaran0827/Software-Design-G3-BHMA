import React, { useState } from 'react'; //
import StreetHeatmap from './components/StreetHeatmap';
import './style/HeatmapPage.css';

const HeatmapPage = () => {
    const [filterCondition, setFilterCondition] = useState('All'); //




    return (
        <div className="heatmap-page-container">
            <div className="heatmap-header">
                <h1>📊 Barangay Health Map</h1>
                <p>Real-time heatmap visualization of health conditions across streets</p>
            </div>




            <div className="heatmap-controls">
                <label htmlFor="condition-filter">Filter by Condition:</label>
                <select
                    id="condition-filter"
                    value={filterCondition}
                    onChange={(e) => setFilterCondition(e.target.value)}
                >
                    <option value="All">All Conditions</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                    <option value="Critical">Critical</option>
                </select>
            </div>




            <div className="heatmap-map-container">
                <StreetHeatmap filterCondition={filterCondition} />
            </div>




            <div className="heatmap-legend">
                <h3>📊 Condition Legend</h3>
                <p>Color intensity indicates health status severity across the area.</p>
                <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#0000FF' }} />
                    <span><strong>Good:</strong> No health concerns detected</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#00FF00' }} />
                    <span><strong>Fair:</strong> Minor health issues present</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#FFFF00' }} />
                    <span><strong>Poor:</strong> Significant health concerns</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#FF7F00' }} />
                    <span><strong>Critical:</strong> Urgent intervention needed</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#FF0000' }} />
                    <span><strong>Emergency:</strong> Immediate action required</span>
                </div>
            </div>




            <div className="heatmap-info">
                <h3>ℹ️ How to Use This Map</h3>
                <ul>
                    <li><strong>Zoom:</strong> Use scroll wheel or +/- buttons to zoom in/out</li>
                    <li><strong>Pan:</strong> Click and drag to move around the map</li>
                    <li><strong>Filter:</strong> Use the dropdown to show specific health conditions</li>
                    <li><strong>Details:</strong> Click on any data point to see street name and condition details</li>
                </ul>
            </div>
        </div>
    );
};




export default HeatmapPage; //







