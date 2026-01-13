import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ 
  title, 
  value, 
  trend, 
  color = '#3b82f6',
  icon,
  className = '',
  onClick 
}) => {
  const trendValue = parseFloat(trend.replace(/[+%]/g, '')) || 0;
  const isPositive = trend.startsWith('+') || trendValue > 0;
  const trendColor = isPositive ? '#10b981' : '#ef4444';
  
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const numberVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.8,
        delay: 0.2,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      className={`stat-card ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ 
        y: -8,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      role={onClick ? "button" : "article"}
      tabIndex={onClick ? 0 : undefined}
      style={{
        padding: '28px 24px',
        borderRadius: '20px',
        background: 'rgba(30, 41, 59, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(50, 65, 85, 0.6)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '140px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      {/* Icon Slot */}
      {icon && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '32px',
          height: '32px',
          opacity: 0.8
        }}>
          {icon}
        </div>
      )}
      
      {/* Title */}
      <div style={{ 
        color: 'rgba(148, 163, 184, 0.9)', 
        fontSize: '0.875rem', 
        lineHeight: '1.4',
        fontWeight: '600',
        letterSpacing: '-0.025em',
        marginBottom: '16px'
      }}>
        {title}
      </div>
      
      {/* Value */}
      <motion.div 
        variants={numberVariants}
        style={{ 
          fontSize: 'clamp(2rem, 5vw, 3rem)', 
          fontWeight: '800',
          background: `linear-gradient(135deg, ${color}, ${color}cc)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '12px',
          fontFeatureSettings: '"zero", "tnum"',
          lineHeight: '1.1'
        }}
        aria-label={`${value} ${title}`}
      >
        {value}
      </motion.div>
      
      {/* Trend */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        style={{ 
          color: trendColor, 
          fontSize: '0.875rem',
          fontWeight: '700',
          letterSpacing: '-0.025em',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: isPositive ? [-180, 0] : [180, 0]
          }}
          transition={{ 
            duration: 0.6, 
            delay: 0.5,
            repeat: 1,
            repeatDelay: 2
          }}
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: trendColor,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          {isPositive ? '↗' : '↘'}
        </motion.div>
        <span>{trend}</span>
      </motion.div>
      
      {/* Hover glow effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(135deg, ${color}20, transparent)`,
        opacity: 0,
        borderRadius: '20px',
        transition: 'opacity 0.3s ease'
      }}
      className="glow-effect"
      />
    </motion.div>
  );
};

export default StatCard;
