import React, { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Lazy load components for better performance
const Navbar = React.lazy(() => import('./Navbar'));
const Home = React.lazy(() => import('./Home'));
const LiveMap = React.lazy(() => import('./LiveMap'));
const Report = React.lazy(() => import('./Report'));
const Dashboard = React.lazy(() => import('./Dashboard'));
const Login = React.lazy(() => import('./Login'));

// Styles
import './App.css';

// Loading Fallback Component
function LoadingFallback() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      fontSize: '18px',
      color: '#e2e8f0',
      fontWeight: '500'
    }}>
      <div style={{ textAlign: 'center', gap: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(226, 232, 240, 0.2)',
          borderTopColor: '#60a5fa',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <span>Loading ResQLink...</span>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// 404 Not Found Component
function NotFound() {
  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
      color: '#e2e8f0'
    }}>
      <h1 style={{
        fontSize: '72px',
        fontWeight: 'bold',
        margin: '0 0 20px 0',
        background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        404
      </h1>
      <h2 style={{
        fontSize: '28px',
        fontWeight: '600',
        margin: '0 0 16px 0',
        color: '#e2e8f0'
      }}>
        Page Not Found
      </h2>
      <p style={{
        fontSize: '16px',
        color: '#94a3b8',
        marginBottom: '32px',
        maxWidth: '500px'
      }}>
        Sorry, the page you're looking for doesn't exist. Please check the URL or navigate back to home.
      </p>
      <a href="/" style={{
        padding: '12px 28px',
        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        transition: 'transform 0.2s ease',
        display: 'inline-block'
      }} onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>
        🏠 Back to Home
      </a>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

function App() {
  const { pathname } = useLocation();
  
  // Check if current route is fullscreen (map)
  const isFullscreenRoute = pathname === '/map';

  return (
    <div className={`app-container ${isFullscreenRoute ? 'fullscreen-mode' : ''}`}>
      <ScrollToTop />
      <Suspense fallback={<LoadingFallback />}>
        <Navbar />
        <main className={`main-content ${isFullscreenRoute ? 'fullscreen-content' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<LiveMap />} />
            <Route path="/report" element={<Report />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </Suspense>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #334155',
            borderRadius: '8px',
            backdropFilter: 'blur(20px)'
          },
        }}
      />
    </div>
  );
}

export default App;