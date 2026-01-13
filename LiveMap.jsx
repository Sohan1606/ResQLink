import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import './LiveMap.css';

// 🛡️ Fix Leaflet default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// 🎨 Custom severity icons
const getSeverityIcon = (severity) => {
  const colors = {
    Critical: '#ef4444',
    High: '#f59e0b',
    Medium: '#eab308',
    Low: '#10b981'
  };
  
  return L.divIcon({
    html: `<div style="
      background: ${colors[severity] || '#10b981'};
      width: 24px; height: 24px; 
      border-radius: 50%; 
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
      font-weight: bold; color: white; font-size: 12px;
    ">${severity.charAt(0)}</div>`,
    className: 'custom-div-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const IncidentPopup = React.memo(({ incident }) => {
  const formatTimeAgo = (timestamp) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000 / 60);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  return (
    <div className="incident-popup">
      <h3 style={{ margin: '0 0 8px 0', color: 'var(--accent)' }}>
        🚨 {incident.title || 'Incident'}
      </h3>
      <div className="popup-badges" style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <span className={`severity-badge ${incident.severity?.toLowerCase()}`} 
              style={{ 
                background: 'var(--gradient-danger)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
          {incident.severity || 'Unknown'}
        </span>
        <span className={`category-badge ${incident.category?.toLowerCase()}`} 
              style={{ 
                background: '#1e293b',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px'
              }}>
          {incident.category || 'Other'}
        </span>
      </div>
      <div style={{ fontSize: '13px', marginBottom: '4px', wordBreak: 'break-word' }}>
        📍 <strong>{incident.location || 'Location not specified'}</strong>
      </div>
      <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
        ⏰ {formatTimeAgo(incident.createdAt || Date.now())}
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button className="btn btn-primary" 
                style={{ 
                  padding: '6px 12px', 
                  fontSize: '12px',
                  flex: 1
                }}
                onClick={() => window.open(`tel:+917045678912`, '_blank')}>
          📞 Call Help
        </button>
        <button className="btn btn-danger" 
                style={{ 
                  padding: '6px 8px', 
                  fontSize: '12px',
                  minWidth: '44px'
                }}>
          ⚠️
        </button>
      </div>
    </div>
  );
});

const IncidentTracker = ({ incidents, loading }) => {
  useMapEvents({
    zoomend: () => {
      // Auto-refresh on zoom/pan
      window.dispatchEvent(new CustomEvent('map-move'));
    },
    moveend: () => {
      window.dispatchEvent(new CustomEvent('map-move'));
    }
  });

  if (!incidents || !incidents.length) return null;

  return (
    <>
      {incidents.map((incident) => {
        // Validate coordinates before rendering
        const lat = parseFloat(incident.lat);
        const lng = parseFloat(incident.lng);
        
        if (isNaN(lat) || isNaN(lng)) {
          console.warn('Invalid coordinates for incident:', incident._id);
          return null;
        }
        
        return (
          <Marker 
            key={incident._id}
            position={[lat, lng]}
            icon={getSeverityIcon(incident.severity)}
          >
            <Popup maxWidth={300}>
              <IncidentPopup incident={incident} />
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

const LiveMap = () => {
  const defaultCenter = [19.2438, 73.1350]; // Kalyan, Maharashtra
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('connecting');
  const abortControllerRef = useRef(null);
  const fetchIntervalRef = useRef(null);
  const mapMoveHandlerRef = useRef(null);

  // 🛠️ Optimized fetch function
  const fetchIncidents = useCallback(async (signal) => {
    try {
      setLoading(true);
      setStatus('fetching');
      
      // 🚀 Primary: Backend API
      const response = await axios.get('http://localhost:5000/api/reports', { 
        signal,
        timeout: 8000
      });

      console.log("✅ BACKEND CONNECTED:", response.data.length, "incidents");
      
      const realIncidents = response.data.map(incident => {
        // Extract coordinates from GeoJSON location object
        let lat = 19.2438;
        let lng = 73.1350;
        let locationAddress = 'Location not specified';
        
        if (incident.location) {
          if (typeof incident.location === 'string') {
            locationAddress = incident.location;
          } else if (incident.location.coordinates && Array.isArray(incident.location.coordinates)) {
            // GeoJSON format: [lng, lat]
            lng = parseFloat(incident.location.coordinates[0]) || 73.1350;
            lat = parseFloat(incident.location.coordinates[1]) || 19.2438;
            locationAddress = incident.location.address || 'Location not specified';
          }
        }
        
        return {
          _id: incident._id,
          title: incident.title,
          category: incident.category,
          severity: incident.severity,
          location: locationAddress,
          lat: lat,
          lng: lng,
          createdAt: new Date(incident.createdAt).getTime()
        };
      });

      setIncidents(realIncidents);
      setError(null);
      setStatus('connected');

    } catch (err) {
      if (signal?.aborted) return;
      
      console.log("🔄 Backend offline, using fallback...");
      
      // 🎭 Enhanced fallback with realistic data
      const mockIncidents = [
        {
          _id: `mock-${Date.now()}-1`,
          title: "🚗 Multi-vehicle collision",
          category: "Medical",
          severity: "Critical",
          location: "NH-61, Kalyan (5km)",
          lat: 19.2438 + (Math.random() - 0.5) * 0.01,
          lng: 73.1350 + (Math.random() - 0.5) * 0.01,
          createdAt: Date.now() - 2 * 60 * 1000
        },
        {
          _id: `mock-${Date.now()}-2`,
          title: "☣️ Chemical spill reported",
          category: "Hazard",
          severity: "High",
          location: "Industrial Zone B",
          lat: 19.2410 + (Math.random() - 0.5) * 0.005,
          lng: 73.1300 + (Math.random() - 0.5) * 0.005,
          createdAt: Date.now() - 5 * 60 * 1000
        },
        {
          _id: `mock-${Date.now()}-3`,
          title: "👴 Elderly fall assistance",
          category: "Medical",
          severity: "Medium",
          location: "Sector-7, Kalyan",
          lat: 19.2460 + (Math.random() - 0.5) * 0.005,
          lng: 73.1380 + (Math.random() - 0.5) * 0.005,
          createdAt: Date.now() - 8 * 60 * 1000
        }
      ];
      
      setIncidents(mockIncidents);
      setError("🔄 Backend offline - Demo mode");
      setStatus('demo');
    } finally {
      setLoading(false);
    }
  }, []);

  // 🚀 Optimized effect with cleanup
  useEffect(() => {
    abortControllerRef.current = new AbortController();
    
    // Initial load
    fetchIncidents(abortControllerRef.current.signal);
    
    // Adaptive refresh interval (5s when active, 30s when idle)
    const updateStatus = () => {
      const now = Date.now();
      const recentActivity = incidents.some(i => now - i.createdAt < 5 * 60 * 1000);
      const interval = recentActivity ? 5000 : 30000;
      
      fetchIntervalRef.current = setInterval(() => {
        if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
          fetchIncidents(abortControllerRef.current.signal);
        }
      }, interval);
    };
    
    updateStatus();

    // Listen for map movement to trigger refresh
    mapMoveHandlerRef.current = () => {
      if (Math.random() < 0.3 && abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        fetchIncidents(abortControllerRef.current.signal);
      }
    };
    
    window.addEventListener('map-move', mapMoveHandlerRef.current);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
      }
      if (mapMoveHandlerRef.current) {
        window.removeEventListener('map-move', mapMoveHandlerRef.current);
      }
    };
  }, [fetchIncidents]);

  // 📊 Memoized status display
  const statusDisplay = useMemo(() => {
    switch (status) {
      case 'connecting': return '🔄 Connecting...';
      case 'fetching': return '🔄 Updating...';
      case 'connected': return `${incidents.length} Active Alerts`;
      case 'demo': return `${incidents.length} Demo Alerts`;
      default: return 'Ready';
    }
  }, [status, incidents.length]);

  return (
    <div className="live-map-container">
      {/* 🔔 Enhanced Header */}
      <div className="map-header">
        <div className="map-title">
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            📍 Live Crisis Map - Kalyan
          </h2>
          <div className="status-bar" style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '13px' }}>
            <span className={`status-badge ${status}`}>
              {loading ? '🔄 Loading...' : statusDisplay}
            </span>
            <span className="last-update" style={{ color: 'var(--text-dim)' }}>
              {error ? '🔄 Auto-retrying...' : `Updated ${new Date().toLocaleTimeString('en-IN', { hour12: true })}`}
            </span>
          </div>
        </div>
      </div>

      {/* 🌍 Optimized Map */}
      <MapContainer 
        center={defaultCenter} 
        zoom={13}
        style={{ height: "calc(100% - 100px)", width: "100%", position: "relative", flex: 1 }}
        className="crisis-map"
        preferCanvas={true} // 🎯 Performance boost
        zoomAnimation={true}
        scrollWheelZoom={true}
      >
        {/* Dark theme tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* 🚨 Direct Markers - No Clustering */}
        <IncidentTracker incidents={incidents} loading={loading} />
      </MapContainer>

      {/* 📱 Connection Status */}
      {error && (
        <div className="connection-status">
          <div className="status-indicator">
            <span className={`status-dot ${status}`}></span>
            {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(LiveMap);
