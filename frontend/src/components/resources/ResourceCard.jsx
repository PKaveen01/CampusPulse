import React from 'react';
import { 
  Building2, Users, MapPin, Edit, Trash2, Power, PowerOff, Calendar, 
  Wind, Tv, Wifi, Plug, Smartphone, Clock, AlertTriangle, CheckCircle, 
  BookOpen, Wrench, History, BarChart3 
} from 'lucide-react';

const ResourceCard = ({ resource, onEdit, onDelete, onStatusToggle, onViewDetails, onViewHistory, isAdmin }) => {
  
  // Enhanced status configurations
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
      description: 'Under repair - Technician assigned'
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

  // Smart tagging system for amenities
  const amenities = [];
  if (resource.isAirConditioned) amenities.push({ name: 'AC', icon: <Wind size={12} />, category: 'comfort' });
  if (resource.hasProjector) amenities.push({ name: 'Projector', icon: <Tv size={12} />, category: 'av' });
  if (resource.hasSmartBoard) amenities.push({ name: 'Smart Board', icon: <Smartphone size={12} />, category: 'av' });
  if (resource.hasWifi) amenities.push({ name: 'WiFi', icon: <Wifi size={12} />, category: 'connectivity' });
  if (resource.hasPowerOutlets) amenities.push({ name: 'Power', icon: <Plug size={12} />, category: 'utility' });

  // Calculate usage percentage for predictive maintenance
  const usagePercentage = resource.totalBookings ? (resource.totalBookings / 100) * 100 : 0;
  const needsMaintenanceSoon = usagePercentage > 80;

  return (
    <div 
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius)',
        border: `1px solid ${resource.status === 'MAINTENANCE' ? 'rgba(251,191,36,0.3)' : 'var(--border)'}`,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        position: 'relative'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'var(--accent)';
        e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = resource.status === 'MAINTENANCE' ? 'rgba(251,191,36,0.3)' : 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      onClick={() => onViewDetails(resource)}
    >
      {/* Predictive Maintenance Warning Badge */}
      {needsMaintenanceSoon && resource.status === 'ACTIVE' && (
        <div style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 10,
          background: 'rgba(251,191,36,0.9)',
          color: '#000',
          padding: '2px 8px',
          borderRadius: 20,
          fontSize: 9,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}>
          <Clock size={10} /> Maintenance Soon
        </div>
      )}

      {/* Image Section */}
      <div style={{
        height: 140,
        background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {resource.image_url ? (
          <img 
            src={resource.image_url} 
            alt={resource.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <Building2 size={48} style={{ color: 'white', opacity: 0.5 }} />
        )}
        
        {/* Enhanced Status Badge */}
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 4
        }}>
          <span style={{
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 600,
            background: style.bg,
            color: style.color,
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            {style.icon}
            {style.label}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <h3 style={{ 
            fontSize: 15, 
            fontWeight: 600, 
            color: 'var(--text-primary)',
            flex: 1
          }}>
            {resource.name}
          </h3>
          {/* Usage Counter - shows booking count */}
          {resource.totalBookings > 0 && (
            <span style={{
              fontSize: 10,
              color: 'var(--text-muted)',
              background: 'rgba(255,255,255,0.05)',
              padding: '2px 6px',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 3
            }}>
              <BarChart3 size={10} />
              {resource.totalBookings} bookings
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 12 }}>
            <Users size={14} />
            <span>Capacity: {resource.capacity} people</span>
            {/* Smart capacity suggestion indicator */}
            {resource.capacity <= 10 && (
              <span style={{
                fontSize: 9,
                background: 'rgba(52,211,153,0.15)',
                color: '#34d399',
                padding: '1px 6px',
                borderRadius: 10
              }}>
                Small Group
              </span>
            )}
            {resource.capacity > 50 && (
              <span style={{
                fontSize: 9,
                background: 'rgba(79,142,247,0.15)',
                color: '#4f8ef7',
                padding: '1px 6px',
                borderRadius: 10
              }}>
                Large Venue
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 12 }}>
            <MapPin size={14} />
            <span>{resource.building ? `${resource.building}, ` : ''}{resource.location}</span>
          </div>
        </div>

        {/* Smart Tagging System - Categorized Amenities */}
        {amenities.length > 0 && (
          <div style={{
            marginBottom: 16,
            paddingTop: 8,
            borderTop: '1px solid var(--border)'
          }}>
            {/* Comfort amenities */}
            {amenities.filter(a => a.category === 'comfort').length > 0 && (
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.5px' }}>COMFORT</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {amenities.filter(a => a.category === 'comfort').map((amenity, idx) => (
                    <span key={idx} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '2px 8px', background: 'rgba(96,165,250,0.1)',
                      borderRadius: 12, fontSize: 10, color: '#60a5fa'
                    }}>
                      {amenity.icon} {amenity.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* AV amenities */}
            {amenities.filter(a => a.category === 'av').length > 0 && (
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.5px' }}>AUDIO VISUAL</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {amenities.filter(a => a.category === 'av').map((amenity, idx) => (
                    <span key={idx} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '2px 8px', background: 'rgba(251,191,36,0.1)',
                      borderRadius: 12, fontSize: 10, color: '#fbbf24'
                    }}>
                      {amenity.icon} {amenity.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Connectivity amenities */}
            {amenities.filter(a => a.category === 'connectivity').length > 0 && (
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.5px' }}>CONNECTIVITY</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {amenities.filter(a => a.category === 'connectivity').map((amenity, idx) => (
                    <span key={idx} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '2px 8px', background: 'rgba(52,211,153,0.1)',
                      borderRadius: 12, fontSize: 10, color: '#34d399'
                    }}>
                      {amenity.icon} {amenity.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Admin Actions */}
        {isAdmin ? (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(resource); }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '6px 12px',
                background: 'rgba(79,142,247,0.1)',
                border: '1px solid rgba(79,142,247,0.2)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--accent)',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 500
              }}
            >
              <Edit size={12} /> Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onStatusToggle(resource); }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '6px 12px',
                background: resource.status === 'ACTIVE' 
                  ? 'rgba(248,113,113,0.1)' 
                  : 'rgba(52,211,153,0.1)',
                border: `1px solid ${resource.status === 'ACTIVE' 
                  ? 'rgba(248,113,113,0.2)' 
                  : 'rgba(52,211,153,0.2)'}`,
                borderRadius: 'var(--radius-sm)',
                color: resource.status === 'ACTIVE' ? 'var(--danger)' : 'var(--success)',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 500
              }}
            >
              {resource.status === 'ACTIVE' ? <PowerOff size={12} /> : <Power size={12} />}
              {resource.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onViewHistory(resource); }}
              style={{
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 11
              }}
              title="View Audit Log"
            >
              <History size={12} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(resource.id); }}
              style={{
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 11
              }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        ) : (
          <button 
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '8px',
              background: resource.status === 'ACTIVE' 
                ? 'linear-gradient(135deg, var(--accent), var(--accent-2))'
                : 'rgba(255,255,255,0.05)',
              border: resource.status !== 'ACTIVE' ? '1px solid var(--border)' : 'none',
              borderRadius: 'var(--radius-sm)',
              color: resource.status === 'ACTIVE' ? 'white' : 'var(--text-muted)',
              cursor: resource.status === 'ACTIVE' ? 'pointer' : 'not-allowed',
              fontSize: 12,
              fontWeight: 500
            }}
            disabled={resource.status !== 'ACTIVE'}
          >
            <Calendar size={12} /> 
            {resource.status === 'ACTIVE' ? 'Book Now' : 'Currently Unavailable'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ResourceCard;