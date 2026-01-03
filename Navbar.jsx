import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/globals.css'; // Ensure CSS is linked

const Navbar = () => {
  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '1rem 2rem', 
      background: 'rgba(30, 41, 59, 0.95)', 
      borderBottom: '1px solid #334155',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      {/* Logo Area */}
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>
        <Link to="/">RESQ<span style={{ color: 'white' }}>LINK</span></Link>
      </div>

      {/* Navigation Links */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/map" style={{ color: 'var(--text-dim)' }}>Live Map</Link>
        <Link to="/dashboard" style={{ color: 'var(--text-dim)' }}>Dashboard</Link>
        <Link to="/login" style={{ color: 'var(--text-dim)' }}>Agency Login</Link>
        
        {/* Prominent CTA Button */}
        <Link to="/report">
          <button className="btn btn-danger">REPORT INCIDENT</button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;