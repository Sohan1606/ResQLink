import React from 'react';

const ResourceCard = ({ type, quantity, location, contact }) => {
  return (
    <div className="card" style={{ borderTop: '4px solid var(--secondary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h3 style={{ margin: 0 }}>{type}</h3>
        <span style={{ 
          background: 'rgba(59, 130, 246, 0.2)', 
          color: '#60a5fa', 
          padding: '2px 8px', 
          borderRadius: '4px',
          fontWeight: 'bold'
        }}>
          Qty: {quantity}
        </span>
      </div>

      <p style={{ margin: '5px 0', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
        📍 {location}
      </p>
      
      <p style={{ margin: '5px 0', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
        📞 {contact}
      </p>

      <button className="btn" style={{ 
        width: '100%', 
        marginTop: '10px', 
        background: '#334155', 
        color: 'white', 
        padding: '8px' 
      }}>
        Request Allocation
      </button>
    </div>
  );
};

export default ResourceCard;