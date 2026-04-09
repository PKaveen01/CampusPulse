import React, { useState } from 'react';
import { 
  Building2, Users, MapPin, Edit, Trash2, Power, PowerOff, Calendar, 
  Wind, Tv, Wifi, Plug, Smartphone, Clock, AlertTriangle, CheckCircle, 
  BookOpen, Wrench, History, BarChart3, Eye, Star, TrendingUp, X 
} from 'lucide-react';

const ResourceCard = ({ resource, onEdit, onDelete, onStatusToggle, onViewDetails, onViewHistory, isAdmin }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Availability state
  const [selectedDate, setSelectedDate] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showSlotPicker, setShowSlotPicker] = useState(false);
  
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

  // Calculate popularity score
  const popularityScore = resource.totalBookings ? Math.min(Math.floor(resource.totalBookings / 10), 5) : 0;

  const amenityCount = amenities.length;
  const hasDescription = resource.description && resource.description.trim().length > 0;
  const shortDescription = hasDescription
    ? resource.description.length > 110
      ? `${resource.description.substring(0, 110)}...`
      : resource.description
    : '';

  const resourceLabel = resource.resourceType || 'Resource';
  const capacityValue = Number(resource.capacity || 0);

  const capacityTier =
    capacityValue <= 10
      ? { label: 'Intimate', bg: 'rgba(52,211,153,0.15)', color: '#34d399' }
      : capacityValue > 50
      ? { label: 'Large', bg: 'rgba(79,142,247,0.15)', color: '#4f8ef7' }
      : { label: 'Standard', bg: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' };

  const utilizationBadge =
    resource.totalBookings > 80
      ? { label: 'High Demand', bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' }
      : resource.totalBookings > 30
      ? { label: 'Frequently Used', bg: 'rgba(79,142,247,0.15)', color: '#4f8ef7' }
      : null;

  const fallbackInitial = resource.name ? resource.name.charAt(0).toUpperCase() : 'R';

  // Get next 7 days for date selection
  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // Fetch available time slots
  const fetchTimeSlots = async (date) => {
    setLoadingSlots(true);
    try {
      const response = await fetch(`/api/resources/${resource.id}/available-slots?date=${date}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await response.json();
      setTimeSlots(data.availableSlots || []);
    } catch (error) {
      console.error('Failed to fetch time slots:', error);
      setTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    if (date) {
      fetchTimeSlots(date);
    } else {
      setTimeSlots([]);
    }
  };

  const toggleSlotPicker = () => {
    setShowSlotPicker(!showSlotPicker);
    if (!showSlotPicker) {
      setSelectedDate('');
      setTimeSlots([]);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

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
      onClick={() => !showSlotPicker && onViewDetails(resource)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!showSlotPicker) onViewDetails(resource);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${resource.name}`}
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
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <Building2 size={56} style={{ opacity: 0.35, marginBottom: 6 }} />
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              backdropFilter: 'blur(4px)'
            }}>
              {fallbackInitial}
            </div>
          </div>
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

          {utilizationBadge && (
            <span style={{
              padding: '4px 10px',
              borderRadius: 20,
              fontSize: 10,
              fontWeight: 600,
              background: utilizationBadge.bg,
              color: utilizationBadge.color,
              backdropFilter: 'blur(8px)'
            }}>
              {utilizationBadge.label}
            </span>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div style={{ padding: 18 }}>
        {/* Title Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ 
              fontSize: 16, 
              fontWeight: 600, 
              color: 'var(--text-primary)',
              lineHeight: 1.4,
              marginBottom: 4
            }}>
              {resource.name}
            </h3>

            <div style={{
              fontSize: 11,
              color: style.color,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: style.color,
                display: 'inline-block'
              }} />
              {style.description}
            </div>
          </div>
          
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13, flexWrap: 'wrap' }}>
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

            {resource.capacity > 10 && resource.capacity <= 50 && (
              <span style={{
                fontSize: 9,
                background: capacityTier.bg,
                color: capacityTier.color,
                padding: '2px 8px',
                borderRadius: 12,
                fontWeight: 500
              }}>
                {capacityTier.label}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13, flexWrap: 'wrap' }}>
            <MapPin size={14} />
            <span>{resource.building ? `${resource.building}, ` : ''}{resource.location}</span>

            {resource.floor && (
              <span style={{
                fontSize: 9,
                background: 'rgba(255,255,255,0.08)',
                color: 'var(--text-secondary)',
                padding: '2px 8px',
                borderRadius: 12,
                fontWeight: 500
              }}>
                {resource.floor}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 12, flexWrap: 'wrap' }}>
            <span style={{ 
              padding: '2px 8px', 
              background: 'rgba(79,142,247,0.1)', 
              borderRadius: 12,
              fontSize: 10,
              fontWeight: 500
            }}>
              {resource.resourceType}
            </span>

            {amenityCount > 0 && (
              <span style={{ 
                padding: '2px 8px', 
                background: 'rgba(52,211,153,0.1)', 
                borderRadius: 12,
                fontSize: 10,
                fontWeight: 500,
                color: '#34d399'
              }}>
                {amenityCount} amenit{amenityCount > 1 ? 'ies' : 'y'}
              </span>
            )}
          </div>
        </div>

        {/* Description preview */}
        {hasDescription && (
          <div style={{
            marginBottom: 16,
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px dashed var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 12,
            color: 'var(--text-secondary)',
            lineHeight: 1.5
          }}>
            {shortDescription}
          </div>
        )}

        {/* Amenities Section */}
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
        
        {/* Resource insights row */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 14
        }}>
          <span style={{
            padding: '4px 8px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 10,
            fontSize: 10,
            color: 'var(--text-muted)'
          }}>
            Category: {resourceLabel}
          </span>

          <span style={{
            padding: '4px 8px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 10,
            fontSize: 10,
            color: 'var(--text-muted)'
          }}>
            {resource.totalBookings > 0 ? 'In active circulation' : 'Low recent usage'}
          </span>
        </div>

        {/* ========== NEW: AVAILABILITY TIME SLOTS SECTION ========== */}
        {resource.status === 'ACTIVE' && !isAdmin && (
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSlotPicker();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px',
                background: 'rgba(79,142,247,0.1)',
                border: '1px solid rgba(79,142,247,0.2)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--accent)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(79,142,247,0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(79,142,247,0.1)';
              }}
            >
              <Clock size={14} />
              {showSlotPicker ? 'Hide Availability' : 'Check Availability'}
            </button>

            {showSlotPicker && (
              <div style={{
                marginTop: 12,
                padding: '12px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)'
              }} onClick={(e) => e.stopPropagation()}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                    Select Date
                  </label>
                  <select
                    value={selectedDate}
                    onChange={handleDateChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: 13
                    }}
                  >
                    <option value="">Choose a date</option>
                    {getNextDays().map(date => (
                      <option key={date.toISOString()} value={date.toISOString().split('T')[0]}>
                        {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedDate && (
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                      Available Time Slots for {formatDate(selectedDate)}
                    </div>
                    {loadingSlots ? (
                      <div style={{ textAlign: 'center', padding: '16px' }}>
                        <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
                      </div>
                    ) : timeSlots.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: 12 }}>
                        No available slots for this date
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {timeSlots.slice(0, 6).map((slot, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: '6px 12px',
                              background: 'rgba(16,185,129,0.1)',
                              borderRadius: '20px',
                              fontSize: 11,
                              color: '#10b981',
                              border: '1px solid rgba(16,185,129,0.2)'
                            }}
                          >
                            {slot.start} - {slot.end}
                          </span>
                        ))}
                        {timeSlots.length > 6 && (
                          <span style={{
                            padding: '6px 12px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '20px',
                            fontSize: 11,
                            color: 'var(--text-muted)'
                          }}>
                            +{timeSlots.length - 6} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
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
              onClick={(e) => { e.stopPropagation(); onViewHistory && onViewHistory(resource); }}
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

      {/* Quick View Tooltip */}
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

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ResourceCard;