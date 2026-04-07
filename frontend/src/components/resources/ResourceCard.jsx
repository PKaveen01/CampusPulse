import React, { useState } from 'react';
import { 
  Building2, Users, MapPin, Edit, Trash2, Power, PowerOff, Calendar, 
  Wind, Tv, Wifi, Plug, Smartphone, Clock, AlertTriangle, CheckCircle, 
  BookOpen, Wrench, History, BarChart3, Eye, Star, TrendingUp 
} from 'lucide-react';

const ResourceCard = ({ resource, onEdit, onDelete, onStatusToggle, onViewDetails, onViewHistory, isAdmin }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Status configurations
  const statusConfig = {
    ACTIVE: { 
      bg: 'rgba(52,211,153,0.15)', 
      color: '#34d399', 
      label: 'Active', 
      icon: <CheckCircle size={12} />,
      description: 'Available for booking'
    },
    MAINTENANCE: { 
      bg: 'rgba(251,191,36,0.15)', 
      color: '#fbbf24', 
      label: 'Maintenance', 
      icon: <Wrench size={12} />,
      description: 'Under repair'
    },
    OUT_OF_SERVICE: { 
      bg: 'rgba(248,113,113,0.15)', 
      color: '#f87171', 
      label: 'Out of Service', 
      icon: <AlertTriangle size={12} />,
      description: 'Temporarily unavailable'
    },
    ACADEMIC_RESERVED: { 
      bg: 'rgba(79,142,247,0.15)', 
      color: '#4f8ef7', 
      label: 'Academic Reserve', 
      icon: <BookOpen size={12} />,
      description: 'Reserved for academic use'
    },
    DECOMMISSIONED: { 
      bg: 'rgba(107,114,128,0.15)', 
      color: '#6b7280', 
      label: 'Decommissioned', 
      icon: <AlertTriangle size={12} />,
      description: 'No longer in service'
    }
  };
  
  const style = statusConfig[resource.status] || statusConfig.ACTIVE;

  // Amenities with icons and categories
  const amenities = [];
  if (resource.isAirConditioned) amenities.push({ name: 'AC', icon: <Wind size={12} />, category: 'comfort' });
  if (resource.hasProjector) amenities.push({ name: 'Projector', icon: <Tv size={12} />, category: 'av' });
  if (resource.hasSmartBoard) amenities.push({ name: 'Smart Board', icon: <Smartphone size={12} />, category: 'av' });
  if (resource.hasWifi) amenities.push({ name: 'WiFi', icon: <Wifi size={12} />, category: 'connectivity' });
  if (resource.hasPowerOutlets) amenities.push({ name: 'Power', icon: <Plug size={12} />, category: 'utility' });

  // Calculate popularity score (mock - can be replaced with real data)
  const popularityScore = resource.totalBookings ? Math.min(Math.floor(resource.totalBookings / 10), 5) : 0;

  return (
    <div 
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius)',
        border: `1px solid ${resource.status === 'MAINTENANCE' ? 'rgba(251,191,36,0.3)' : 'var(--border)'}`,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        position: 'relative',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? 'var(--shadow-glow)' : 'none'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails(resource)}
    >
      {/* Popularity Badge */}
      {popularityScore >= 3 && resource.status === 'ACTIVE' && (
        <div style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 10,
          background: 'linear-gradient(135deg, #f59e0b, #f97316)',
          color: 'white',
          padding: '2px 10px',
          borderRadius: 20,
          fontSize: 10,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          <Star size={10} fill="white" /> Popular
        </div>
      )}

      {/* Maintenance Warning Badge */}
      {resource.status === 'ACTIVE' && resource.totalBookings > 80 && (
        <div style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 10,
          background: 'rgba(251,191,36,0.95)',
          color: '#000',
          padding: '2px 10px',
          borderRadius: 20,
          fontSize: 10,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          <Clock size={10} /> Maintenance Soon
        </div>
      )}

      {/* Image Section */}
      <div style={{
        height: 160,
        background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {resource.imageUrl && !imageError ? (
          <img 
            src={resource.imageUrl} 
            alt={resource.name}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)'
            }}
            onError={() => setImageError(true)}
          />
        ) : (
          <Building2 size={56} style={{ color: 'white', opacity: 0.4 }} />
        )}
        
        {/* Overlay Gradient */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)'
        }} />
        
        {/* Status Badge */}
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 6
        }}>
          <span style={{
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 600,
            background: `${style.bg}cc`,
            color: style.color,
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            {style.icon}
            {style.label}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div style={{ padding: 18 }}>
        {/* Title Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <h3 style={{ 
            fontSize: 16, 
            fontWeight: 600, 
            color: 'var(--text-primary)',
            flex: 1,
            lineHeight: 1.4
          }}>
            {resource.name}
          </h3>
          
          {/* Booking Count Badge */}
          {resource.totalBookings > 0 && (
            <span style={{
              fontSize: 10,
              color: 'var(--text-muted)',
              background: 'rgba(255,255,255,0.08)',
              padding: '2px 8px',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              whiteSpace: 'nowrap'
            }}>
              <TrendingUp size={10} />
              {resource.totalBookings} bookings
            </span>
          )}
        </div>
        
        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13 }}>
            <Users size={14} />
            <span>Capacity: {resource.capacity} people</span>
            {resource.capacity <= 10 && (
              <span style={{
                fontSize: 9,
                background: 'rgba(52,211,153,0.15)',
                color: '#34d399',
                padding: '2px 8px',
                borderRadius: 12,
                fontWeight: 500
              }}>
                Intimate
              </span>
            )}
            {resource.capacity > 50 && (
              <span style={{
                fontSize: 9,
                background: 'rgba(79,142,247,0.15)',
                color: '#4f8ef7',
                padding: '2px 8px',
                borderRadius: 12,
                fontWeight: 500
              }}>
                Large
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13 }}>
            <MapPin size={14} />
            <span>{resource.building ? `${resource.building}, ` : ''}{resource.location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 12 }}>
            <span style={{ 
              padding: '2px 8px', 
              background: 'rgba(79,142,247,0.1)', 
              borderRadius: 12,
              fontSize: 10,
              fontWeight: 500
            }}>
              {resource.resourceType}
            </span>
          </div>
        </div>

        {/* Amenities Section - Simplified & Clean */}
        {amenities.length > 0 && (
          <div style={{
            marginBottom: 18,
            paddingTop: 12,
            borderTop: '1px solid var(--border)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8
          }}>
            {amenities.map((amenity, idx) => (
              <span key={idx} style={{
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 5,
                padding: '4px 10px', 
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 20, 
                fontSize: 11, 
                color: 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(79,142,247,0.15)';
                e.currentTarget.style.color = 'var(--accent)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}>
                {amenity.icon} {amenity.name}
              </span>
            ))}
          </div>
        )}
        
        {/* Action Buttons */}
        {isAdmin ? (
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(resource); }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '8px 12px',
                background: 'rgba(79,142,247,0.1)',
                border: '1px solid rgba(79,142,247,0.2)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--accent)',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(79,142,247,0.2)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(79,142,247,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Edit size={13} /> Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onStatusToggle(resource); }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '8px 12px',
                background: resource.status === 'ACTIVE' 
                  ? 'rgba(248,113,113,0.1)' 
                  : 'rgba(52,211,153,0.1)',
                border: `1px solid ${resource.status === 'ACTIVE' 
                  ? 'rgba(248,113,113,0.2)' 
                  : 'rgba(52,211,153,0.2)'}`,
                borderRadius: 'var(--radius-sm)',
                color: resource.status === 'ACTIVE' ? '#f87171' : '#34d399',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {resource.status === 'ACTIVE' ? <PowerOff size={13} /> : <Power size={13} />}
              {resource.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onViewHistory(resource); }}
              style={{
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 12,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(79,142,247,0.1)';
                e.currentTarget.style.color = 'var(--accent)';
                e.currentTarget.style.borderColor = 'rgba(79,142,247,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
              title="View History"
            >
              <History size={13} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(resource.id); }}
              style={{
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 12,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(248,113,113,0.1)';
                e.currentTarget.style.color = '#f87171';
                e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ) : (
          <button 
            onClick={(e) => { e.stopPropagation(); onViewDetails(resource); }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px',
              background: resource.status === 'ACTIVE' 
                ? 'linear-gradient(135deg, var(--accent), var(--accent-2))'
                : 'rgba(255,255,255,0.05)',
              border: resource.status !== 'ACTIVE' ? '1px solid var(--border)' : 'none',
              borderRadius: 'var(--radius-sm)',
              color: resource.status === 'ACTIVE' ? 'white' : 'var(--text-muted)',
              cursor: resource.status === 'ACTIVE' ? 'pointer' : 'not-allowed',
              fontSize: 13,
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              if (resource.status === 'ACTIVE') {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,142,247,0.3)';
              }
            }}
            onMouseLeave={e => {
              if (resource.status === 'ACTIVE') {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
            disabled={resource.status !== 'ACTIVE'}
          >
            <Calendar size={14} /> 
            {resource.status === 'ACTIVE' ? 'Book Now' : 'Currently Unavailable'}
          </button>
        )}
      </div>

      {/* Quick View Tooltip on Hover (Optional) */}
      {isHovered && isAdmin && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: 16,
          marginBottom: 8,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 12px',
          fontSize: 11,
          color: 'var(--text-muted)',
          whiteSpace: 'nowrap',
          zIndex: 20,
          boxShadow: 'var(--shadow)'
        }}>
          <Eye size={10} style={{ display: 'inline', marginRight: 4 }} />
          Click for details
        </div>
      )}
    </div>
  );
};

export default ResourceCard;