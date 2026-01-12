import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  const [stats, setStats] = useState({
    totalIncidents: 0,
    activeAlerts: 0,
    volunteers: 0
  });

  // 🎯 Real-time stats simulation (replace with real API)
  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        totalIncidents: Math.floor(Math.random() * 1250) + 850,
        activeAlerts: Math.floor(Math.random() * 45) + 12,
        volunteers: Math.floor(Math.random() * 3200) + 1800
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 🚀 Scroll animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  return (
    <div className="home-container" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 🌟 Animated Background Particles */}
      <div className="particles" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}>
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            background: 'rgba(239,68,68,0.6)',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`
          }} />
        ))}
      </div>

      {/* 🎖️ Hero Section */}
      <motion.section
        className="hero"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{
          padding: '6rem 2rem 4rem',
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}
        >
          <motion.h1
            variants={itemVariants}
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              letterSpacing: '-0.02em'
            }}
          >
            Real-Time <span style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Crisis</span>
            <br />
            Response Platform
          </motion.h1>

          <motion.p
            variants={itemVariants}
            style={{
              fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1.7,
              marginBottom: '3rem',
              maxWidth: '600px',
              margin: '0 auto 3rem'
            }}
          >
            Connects citizens, volunteers, and emergency agencies in{' '}
            <span style={{ color: '#3b82f6', fontWeight: 600 }}>one unified platform</span> during critical situations.
            Report incidents instantly, track responders, and coordinate life-saving efforts.
          </motion.p>

          <motion.div
            variants={itemVariants}
            style={{
              display: 'flex',
              gap: '1.5rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link to="/report">
                <motion.button
                  className="hero-btn primary"
                  whileHover={{ y: -4, boxShadow: '0 25px 50px rgba(239,68,68,0.4)' }}
                  style={{
                    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                    padding: '18px 40px',
                    minHeight: '64px',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    border: 'none',
                    borderRadius: '16px',
                    color: 'white',
                    fontWeight: 700,
                    cursor: 'pointer',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  🚨 SOS: Request Help
                </motion.button>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link to="/map">
                <motion.button
                  className="hero-btn secondary"
                  whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(59,130,246,0.3)' }}
                  style={{
                    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                    padding: '18px 40px',
                    minHeight: '64px',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderRadius: '16px',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🗺️ View Live Map
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* 📊 Live Stats */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{
          padding: '4rem 2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2
        }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            textAlign: 'center',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 700,
            color: 'white',
            marginBottom: '3rem'
          }}
        >
          Live Crisis Dashboard
        </motion.h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {[
            { label: 'Total Incidents', value: stats.totalIncidents, icon: '📊', color: '#3b82f6' },
            { label: 'Active Alerts', value: stats.activeAlerts, icon: '🚨', color: '#ef4444' },
            { label: 'Volunteers Ready', value: stats.volunteers, icon: '🧑‍🚀', color: '#10b981' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="stat-card"
              style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '2.5rem 2rem',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem',
                background: `linear-gradient(135deg, ${stat.color}, ${stat.color}cc)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {stat.icon}
              </div>
              <div style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 800,
                color: 'white',
                marginBottom: '0.5rem'
              }}>
                {stat.value.toLocaleString()}
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '1rem',
                fontWeight: 500
              }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ✨ Features Grid */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{
          padding: '4rem 2rem 6rem',
          background: 'rgba(15,23,42,0.7)',
          position: 'relative',
          zIndex: 2
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            style={{
              textAlign: 'center',
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 700,
              color: 'white',
              marginBottom: '4rem'
            }}
          >
            One Platform. <span style={{ color: '#3b82f6' }}>Infinite Impact</span>
          </motion.h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                icon: '🚑',
                title: 'Medical Response',
                desc: 'Nearest ambulances, hospitals with real-time bed availability, and medical volunteer coordination.'
              },
              {
                icon: '🔥',
                title: 'Disaster Alerts',
                desc: 'Live notifications for floods, fires, earthquakes with evacuation routes and safety zones.'
              },
              {
                icon: '📦',
                title: 'Resource Network',
                desc: 'Track food, water, shelter, and medical supplies. Connect donors with those in need.'
              },
              {
                icon: '🗺️',
                title: 'Live Situational Map',
                desc: 'Real-time incident tracking, responder locations, and safe zone mapping.'
              },
              {
                icon: '📱',
                title: 'Mobile-First',
                desc: 'Works offline, GPS-enabled reporting, push notifications, and family check-ins.'
              },
              {
                icon: '⚡',
                title: 'AI-Powered',
                desc: 'Predictive alerts, automatic severity assessment, and intelligent resource allocation.'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="feature-card"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '20px',
                  padding: '2.5rem 2rem',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  fontSize: '3.5rem',
                  marginBottom: '1.5rem'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'white',
                  marginBottom: '1rem'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 1.6,
                  fontSize: '1rem'
                }}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 🎨 Global Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .particles .particle:nth-child(odd) {
          animation-direction: alternate-reverse;
          background: rgba(59,130,246,0.6);
        }
        
        .hero-btn.primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.6s;
        }
        
        .hero-btn.primary:hover::before {
          left: 100%;
        }
        
        @media (max-width: 768px) {
          .home-container {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
