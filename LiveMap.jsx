import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios'; // Import Axios to talk to Backend
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- 1. Fix for the Default Marker Icon (Leaflet Bug) ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- 2. The Live Map Component ---
const LiveMap = () => {
  // Default Center (Mumbai) - Change this if you want
  const defaultCenter = [19.0760, 72.8777]; 
  
  // State to store incidents from Database
  const [incidents, setIncidents] = useState([]);

  // Fetch Real Data from Backend when page loads
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/incidents');
        setIncidents(response.data); // Store DB data in state
      } catch (error) {
        console.error("Error fetching incidents:", error);
      }
    };

    fetchIncidents();
  }, []);

  return (
    <div style={{ height: "calc(100vh - 70px)", width: "100%", position: "relative" }}>
      
      {/* Overlay Title */}
      <div style={{
        position: 'absolute', 
        top: '20px', 
        left: '60px', 
        zIndex: 999, 
        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
        padding: '10px 20px', 
        borderRadius: '8px',
        color: 'white',
        border: '1px solid #334155'
      }}>
        <h3 style={{ margin: 0 }}>📍 Live Crisis Map</h3>
        <small>Real-time updates active • {incidents.length} Alerts</small>
      </div>

      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        style={{ height: "100%", width: "100%" }}
      >
        {/* Dark Mode Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Loop through Database Incidents and create Markers */}
        {incidents.map((incident) => (
          <Marker 
            key={incident._id} // MongoDB uses _id, not id
            position={[
              incident.lat || 19.0760, // Fallback if lat is missing 
              incident.lng || 72.8777
            ]}
          >
            <Popup>
              <div style={{ color: 'black' }}>
                <strong style={{ fontSize: '1.1rem' }}>{incident.title}</strong>
                <br />
                <span style={{ 
                    display: 'inline-block', 
                    marginTop: '5px',
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    color: 'white',
                    fontSize: '0.8rem',
                    backgroundColor: incident.severity === 'Critical' ? '#ef4444' : '#3b82f6' 
                }}>
                  {incident.category} | {incident.severity}
                </span>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>{incident.location}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LiveMap;