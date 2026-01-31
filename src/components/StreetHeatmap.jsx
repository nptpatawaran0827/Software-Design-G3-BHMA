import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { getDiagnosisSeverity } from "../utils/diagnosisSeverity";

/**
 * STREET HEATMAP COMPONENT
 * Displays health data on an interactive Leaflet map
 * Supports two modes:
 * 1. Diagnosis mode - Shows most common diagnosis per street
 * 2. Condition mode - Shows health conditions (original)
 */

const StreetHeatmap = ({ viewMode = "diagnosis", filterValue = "All" }) => {
  // ===== STATE =====
  const [heatmapData, setHeatmapData] = useState([]);
  const [map, setMap] = useState(null);
  const [markersLayer, setMarkersLayer] = useState(null);
  const [heatLayer, setHeatLayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapReady, setMapReady] = useState(false);

 // ===== FETCH HEATMAP DATA BASED ON VIEW MODE =====
 useEffect(() => {
    setLoading(true);
    setError(null);
    setHeatmapData([]);

    const fetchData = async () => {
      try {
        const queryParam = viewMode === "diagnosis" ? "?type=diagnosis" : "?type=condition";
        
        // Add multiple cache-busting parameters
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const url = `http://localhost:5000/api/heatmap-data${queryParam}&nocache=${timestamp}&rand=${random}`;
        
        console.log("📡 Fetching from URL:", url);

        const response = await fetch(url, {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        console.log("📥 API Response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ Heatmap data fetched:", data);
        console.log("🗺️ First 3 coordinates:");
        data.slice(0, 3).forEach((item, idx) => {
          console.log(`  ${idx + 1}. ${item.Street_Name}: [${item.Latitude}, ${item.Longitude}]`);
        });
        
        setHeatmapData(data);
        setError(null);
      } catch (error) {
        console.error("❌ Error fetching heatmap data:", error);
        setError(`Failed to load heatmap data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [viewMode]);

  // ===== CLEAR MARKERS AND HEAT LAYER WHEN DATA CHANGES =====
  useEffect(() => {
  if (markersLayer) {
    markersLayer.clearLayers();
  }
  if (heatLayer && map) {
    map.removeLayer(heatLayer);
    setHeatLayer(null);
  }
}, [heatmapData]);

  // ===== WAIT FOR DOM ELEMENT TO BE READY =====
  useEffect(() => {
   const checkDOM = setInterval(() => {
      const mapContainer = document.getElementById("heatmap");
      if (mapContainer && mapContainer.offsetHeight > 0) {
        clearInterval(checkDOM);
        setMapReady(true);
      }
    }, 50);

    const timeoutId = setTimeout(() => {
      clearInterval(checkDOM);
      const mapContainer = document.getElementById("heatmap");
      if (mapContainer) {
        setMapReady(true);
      }
    }, 3000);

    return () => {
      clearInterval(checkDOM);
      clearTimeout(timeoutId);
    };
  }, [viewMode]);

  // ===== CLEANUP MAP ON UNMOUNT OR MODE CHANGE =====
  useEffect(() => {
    return () => {
      if (map) {
        console.log("Cleaning up map instance");
        map.remove();
        setMap(null);
        setMarkersLayer(null);
        setHeatLayer(null);
      }
    };
  }, [viewMode]);

  // ===== INITIALIZE MAP (Only after DOM is ready) =====
  useEffect(() => {
    if (!mapReady || map) return;

    const mapContainer = document.getElementById("heatmap");
    if (!mapContainer || mapContainer.offsetHeight === 0) {
      console.warn("Map container not found or has no height");
      return;
    }

     try {
      console.log("Initializing map...");
      console.log("Container dimensions:", {
        width: mapContainer.offsetWidth,
        height: mapContainer.offsetHeight,
      });

      const newMap = L.map("heatmap", {
        center: [14.6591, 121.1203],
        zoom: 14,
        minZoom: 12,
        maxZoom: 18,
        dragging: true,
        scrollWheelZoom: false,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(newMap);

      newMap.on("click", function () {
        if (!newMap.scrollWheelZoom.enabled()) {
          newMap.scrollWheelZoom.enable();
        }
      });

      mapContainer.addEventListener("mouseleave", function () {
        if (newMap.scrollWheelZoom.enabled()) {
          newMap.scrollWheelZoom.disable();
        }
      });

    setTimeout(() => {
        newMap.invalidateSize(true);
      }, 100);

      setTimeout(() => {
        newMap.invalidateSize(true);
      }, 300);

      setMap(newMap);
      console.log("Map initialized successfully");
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to initialize map");
    }
  }, [mapReady, map]);

  // ===== UPDATE HEATMAP AND MARKERS WHEN DATA OR FILTER CHANGES =====
// ===== UPDATE HEATMAP AND MARKERS WHEN DATA OR FILTER CHANGES =====
useEffect(() => {
  if (!map || heatmapData.length === 0) return;

  // Remove existing markers and heat layer
  if (markersLayer) {
    markersLayer.clearLayers();
  } else {
    const newMarkersLayer = L.featureGroup();
    newMarkersLayer.addTo(map);
    setMarkersLayer(newMarkersLayer);
    return;
  }

  if (heatLayer) {
    map.removeLayer(heatLayer);
  }

  // Prepare data for heat layer
  const heatPoints = [];
  const filteredData = [];

  heatmapData.forEach((item) => {
    let shouldShow = false;
    let intensity = 0;

    if (viewMode === "diagnosis") {
      const { severity } = getDiagnosisSeverity(item.Diagnosis);
      shouldShow = filterValue === "All" || filterValue === severity;
      
      // Map severity to intensity (0.0 - 1.0) - INCREASED VALUES
      const severityMap = {
        "Low": 0.3,
        "Moderate": 0.5,
        "High": 0.7,
        "Severe": 0.9,
        "Critical": 1.0
      };
      intensity = severityMap[severity] || 0.5;
    } else {
      shouldShow = filterValue === "All" || filterValue === item.Health_Condition;
      
      // Map condition to intensity - INCREASED VALUES
      const conditionMap = {
        "Good": 0.3,
        "Fair": 0.5,
        "Poor": 0.7,
        "Critical": 0.9,
        "Emergency": 1.0
      };
      intensity = conditionMap[item.Health_Condition] || 0.5;
    }

    if (shouldShow) {
      // Add to heat layer with weighted intensity
      const lat = parseFloat(item.Latitude);
      const lng = parseFloat(item.Longitude);
      // INCREASED intensity calculation
      const weight = intensity * Math.min(item.count / 2, 1.0); // Scale by count
      
      heatPoints.push([lat, lng, weight]);
      filteredData.push(item);
    }
  });

  // Create and add heat layer FIRST (so it renders below markers)
  if (heatPoints.length > 0) {
    const newHeatLayer = L.heatLayer(heatPoints, {
      radius: 35,        // INCREASED from 25
      blur: 25,          // INCREASED from 20
      maxZoom: 17,
      max: 0.8,          // ADJUSTED from 1.0 for better visibility
      minOpacity: 0.4,   // ADDED - minimum opacity for visibility
      gradient: {
        0.0: '#00ff00',  // Green - Low severity
        0.2: '#adff2f',  // Yellow-green
        0.4: '#ffff00',  // Yellow
        0.6: '#ffa500',  // Orange
        0.8: '#ff4500',  // Red-Orange
        1.0: '#ff0000'   // Bright Red - High severity (changed from dark red)
      }
    }).addTo(map);
    
    setHeatLayer(newHeatLayer);
    console.log(`🔥 Heat layer created with ${heatPoints.length} points`);
    console.log(`📊 Intensity range: min=${Math.min(...heatPoints.map(p => p[2]))}, max=${Math.max(...heatPoints.map(p => p[2]))}`);
  }

  // Add interactive markers AFTER heatmap (renders on top)
  filteredData.forEach((item) => {
    let markerColor = "#808080";
    let markerLabel = "";
    let popupContent = "";

    if (viewMode === "diagnosis") {
      const { severity, color, icon } = getDiagnosisSeverity(item.Diagnosis);
      markerColor = color;
      markerLabel = icon;

      popupContent = `
        <div class="heatmap-popup">
          <h5 class="popup-title">
            <strong>${item.Street_Name}</strong>
          </h5>
          <div class="popup-divider"></div>
          <div class="popup-row">
            <span class="popup-label">📋 Diagnosis:</span>
            <span class="popup-value">${item.Diagnosis || "No Diagnosis"}</span>
          </div>
          <div class="popup-row">
            <span class="popup-label">📊 Cases:</span>
            <span class="popup-value" style="color: ${color}; font-weight: bold;">
              ${item.count}
            </span>
          </div>
          <div class="popup-row">
            <span class="popup-label">⚠️ Severity:</span>
            <span class="popup-value" style="color: ${color}; font-weight: bold;">
              ${severity}
            </span>
          </div>
          <div class="popup-row">
            <span class="popup-label">📍 Barangay:</span>
            <span class="popup-value">${item.Barangay}</span>
          </div>
        </div>
      `;
    } else {
      const conditionColors = {
        Good: "#0000FF",
        Fair: "#00FF00",
        Poor: "#FFFF00",
        Critical: "#FF7F00",
        Emergency: "#FF0000",
      };

      markerColor = conditionColors[item.Health_Condition] || "#808080";
      markerLabel = item.Health_Condition?.charAt(0) || "?";

      popupContent = `
        <div class="heatmap-popup">
          <h5 class="popup-title">
            <strong>${item.Street_Name}</strong>
          </h5>
          <div class="popup-divider"></div>
          <div class="popup-row">
            <span class="popup-label">💚 Condition:</span>
            <span class="popup-value">${item.Health_Condition}</span>
          </div>
          <div class="popup-row">
            <span class="popup-label">📊 Cases:</span>
            <span class="popup-value" style="color: ${markerColor}; font-weight: bold;">
              ${item.count}
            </span>
          </div>
          <div class="popup-row">
            <span class="popup-label">📍 Barangay:</span>
            <span class="popup-value">${item.Barangay}</span>
          </div>
        </div>
      `;
    }

    // SMALLER, MORE TRANSPARENT markers
    const radius = Math.min(10, 5 + Math.sqrt(item.count));

    const marker = L.circleMarker(
      [parseFloat(item.Latitude), parseFloat(item.Longitude)],
      {
        radius: radius,
        fillColor: markerColor,
        color: "#ffffff",      // White border for better contrast
        weight: 1,             // Thinner border
        opacity: 0.6,          // More transparent border
        fillOpacity: 0.3,      // VERY transparent fill to show heatmap
      },
    );

    marker.bindPopup(popupContent, {
      maxWidth: 300,
      className: "heatmap-popup-window",
    });

    marker.on("mouseover", function () {
      this.openPopup();
      this.setStyle({ fillOpacity: 0.9, opacity: 1.0 }); // Fully visible on hover
    });
    marker.on("mouseout", function () {
      this.closePopup();
      this.setStyle({ fillOpacity: 0.3, opacity: 0.6 }); // Return to transparent
    });

    marker.bindTooltip(
      `${markerLabel} ${item.Diagnosis || item.Health_Condition}`,
      {
        permanent: false,
        direction: "top",
      },
    );

    markersLayer.addLayer(marker);
  });

  console.log(`📍 Added ${filteredData.length} markers`);
}, [heatmapData, filterValue, viewMode, map]);

  // ===== RENDER =====
  return (
    <div className="heatmap-wrapper">
      {loading && (
        <div className="heatmap-loading">
          <p>📡 Loading heatmap data...</p>
        </div>
      )}

      {error && (
        <div className="heatmap-error">
          <p>⚠️ Error: {error}</p>
        </div>
      )}

      <div
        id="heatmap"
         className="heatmap-map-container"
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "12px",
          display: !loading && !error ? "flex" : "none",
          flexDirection: "column",
        }}
      />
    </div>
  );
};

export default StreetHeatmap;