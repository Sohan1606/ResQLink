import React from 'react';
import { motion } from 'framer-motion';
import { Phone, MapPin, Users, Truck, AlertCircle } from 'lucide-react';

const ResourceCard = ({ 
  type, 
  quantity, 
  location, 
  contact, 
  status = 'available',
  onRequest,
  isLoading = false,
  className = '' 
}) => {
  // Enhanced resource configurations matching ResQ theme
  const getResourceConfig = (type) => {
    const config = {
      'Ambulance': { 
        icon: Truck, 
        gradient: '135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%',
        glow: '#3b82f6'
      },
      'Doctor': { 
        icon: Users, 
        gradient: '135deg, #10b981 0%, #059669 50%, #047857 100%', 
        glow: '#10b981'
      },
      'Fire Truck': { 
        icon: AlertCircle, 
        gradient: '135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%', 
        glow: '#ef4444'
      },
      'Police': { 
        icon: Users, 
        gradient: '135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%', 
        glow: '#8b5cf6'
      },
      'Blood Bank': { 
        icon: Users, 
        gradient: '135deg, #ec4899 0%, #db2777 50%, #be185d 100%', 
        glow: '#ec4899'
      },
      default: { 
        icon: MapPin, 
        gradient: '135deg, #94a3b8 0%, #64748b 100%', 
        glow: '#94a3b8'
      }
    };
    return config[type] || config.default;
  };

  const ResourceIcon = getResourceConfig(type).icon;
  const config = getResourceConfig(type);
  const statusConfig = {
    available: { text: 'Available', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    busy: { text: 'Busy', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    enroute: { text: 'En Route', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
    offline: { text: 'Offline', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' }
  }[status] || statusConfig.available;

  return (
    <motion.div
      className={`resource-card ${className}`}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        position: 'relative',
        background: 'rgba(30, 41, 59, 0.9)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(50, 65, 85, 0.6)',
        borderRadius: '24px',
        overflow: 'hidden',
        minHeight: '320px',
        cursor: (onRequest && !isLoading && status !== 'offline') ? 'pointer' : 'default',
        ...motion.div.style
      }}
    >
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ 
          scale: 1, 
          rotate: 0,
          background: config.gradient
        }}
        transition={{ 
          scale: { duration: 1, ease: 'easeOut' }, 
          rotate: { duration: 1.5 }
        }}
        style={{
          opacity: 0.07,
          filter: 'blur(80px)',
          zIndex: 0
        }}
      />

      {/* Header Section */}
      <div style={{ 
        padding: '2.25rem 2rem 1.75rem', 
        borderBottom: '1px solid rgba(50, 65, 85, 0.3)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'space-between', 
          gap: '1.5rem'
        }}>
          {/* Icon & Info */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '1.25rem', 
            flex: 1,
            minWidth: 0
          }}>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              style={{
                padding: '1rem',
                background: config.gradient,
                borderRadius: '20px',
                boxShadow: `0 12px 32px ${config.glow}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ResourceIcon style={{ 
                width: '28px', 
                height: '28px', 
                color: 'white' 
              }} />
            </motion.div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '800', 
                color: '#f8fafc',
                margin: 0,
                marginBottom: '0.5rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {type}
              </h3>
              
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.375rem 0.875rem',
                  background: statusConfig.bg,
                  border: `1px solid ${statusConfig.color}40`,
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: statusConfig.color,
                  backdropFilter: 'blur(12px)'
                }}
              >
                {statusConfig.text}
              </motion.div>
            </div>
          </div>

          {/* Quantity */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              textAlign: 'right',
              flexShrink: 0
            }}
          >
            <div style={{ 
              fontSize: '2.75rem', 
              fontWeight: '900', 
              background: config.gradient,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: '1'
            }}>
              {quantity}
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: 'rgba(148, 163, 184, 0.8)', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              mt: '0.25rem'
            }}>
              Available
            </div>
          </motion.div>
        </div>
      </div>

      {/* Details Section */}
      <div style={{ 
        padding: '2.25rem', 
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ marginBottom: '2.5rem' }}>
          {/* Location */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              padding: '1.25rem',
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(12px)',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.08)',
              marginBottom: '1.25rem'
            }}
          >
            <MapPin style={{ 
              width: '20px', 
              height: '20px', 
              color: 'rgba(148, 163, 184, 0.7)',
              marginTop: '0.125rem',
              flexShrink: 0
            }} />
            <p style={{ 
              margin: 0, 
              color: '#e2e8f0', 
              fontSize: '0.95rem', 
              lineHeight: '1.6'
            }}>
              {location}
            </p>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              padding: '1.25rem',
              background: 'rgba(59, 130, 246, 0.08)',
              backdropFilter: 'blur(12px)',
              borderRadius: '20px',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}
          >
            <Phone style={{ 
              width: '20px', 
              height: '20px', 
              color: 'rgba(59, 130, 246, 0.8)',
              marginTop: '0.125rem',
              flexShrink: 0
            }} />
            <p style={{ 
              margin: 0, 
              color: '#f8fafc', 
              fontSize: '1rem', 
              fontWeight: '600',
              lineHeight: '1.6'
            }}>
              {contact}
            </p>
          </motion.div>
        </div>

        {/* Request Button */}
        <motion.button
          onClick={onRequest}
          disabled={isLoading || status === 'offline'}
          whileHover={!isLoading && status !== 'offline' ? { scale: 1.02 } : {}}
          whileTap={!isLoading && status !== 'offline' ? { scale: 0.98 } : {}}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '1.25rem 2rem',
            borderRadius: '16px',
            fontWeight: '700',
            fontSize: '0.95rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            border: 'none',
            cursor: (isLoading || status === 'offline') ? 'not-allowed' : 'pointer',
            background: isLoading || status === 'offline' 
              ? 'rgba(148, 163, 184, 0.3)' 
              : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            boxShadow: isLoading || status === 'offline' 
              ? 'none' 
              : '0 12px 32px rgba(239, 68, 68, 0.4)',
            backdropFilter: 'blur(16px)',
            position: 'relative',
            overflow: 'hidden'
          }}
          aria-label={`Request ${quantity} ${type} resources from ${location}`}
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%'
                }}
              />
              Allocating...
            </>
            ) : (
            <>
              🚀 Request Allocation
            </>
          )}
        </motion.button>
      </div>

      {/* Decorative glow */}
      <motion.div
        className="absolute -top-4 -right-4 w-24 h-24"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.15 }}
        style={{
          background: config.gradient,
          borderRadius: '50%',
          filter: 'blur(60px)',
          zIndex: 0
        }}
      />
    </motion.div>
  );
};

export default ResourceCard;
