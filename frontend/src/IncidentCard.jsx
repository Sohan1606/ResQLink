import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // For smooth animations

const IncidentCard = ({ 
  title, 
  category, 
  severity, 
  location, 
  time, 
  status = 'active', 
  onView, 
  onDispatch,
  priority = 'normal'
}) => {
  // 🚀 ENHANCED SEVERITY & STATUS SYSTEM
  const getSeverityConfig = (level) => {
    const configs = {
      'Critical': { 
        color: '#ef4444', 
        gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', 
        icon: '🚨', 
        badgeClass: 'severity-critical',
        pulse: true
      },
      'High': { 
        color: '#f59e0b', 
        gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', 
        icon: '⚡', 
        badgeClass: 'severity-high',
        pulse: false
      },
      'Medium': { 
        color: '#eab308', 
        gradient: 'linear-gradient(135deg, #eab308, #ca8a04)', 
        icon: '⚠️', 
        badgeClass: 'severity-medium',
        pulse: false
      },
      'Low': { 
        color: '#10b981', 
        gradient: 'linear-gradient(135deg, #10b981, #059669)', 
        icon: '✅', 
        badgeClass: 'severity-low',
        pulse: false
      }
    };
    return configs[level] || configs.Low;
  };

  const getCategoryConfig = (cat) => {
    const configs = {
      'Medical': { color: '#3b82f6', bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
      'Fire': { color: '#ef4444', bg: 'linear-gradient(135deg, #ef4444, #dc2626)' },
      'Security': { color: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b, #d97706)' },
      'Technical': { color: '#8b5cf6', bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
      'Other': { color: '#6b7280', bg: 'rgba(107,114,128,0.2)' }
    };
    return configs[cat] || configs.Other;
  };

  const severityConfig = getSeverityConfig(severity);
  const categoryConfig = getCategoryConfig(category);

  // 🌟 Local state for hover effects (better UX)
  const [isHovered, setIsHovered] = useState(false);
  const [isActionVisible, setIsActionVisible] = useState(false);

  return (
    <motion.div 
      className="incident-card"
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02, 
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        zIndex: 10
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      style={{ 
        position: 'relative', 
        overflow: 'hidden',
        background: `linear-gradient(145deg, 
          ${severity === 'Critical' ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)'}, 
          rgba(255,255,255,0.01))`,
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderLeft: `5px solid ${severityConfig.color}`,
        borderRadius: '16px',
        cursor: 'pointer',
        userSelect: 'none'
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        setIsActionVisible(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActionVisible(false);
      }}
      onClick={onView}
      role="button"
      tabIndex={0}
      aria-label={`View ${title} incident details`}
    >
      {/* 🚨 DYNAMIC STATUS PULSE INDICATOR */}
      <AnimatePresence>
        {severityConfig.pulse && (
          <motion.div
            className="pulse-indicator"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ 
              scale: [1, 1.4, 1], 
              opacity: [1, 0.7, 1] 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: 'easeInOut' 
            }}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '14px',
              height: '14px',
              background: severityConfig.color,
              borderRadius: '50%',
              boxShadow: `0 0 20px ${severityConfig.color}40`,
              zIndex: 5
            }}
          />
        )}
      </AnimatePresence>

      {/* 📊 MAIN CONTENT */}
      <div style={{ 
        padding: '20px 24px 20px 24px',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        minHeight: '100px'
      }}>
        {/* 📋 LEFT CONTENT */}
        <div style={{ flex: 1, paddingRight: '16px' }}>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', 
            fontWeight: 700,
            lineHeight: 1.3,
            color: 'white',
            wordBreak: 'break-word'
          }}>
            {title}
          </h3>
          
          {/* 🏷️ CATEGORY BADGE */}
          <div style={{
            display: 'inline-flex',
            padding: '6px 14px',
            background: categoryConfig.bg,
            color: 'white',
            borderRadius: '24px',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            marginBottom: '12px',
            letterSpacing: '0.5px'
          }}>
            {categoryConfig.icon || '📋'} {category}
          </div>

          {/* 📍 LOCATION */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: 'rgba(255,255,255,0.8)',
            fontSize: '14px',
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <span style={{ fontSize: '16px' }}>📍</span>
            <span style={{ wordBreak: 'break-all' }}>{location}</span>
          </div>
        </div>

        {/* ⏰ RIGHT STATUS COLUMN */}
        <div style={{ 
          textAlign: 'right', 
          minWidth: '120px',
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-end',
          gap: '12px'
        }}>
          {/* SEVERITY BADGE */}
          <motion.div 
            className={severityConfig.badgeClass}
            whileHover={{ scale: 1.05 }}
            style={{ 
              padding: '10px 16px',
              background: severityConfig.gradient,
              color: 'white',
              borderRadius: '24px',
              fontSize: '13px',
              fontWeight: 700,
              boxShadow: `0 8px 24px ${severityConfig.color}30`,
              minWidth: 'fit-content',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '2px solid rgba(255,255,255,0.2)'
            }}
          >
            <span style={{ fontSize: '16px' }}>{severityConfig.icon}</span>
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {severity}
            </span>
          </motion.div>

          {/* 🕐 TIME */}
          <div style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '12px',
            fontWeight: 500,
            textAlign: 'right'
          }}>
            {time}
          </div>
        </div>
      </div>

      {/* 🎛️ ENHANCED ACTION BAR */}
      <AnimatePresence>
        {isActionVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ 
              opacity: 1, 
              height: 'auto', 
              marginTop: '16px',
              transition: { duration: 0.2 }
            }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            style={{
              padding: '0 24px 24px 24px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              overflow: 'hidden'
            }}
          >
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  minHeight: '44px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.();
                }}
              >
                📋 View Details
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-danger"
                style={{
                  padding: '12px 16px',
                  fontSize: '16px',
                  minHeight: '44px',
                  width: '52px',
                  borderRadius: '12px',
                  border: 'none',
                  background: severityConfig.gradient,
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${severityConfig.color}40`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onDispatch) {
                    onDispatch();
                  } else {
                    if (confirm(`🚨 Dispatch emergency team to:\n\n"${title}"\n${location}?`)) {
                      console.log('🚨 DISPATCHING TEAM:', { title, location, severity });
                    }
                  }
                }}
                title={`Dispatch team for ${title}`}
              >
                🚨
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎨 CSS-in-JS Animation */}
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 20px currentColor; 
          }
          50% { 
            box-shadow: 0 0 40px currentColor, 0 0 60px currentColor; 
          }
        }
        .pulse-indicator {
          animation: pulse-glow 2s infinite ease-in-out;
        }
        .incident-card:focus {
          outline: 2px solid ${severityConfig.color};
          outline-offset: 2px;
        }
      `}</style>
    </motion.div>
  );
};

export default IncidentCard;
