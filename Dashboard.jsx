// 🚨 resQlink Dashboard - Hackathon Champion 2026 (Enhanced)
import React, { useState, useEffect, useRef, useCallback, useMemo, useReducer } from "react";
import axios from "axios";
import StatCard from "./StatCard";
import IncidentCard from "./IncidentCard";
import ResourceCard from "./ResourceCard";

// 🚨 State Management with useReducer for better scalability
const initialStats = { active: 0, critical: 0, medical: 0, resources: 3 };
const statsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_STATS':
      return { ...state, ...action.payload };
    case 'INCREMENT_CRITICAL':
      return { ...state, critical: state.critical + 1 };
    default:
      return state;
  }
};

const Dashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [stats, dispatch] = useReducer(statsReducer, initialStats);
  const [loading, setLoading] = useState(true);
  const [pulseActive, setPulseActive] = useState(false);
  const [showToaster, setShowToaster] = useState(false);
  const [error, setError] = useState(null);
  const audioContextRef = useRef(null);
  const prevCriticalRef = useRef(0);
  const abortControllerRef = useRef(null);

  // 🎵 Optimized Critical Alert Sound
  const playCriticalAlert = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const now = audioContextRef.current.currentTime;
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    oscillator.start(now);
    oscillator.stop(now + 0.5);
  }, []);

  // 📊 Memoized Stats Calculation
  const calculatedStats = useMemo(() => {
    const active = incidents.length;
    const critical = incidents.filter(i => i.severity === 'Critical').length;
    const medical = incidents.filter(i => i.category === 'Medical').length;
    
    return { active, critical, medical };
  }, [incidents]);

  // 🔄 Optimized Data Fetching with AbortController
  const fetchData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.get('http://localhost:5000/api/reports', {
        signal: abortControllerRef.current.signal,
        timeout: 10000
      });
      
      const data = response.data || [];
      setIncidents(data);

      // 🚨 Critical Alert Detection
      const criticalCount = data.filter(i => i.severity === 'Critical').length;
      if (criticalCount > prevCriticalRef.current) {
        playCriticalAlert();
        setShowToaster(true);
        setTimeout(() => setShowToaster(false), 5000);
        dispatch({ type: 'INCREMENT_CRITICAL' });
      }
      prevCriticalRef.current = criticalCount;

      // 💓 Live Pulse Animation
      setPulseActive(true);
      setTimeout(() => setPulseActive(false), 1000);

      // Update stats
      const active = data.length;
      const critical = criticalCount;
      const medical = data.filter(i => i.category === 'Medical').length;
      dispatch({ type: 'SET_STATS', payload: { active, critical, medical } });
      
    } catch (error) {
      if (error.name !== 'CanceledError') {
        console.error("Failed to fetch:", error);
        setError("Failed to load incidents. Retrying...");
      }
    } finally {
      setLoading(false);
    }
  }, [playCriticalAlert]);

  // 🚀 Polling with cleanup
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    
    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  // ⏰ Optimized Time Ago Function
  const timeAgo = useCallback((timestamp) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = Math.floor((now - time) / (60000)); // minutes
    
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  }, []);

  const userRole = localStorage.getItem('userRole');
  const recentIncidents = useMemo(() => incidents.slice(0, 5), [incidents]);

  // 🛡️ Loading Skeleton Component
  const LoadingSkeleton = () => (
    <div className="loading-container" style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
      <div className="hero-skeleton" style={{ 
        height: '200px', maxWidth: '600px', margin: '0 auto 20px',
        background: 'linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: '16px'
      }} />
      <div className="stats-grid" style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' 
      }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton-card" style={{ 
            height: '120px', background: '#334155', borderRadius: '12px',
            animation: 'shimmer 1.5s infinite'
          }} />
        ))}
      </div>
    </div>
  );

  // ❌ Error State
  if (error && !loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
          color: 'white', padding: '40px', borderRadius: '16px', maxWidth: '500px', margin: '0 auto',
          boxShadow: '0 20px 40px rgba(239,68,68,0.3)'
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '24px' }}>⚠️ Connection Issue</h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '16px' }}>{error}</p>
          <button 
            onClick={fetchData}
            className="btn btn-primary"
            style={{ padding: '12px 24px', fontSize: '16px', borderRadius: '8px' }}
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="dashboard">
      {/* 🚨 Emergency Toaster */}
      {showToaster && (
        <div className="toaster" style={{
          position: 'fixed', top: '80px', right: '20px', zIndex: 200,
          background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', 
          padding: '16px 24px', borderRadius: '12px', boxShadow: '0 20px 40px rgba(239,68,68,0.4)',
          maxWidth: '350px', animation: 'slideInRight 0.5s ease-out'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
            🚨 {stats.critical} CRITICAL INCIDENTS
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>New critical alert detected</div>
        </div>
      )}

      {/* 🏢 Hero Header */}
      <header className="hero-header" style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
        padding: '32px', borderRadius: '16px', marginBottom: '32px', border: '1px solid #475569',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ 
          position: 'absolute', top: '24px', left: '24px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
          color: 'white', padding: '10px 20px', borderRadius: '24px', fontSize: '13px', 
          fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px',
          boxShadow: '0 8px 25px rgba(239,68,68,0.4)'
        }}>
          resQlink 🚨 Champion 2026
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ 
              fontSize: 'clamp(2rem, 4vw, 2.5rem)', margin: 0, 
              background: 'linear-gradient(135deg, #ef4444, #f59e0b, #10b981)', 
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800'
            }}>
              resQlink Command Center
            </h1>
            <p style={{ color: '#94a3b8', margin: '8px 0 0 0', fontSize: '16px' }}>
              Real-time emergency response • {new Date().toLocaleTimeString()} • {stats.active} active alerts
              <span style={{ 
                display: 'inline-block', width: '14px', height: '14px', marginLeft: '12px',
                background: pulseActive ? '#ef4444' : '#10b981', borderRadius: '50%',
                animation: pulseActive ? 'pulse 1s infinite' : 'none', boxShadow: '0 0 12px currentColor'
              }} />
            </p>
          </div>
          
          {userRole === 'agency' && (
            <div style={{ 
              background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', 
              padding: '14px 28px', borderRadius: '12px', fontWeight: 'bold',
              boxShadow: '0 8px 25px rgba(16,185,129,0.4)'
            }}>
              🏥 AGENCY CONTROL ACTIVE
            </div>
          )}
        </div>
      </header>

      {/* 📊 Hero Stats Grid */}
      <div className="stats-grid" style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' 
      }}>
        <div className="stat-card critical" style={{ 
          background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', borderRadius: '16px', 
          padding: '32px', textAlign: 'center', border: 'none', boxShadow: '0 20px 40px rgba(239,68,68,0.3)'
        }}>
          <div style={{ fontSize: 'clamp(3rem, 8vw, 4rem)', fontWeight: 'bold', marginBottom: '12px' }}>
            {stats.critical}
          </div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', opacity: 0.95, textTransform: 'uppercase', letterSpacing: '1px' }}>
            🚨 CRITICAL
          </h3>
          <small style={{ opacity: 0.9, fontSize: '14px' }}>Fire • Hazmat • Structural</small>
        </div>
        
        <div className="stat-card active" style={{ 
          background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', 
          borderRadius: '16px', padding: '32px', textAlign: 'center', border: 'none'
        }}>
          <div style={{ fontSize: 'clamp(3rem, 8vw, 4rem)', fontWeight: 'bold', marginBottom: '12px' }}>
            {stats.active - stats.critical}
          </div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', opacity: 0.95, textTransform: 'uppercase', letterSpacing: '1px' }}>
            ⚡ ACTIVE
          </h3>
          <small style={{ opacity: 0.9, fontSize: '14px' }}>High Priority Incidents</small>
        </div>
        
        <div className="stat-card medical" style={{ 
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', 
          borderRadius: '16px', padding: '32px', textAlign: 'center', border: 'none'
        }}>
          <div style={{ fontSize: 'clamp(3rem, 8vw, 4rem)', fontWeight: 'bold', marginBottom: '12px' }}>
            {stats.medical}
          </div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', opacity: 0.95, textTransform: 'uppercase', letterSpacing: '1px' }}>
            🏥 MEDICAL
          </h3>
          <small style={{ opacity: 0.9, fontSize: '14px' }}>Emergency Cases</small>
        </div>
        
        <div className="stat-card resources" style={{ 
          background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', 
          borderRadius: '16px', padding: '32px', textAlign: 'center', border: 'none'
        }}>
          <div style={{ fontSize: 'clamp(3rem, 8vw, 4rem)', fontWeight: 'bold', marginBottom: '12px' }}>
            {stats.resources}
          </div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', opacity: 0.95, textTransform: 'uppercase', letterSpacing: '1px' }}>
            🚑 RESOURCES
          </h3>
          <small style={{ opacity: 0.9, fontSize: '14px' }}>Available Units</small>
        </div>
      </div>

      {/* 🎛️ Agency Controls */}
      {userRole === 'agency' && (
        <div className="agency-controls" style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '16px', marginBottom: '32px', padding: '24px', borderRadius: '16px',
          background: '#1e293b', border: '1px solid #334155'
        }}>
          <button className="btn btn-primary" style={{ padding: '16px', borderRadius: '12px', fontWeight: '600' }}>
            📡 Dispatch Team
          </button>
          <button className="btn btn-warning" style={{ padding: '16px', borderRadius: '12px', fontWeight: '600' }}>
            🚁 Air Support
          </button>
          <button className="btn btn-danger" style={{ padding: '16px', borderRadius: '12px', fontWeight: '600' }}>
            🚨 EVACUATE NOW
          </button>
        </div>
      )}

      {/* 🤖 AI Risk Forecast */}
      <div className="ai-forecast" style={{ 
        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', 
        borderRadius: '16px', marginBottom: '32px', padding: '28px', textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600' }}>🤖 AI RISK FORECAST</h3>
        <div style={{ height: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>Next 24h: <span style={{ color: '#10b981' }}>3.2% ↑</span></div>
          <div style={{ height: '24px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ 
              width: '78%', height: '100%', background: 'linear-gradient(90deg, #10b981, #059669)',
              borderRadius: '12px', animation: 'shimmer 2s infinite'
            }} />
          </div>
          <div style={{ fontSize: '13px', opacity: 0.85 }}>47 incidents • Weather • Traffic analyzed</div>
        </div>
      </div>

      {/* 📋 Main Content Grid */}
      <div className="main-content" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        <section>
          <h3 style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '20px' }}>
            Recent Alerts ({incidents.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recentIncidents.map((incident) => {
              const locationString = typeof incident.location === 'string' 
                ? incident.location 
                : (incident.location?.address || 'Location not specified');
              return (
                <IncidentCard 
                  key={incident._id}
                  title={incident.title}
                  category={incident.category}
                  severity={incident.severity}
                  location={locationString}
                  time={timeAgo(incident.createdAt)}
                />
              );
            })}
            {incidents.length === 0 && (
              <div style={{ 
                padding: '60px 40px', textAlign: 'center', color: '#94a3b8', 
                background: '#1e293b', borderRadius: '12px', border: '1px solid #334155'
              }}>
                <h3 style={{ color: '#64748b', marginBottom: '16px' }}>📭 No Incidents</h3>
                <p>No incidents reported yet. Test from <strong>/report</strong></p>
              </div>
            )}
          </div>
        </section>

        <aside>
          <h3 style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '20px' }}>Available Resources</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ResourceCard type="Ambulance" quantity="3 Units" location="City Hospital" contact="Dr. A. Sharma"/>
            <ResourceCard type="Food Packs" quantity="500 Pkts" location="Community Center" contact="Relief Team A"/>
            <ResourceCard type="Rescue Boat" quantity="2 Units" location="Dockyard" contact="Coast Guard"/>
          </div>
        </aside>
      </div>

      {/* 📱 Mobile Panic Button */}
      <div className="mobile-panic-button" style={{
        position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
        display: 'none'
      }}>
        <button className="panic-button" style={{ 
          width: '70px', height: '70px', borderRadius: '50%', fontSize: '32px', 
          background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white',
          border: 'none', boxShadow: '0 15px 35px rgba(239,68,68,0.5)',
          cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s ease'
        }} onClick={() => window.location.href = '/report'}>
          🚨
        </button>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .mobile-panic-button {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
