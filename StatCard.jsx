import React from 'react';

// Props will let us pass different data to this card later
const IncidentCard = ({ title, category, location, time, severity }) => {
  
  // Dynamic color based on severity
  const getSeverityColor = (level) => {
    switch(level) {
      case 'Critical': return '#ef4444'; // Red
      case 'High': return '#f97316';     // Orange
      case 'Medium': return '#eab308';   // Yellow
      default: return '#22c55e';         // Green
    }
  };

  return (
    <div className="card" style={{ borderLeft: `5px solid ${getSeverityColor(severity)}`, marginBottom: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        
        {/* Left Side: Info */}
        <div>
          <h3 style={{ margin: '0 0 5px 0' }}>{title}</h3>
          <span style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            padding: '2px 8px', 
            borderRadius: '4px', 
            fontSize: '0.8rem',
            marginRight: '10px'
          }}>
            {category}
          </span>
          <small style={{ color: 'var(--text-dim)' }}>📍 {location}</small>
        </div>

        {/* Right Side: Status */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold', color: getSeverityColor(severity) }}>{severity}</div>
          <small style={{ color: 'var(--text-dim)' }}>{time}</small>
        </div>

      </div>
      
      {/* Action Buttons */}
      <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
        <button style={{ padding: '5px 10px', background: 'transparent', border: '1px solid #334155', color: 'white', borderRadius: '5px', cursor: 'pointer' }}>
          View Details
        </button>
      </div>
    </div>
  );
};

export default IncidentCard;