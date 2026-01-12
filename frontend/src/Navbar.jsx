import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = [
    { path: '/', label: '🏠 Home' },
    { path: '/dashboard', label: '🚨 Dashboard' },
    { path: '/map', label: '🗺️ Live Map' },
    { path: '/report', label: '📋 Report' },
    { path: '/login', label: '🔐 Login' }
  ];

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <nav 
      className={`navbar transition-all duration-300 ${
        isScrolled ? 'navbar-scrolled' : 'navbar-default'
      }`}
    >
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          🚨 <span>ResQLink</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-desktop">
          {navItems.map(item => (
            <Link 
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'nav-link-active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobile menu button */}
        <button 
          className={`mobile-toggle ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`mobile-menu ${isOpen ? 'mobile-menu-open' : ''}`}>
        <div className="mobile-menu-overlay" onClick={() => setIsOpen(false)} />
        <div className="mobile-menu-content">
          {navItems.map((item, index) => (
            <Link 
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${location.pathname === item.path ? 'mobile-nav-link-active' : ''}`}
              style={{ 
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'forwards'
              }}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
