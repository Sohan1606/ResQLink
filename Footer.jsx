import React from 'react';

const Footer = () => {
  return (
    <footer style={{ 
      textAlign: 'center', 
      padding: '20px', 
      background: '#0f172a', 
      color: '#64748b', 
      marginTop: 'auto',
      borderTop: '1px solid #1e293b'
    }}>
      <p style={{ margin: 0 }}>
        &copy; {new Date().getFullYear()} <strong>RESQLINK</strong>. Crisis Response Platform.
      </p>
      <small>Hackathon Project | Built for Community Safety</small>
    </footer>
  );
};

export default Footer;