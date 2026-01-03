import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
      
      {/* Hero Section */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Real-Time Crisis <span style={{ color: 'var(--accent)' }}>Response</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', marginBottom: '2rem' }}>
          Connects citizens, volunteers, and agencies in one unified platform during emergencies.
          Report incidents, track resources, and save lives.
        </p>
        
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <Link to="/report">
            <button className="btn btn-danger" style={{ fontSize: '1.2rem', padding: '15px 30px' }}>
              SOS: Request Help
            </button>
          </Link>
          <Link to="/map">
            <button className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '15px 30px' }}>
              View Live Map
            </button>
          </Link>
        </div>
      </div>

      {/* Quick Stats Preview (Optional for now) */}
      <div className="grid-layout" style={{ marginTop: '4rem', textAlign: 'left' }}>
        <div className="card">
          <h3>🚑 Medical Support</h3>
          <p style={{ color: 'var(--text-dim)' }}>Find nearest ambulances and hospitals with bed availability.</p>
        </div>
        <div className="card">
          <h3>🔥 Disaster Alerts</h3>
          <p style={{ color: 'var(--text-dim)' }}>Real-time notifications for floods, fires, and earthquakes.</p>
        </div>
        <div className="card">
          <h3>📦 Resource Tracking</h3>
          <p style={{ color: 'var(--text-dim)' }}>Monitor food, water, and shelter supplies in your area.</p>
        </div>
      </div>

    </div>
  );
};

export default Home;