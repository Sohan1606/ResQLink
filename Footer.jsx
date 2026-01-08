import React from 'react';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        {/* 🎨 Main Branding */}
        <div className="footer-brand">
          <div className="logo-container">
            🚨
            <span className="brand-text">RESQLINK</span>
          </div>
          <p className="tagline">
            Real-time Crisis Response Platform
          </p>
        </div>

        {/* 📱 Quick Actions */}
        <div className="footer-actions">
          <a href="/report" className="action-btn primary">
            Report Emergency
          </a>
          <a href="/incidents" className="action-btn secondary">
            Live Incidents
          </a>
        </div>

        {/* 📄 Legal & Info */}
        <div className="footer-legal">
          <p className="copyright">
            © {new Date().getFullYear()} RESQLINK. 
            All rights reserved.
          </p>
          <div className="footer-links">
            <small>Hackathon Project | Kalyan, Maharashtra</small>
            <small>Built for Community Safety 🚀</small>
          </div>
        </div>
      </div>

      {/* 🌐 Bottom Bar */}
      <div className="footer-bottom">
        <div className="emergency-hotline">
          <strong>Emergency:</strong> 100 | 108 | 112
        </div>
        <div className="powered-by">
          Powered by React + Vite
        </div>
      </div>
    </footer>
  );
};

export default Footer;
