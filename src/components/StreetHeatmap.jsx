import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  // ===== FETCH HEATMAP DATA BASED ON VIEW MODE =====
  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        // Build query parameter based on view mode
        const queryParam =
          viewMode === "diagnosis" ? "?type=diagnosis" : "?type=condition";
        const response = await fetch(
          `https://software-design-g3-bhma-2026.onrender.com/api/heatmap-data${queryParam}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setHeatmapData(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching heatmap data:", error);
        setError(`Failed to load heatmap data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [viewMode]);

  // ===== WAIT FOR DOM ELEMENT TO BE READY =====
  useEffect(() => {
    const checkDOM = setInterval(() => {
      const mapContainer = document.getElementById("heatmap");
      if (mapContainer) {
        clearInterval(checkDOM);
        setMapReady(true);
      }
    }, 50); // Check every 50ms instead of 100ms

    return () => clearInterval(checkDOM);
  }, []);

  // ===== CLEANUP MAP ON UNMOUNT OR MODE CHANGE =====
  useEffect(() => {
    return () => {
      if (map) {
        console.log("Cleaning up map instance");
        map.remove();
        setMap(null);
        setMarkersLayer(null);
      }
    };
  }, [viewMode]); // Cleanup when view mode changes

  // ===== INITIALIZE MAP (Only after DOM is ready) =====
  useEffect(() => {
    if (!mapReady || map) return; // Wait for DOM to be ready and map not already initialized

    const mapContainer = document.getElementById("heatmap");
    if (!mapContainer) {
      console.warn("Map container not found");
      return;
    }

    try {
      console.log("Initializing map...");

      const newMap = L.map("heatmap", {
        center: [14.6591, 121.1203],
        zoom: 14,
        minZoom: 12,
        maxZoom: 18,
        dragging: true,
        scrollWheelZoom: false, // Disabled by default
        zoomControl: true,
      });

      // Add OpenStreetMap tiles
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

      // Invalidate size to ensure proper rendering
      setTimeout(() => {
        newMap.invalidateSize();
      }, 100);

      setMap(newMap);
      console.log("Map initialized successfully");
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to initialize map");
    }
  }, [mapReady, map]);

  // ===== UPDATE MARKERS WHEN DATA OR FILTER CHANGES =====
  useEffect(() => {
    if (!map || heatmapData.length === 0) return;

    // Remove existing markers
    if (markersLayer) {
      markersLayer.clearLayers();
    } else {
      // Create new markers layer if it doesn't exist
      const newMarkersLayer = L.featureGroup();
      newMarkersLayer.addTo(map);
      setMarkersLayer(newMarkersLayer);
      return;
    }

    // Add markers based on view mode
    heatmapData.forEach((item) => {
      let shouldShow = false;
      let markerColor = "#808080";
      let markerLabel = "";
      let popupContent = "";

      if (viewMode === "diagnosis") {
        // ===== DIAGNOSIS MODE =====
        const { severity, color, icon } = getDiagnosisSeverity(item.Diagnosis);

        shouldShow = filterValue === "All" || filterValue === severity;
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
        // ===== CONDITION MODE (Original) =====
        const conditionColors = {
          Good: "#0000FF",
          Fair: "#00FF00",
          Poor: "#FFFF00",
          Critical: "#FF7F00",
          Emergency: "#FF0000",
        };

        shouldShow =
          filterValue === "All" || filterValue === item.Health_Condition;
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

      // Add marker if it passes filter
      if (shouldShow) {
        // Calculate marker size based on case count
        const radius = Math.min(15, 8 + Math.sqrt(item.count));

        const marker = L.circleMarker(
          [parseFloat(item.Latitude), parseFloat(item.Longitude)],
          {
            radius: radius,
            fillColor: markerColor,
            color: "#000000",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.7,
          },
        );

        // Bind popup with custom content
        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: "heatmap-popup-window",
        });

        // Show popup on hover
        marker.on("mouseover", function () {
          this.openPopup();
        });
        marker.on("mouseout", function () {
          this.closePopup();
        });

        // Add tooltip on hover
        marker.bindTooltip(
          `${markerLabel} ${item.Diagnosis || item.Health_Condition}`,
          {
            permanent: false,
            direction: "top",
          },
        );

        markersLayer.addLayer(marker);
      }
    });
  }, [heatmapData, filterValue, viewMode, map, markersLayer]);

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
        style={{
          width: "100%",
          height: "600px",
          borderRadius: "12px",
          display: !loading && !error ? "block" : "none",
          backgroundColor: "#f0f0f0",
        }}
      />
    </div>
  );
};

export default StreetHeatmap;
