import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const StreetHeatmap = ({ filterCondition }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [heatmapData, setHeatmapData] = useState([]);

    const defaultCenter = [14.650253795814589, 121.12079767277756];
    const defaultZoom = 16;

    const streetCoordinates = {
        'Apitong Street': { lat: 14.658212270426631, lng: 121.12147765919522 },
        'Champagnat Street': { lat: 14.648548214860758, lng: 121.11945109529508 },
        'Champaca Street': { lat: 14.659023407330785, lng: 121.12826892016655 },
        'Dao Street': { lat: 14.654749142957185, lng: 121.11852473684391 },
        'Ipil Street': { lat: 14.65591085327617, lng: 121.11903995702592 },
        'East Drive Street': { lat: 14.655145862854058, lng: 121.1211660381342 },
        'General Ordonez Street': { lat: 14.651969970894116, lng: 121.11371870978819 },
        'Liwasang Kalayaan Street': { lat: 14.648776240760355, lng: 121.11470125093561 },
        'Narra Street': { lat: 14.66882297913623, lng: 121.10455465810732 },
        'P. Valenzuela Street': { lat: 14.651001066452354, lng: 121.11432684313557 }
    };

    const mockData = [
        { lat: 14.658212270426631, lng: 121.12147765919522, intensity: 0.8, condition: 'Fair', street: 'Apitong Street' },
        { lat: 14.648548214860758, lng: 121.11945109529508, intensity: 0.6, condition: 'Good', street: 'Champagnat Street' },
        { lat: 14.659023407330785, lng: 121.12826892016655, intensity: 0.9, condition: 'Poor', street: 'Champaca Street' },
        { lat: 14.654749142957185, lng: 121.11852473684391, intensity: 0.4, condition: 'Good', street: 'Dao Street' },
        { lat: 14.65591085327617, lng: 121.11903995702592, intensity: 0.7, condition: 'Fair', street: 'Ipil Street' },
        { lat: 14.655145862854058, lng: 121.1211660381342, intensity: 0.5, condition: 'Good', street: 'East Drive Street' },
        { lat: 14.651969970894116, lng: 121.11371870978819, intensity: 0.8, condition: 'Fair', street: 'General Ordonez Street' },
        { lat: 14.648776240760355, lng: 121.11470125093561, intensity: 1.0, condition: 'Critical', street: 'Liwasang Kalayaan Street' },
        { lat: 14.66882297913623, lng: 121.10455465810732, intensity: 0.3, condition: 'Good', street: 'Narra Street' },
        { lat: 14.651001066452354, lng: 121.11432684313557, intensity: 0.6, condition: 'Fair', street: 'P. Valenzuela Street' },
    ];

    useEffect(() => {
        if (map.current) return;

        // The container check now happens AFTER we are sure the div is rendered
        if (!mapContainer.current) {
            console.error("Map container ref is still null");
            return;
        }

        try {
            map.current = L.map(mapContainer.current, {
                preferCanvas: true,
                zoomControl: true,
                attributionControl: true
            }).setView(defaultCenter, defaultZoom);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19,
                minZoom: 0
            }).addTo(map.current);

            // Force a resize check to prevent gray boxes
            setTimeout(() => {
                if (map.current) map.current.invalidateSize();
            }, 250);

            setLoading(false);
        } catch (err) {
            console.error('Map initialization error:', err);
            setError(`Failed to load map: ${err.message}`);
            setLoading(false);
        }

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!map.current) return;

        let filteredData = mockData;
        if (filterCondition && filterCondition !== 'All') {
            filteredData = mockData.filter(item => item.condition === filterCondition);
        }
        setHeatmapData(filteredData);

        map.current.eachLayer(layer => {
            if (layer instanceof L.CircleMarker) {
                map.current.removeLayer(layer);
            }
        });

        filteredData.forEach(point => {
            const color = point.intensity > 0.8 ? '#FF0000'
                : point.intensity > 0.6 ? '#FF7F00'
                : point.intensity > 0.4 ? '#FFFF00'
                : point.intensity > 0.2 ? '#00FF00'
                : '#0000FF';

            L.circleMarker([point.lat, point.lng], {
                radius: 12,
                fillColor: color,
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            })
            .bindPopup(`
                <div style="font-family: sans-serif; font-size: 0.9rem;">
                    <strong>${point.street}</strong><br/>
                    Condition: <strong style="color: #0f766e;">${point.condition}</strong><br/>
                    Intensity: ${(point.intensity * 100).toFixed(0)}%
                </div>
            `)
            .addTo(map.current);
        });
    }, [filterCondition, loading]);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', backgroundColor: '#e5e7eb' }}>
            {/* THE MAP DIV - Must always be rendered for the ref to work */}
            <div ref={mapContainer} style={{ width: '100%', height: '100%', zIndex: 1 }} />
            
            {/* OVERLAY: Loading State */}
            {loading && !error && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(249, 250, 251, 0.8)' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div className="spinner"></div>
                        <p style={{ color: '#0f766e', fontWeight: 'bold' }}>Initializing Map...</p>
                    </div>
                </div>
            )}

            {/* OVERLAY: Error State */}
            {error && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fee2e2', color: '#b91c1c', padding: '20px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Map Error</p>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {/* Map UI Elements */}
            {!loading && !error && (
                <>
                    <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '12px 16px', borderRadius: '6px', zIndex: 1000, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', pointerEvents: 'none' }}>
                        <div style={{ fontWeight: 'bold', color: '#0f766e' }}>MARIKINA HEIGHTS</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Active Monitoring</div>
                    </div>

                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '6px 10px', borderRadius: '4px', zIndex: 1000, fontSize: '0.8rem' }}>
                        Nodes: {heatmapData.length}
                    </div>
                </>
            )}
        </div>
    );
};

export default StreetHeatmap;