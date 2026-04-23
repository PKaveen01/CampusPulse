import React, { useState } from 'react';
import {
  Building2, MapPin, Edit, Trash2, Power, PowerOff, Calendar,
  Wifi, Users, Clock, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';

const ResourceCard = ({
  resource,
  onEdit,
  onDelete,
  onStatusToggle,
  onViewDetails,
  onReportIssue,
  isAdmin
}) => {
  const [imageError, setImageError] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const statusConfig = {
    ACTIVE: { color: '#10b981', label: 'Active', bg: '#10b98115', accent: '#10b981' },
    MAINTENANCE: { color: '#f59e0b', label: 'Maintenance', bg: '#f59e0b15', accent: '#f59e0b' },
    OUT_OF_SERVICE: { color: '#ef4444', label: 'Out of Service', bg: '#ef444415', accent: '#ef4444' }
  };

  const status = statusConfig[resource.status] || statusConfig.ACTIVE;

  const amenities = [];
  if (resource.hasWifi) amenities.push('WiFi');
  if (resource.isAirConditioned) amenities.push('AC');
  if (resource.hasProjector) amenities.push('Projector');

  const fetchTimeSlots = async (date) => {
    setLoadingSlots(true);
    try {
      const response = await fetch(`/api/resources/${resource.id}/available-slots?date=${date}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch slots: ${response.status}`);
      }

      const data = await response.json();
      setTimeSlots(data.availableSlots || []);
    } catch (error) {
      console.error('Failed to fetch slots:', error);
      setTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    if (date) await fetchTimeSlots(date);
    else setTimeSlots([]);
  };

  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  return (
    <div
      style={{
        background: '#1e1e2f',
        borderRadius: '12px',
        border: `1px solid ${resource.status === 'MAINTENANCE' ? '#f59e0b30' : '#2a2a3a'}`,
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        position: 'relative',
        boxShadow: '0 6px 16px rgba(0,0,0,0.08)'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 14px 28px rgba(0,0,0,0.18)';
        e.currentTarget.style.borderColor = '#3a3a4a';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
        e.currentTarget.style.borderColor = resource.status === 'MAINTENANCE' ? '#f59e0b30' : '#2a2a3a';
        setShowDropdown(false);
      }}
    >
      {/* Left Status Accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '3px',
          background: status.accent,
          zIndex: 2
        }}
      />

      {/* Image Section */}
      <div
        style={{
          height: '148px',
          background: '#2a2a3a',
          position: 'relative',
          cursor: 'pointer'
        }}
        onClick={() => onViewDetails(resource)}
      >
        {!imageError ? (
          <img
            src={resource.imageUrl || '/api/placeholder/400/140'}
            alt={resource.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              height: '100%',
              background: '#2a2a3a',
              color: '#8b8ba0'
            }}
          >
            <Building2 size={30} style={{ opacity: 0.35 }} />
            <span style={{ fontSize: '11px', fontWeight: '500', opacity: 0.8 }}>
              No preview
            </span>
          </div>
        )}

        {/* Soft Image Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(14,18,28,0.55), rgba(14,18,28,0.10), transparent)',
            pointerEvents: 'none'
          }}
        />

        {/* Status Badge */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '5px 9px',
            borderRadius: '7px',
            background: status.bg,
            color: status.color,
            fontSize: '11px',
            fontWeight: '600',
            backdropFilter: 'blur(6px)',
            border: `1px solid ${status.color}25`
          }}
        >
          {status.label}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '18px 16px 16px 16px' }}>
        {/* Title - Clickable */}
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => onViewDetails(resource)}
        >
          <h3
            style={{
              fontSize: '16px',
              fontWeight: '600',
              margin: '0 0 6px 0',
              color: '#fff',
              lineHeight: 1.35
            }}
          >
            {resource.name}
          </h3>

          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '14px',
              fontSize: '12px',
              color: '#99a0b3',
              flexWrap: 'wrap',
              lineHeight: 1.5
            }}
          >
            <span>{resource.resourceType}</span>
            <span>•</span>
            <span>
              <Users size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              {resource.capacity}
            </span>
            <span>•</span>
            <span>
              <MapPin size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              {resource.location}
            </span>
          </div>
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '18px',
              flexWrap: 'wrap'
            }}
          >
            {amenities.map(amenity => (
              <span
                key={amenity}
                style={{
                  minHeight: '24px',
                  padding: '4px 10px',
                  background: '#262638',
                  border: '1px solid #37374b',
                  borderRadius: '999px',
                  fontSize: '10px',
                  color: '#c7cada',
                  fontWeight: '500',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  letterSpacing: '0.01em'
                }}
              >
                {amenity}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {isAdmin ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 44px',
              gap: '8px',
              alignItems: 'stretch'
            }}
          >
            {/* Edit */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(resource);
              }}
              style={{
                height: '38px',
                padding: '0 12px',
                background: '#334155',
                border: '1px solid #475569',
                borderRadius: '6px',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#3f4d63';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#334155';
              }}
            >
              <Edit size={14} />
              Edit
            </button>

            {/* Activate / Deactivate */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusToggle(resource);
              }}
              style={{
                height: '38px',
                padding: '0 12px',
                background: '#2a2a3a',
                border: '1px solid #3a3a4a',
                borderRadius: '6px',
                color: '#d1d5db',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#313145';
                e.currentTarget.style.borderColor = resource.status === 'ACTIVE' ? '#ef444460' : '#10b98160';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#2a2a3a';
                e.currentTarget.style.borderColor = '#3a3a4a';
              }}
            >
              {resource.status === 'ACTIVE' ? <PowerOff size={14} /> : <Power size={14} />}
              {resource.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            </button>

            {/* Delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(resource.id);
              }}
              style={{
                height: '38px',
                width: '44px',
                padding: '0',
                background: '#2a2a3a',
                border: '1px solid #ef444430',
                borderRadius: '6px',
                color: '#ef4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#ef444412';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#2a2a3a';
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ) : (
          <>
            {/* Main Action Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: resource.status === 'ACTIVE' ? '1.2fr 1fr 44px' : '1fr',
                gap: '8px',
                alignItems: 'stretch'
              }}
            >
              {/* Book Now */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(resource);
                }}
                style={{
                  height: '40px',
                  padding: '0 14px',
                  background: resource.status === 'ACTIVE' ? '#334155' : '#2a2a3a',
                  border: resource.status === 'ACTIVE' ? '1px solid #475569' : '1px solid #3a3a4a',
                  borderRadius: '6px',
                  color: resource.status === 'ACTIVE' ? '#ffffff' : '#a0a0b0',
                  cursor: resource.status === 'ACTIVE' ? 'pointer' : 'not-allowed',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  if (resource.status === 'ACTIVE') {
                    e.currentTarget.style.background = '#3f4d63';
                  }
                }}
                onMouseLeave={e => {
                  if (resource.status === 'ACTIVE') {
                    e.currentTarget.style.background = '#334155';
                  }
                }}
                disabled={resource.status !== 'ACTIVE'}
              >
                <Calendar size={14} />
                {resource.status === 'ACTIVE' ? 'Book Now' : 'Unavailable'}
              </button>

              {/* Availability */}
              {resource.status === 'ACTIVE' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(!showDropdown);
                  }}
                  style={{
                    height: '40px',
                    padding: '0 12px',
                    background: '#2a2a3a',
                    border: '1px solid #3a3a4a',
                    borderRadius: '6px',
                    color: '#d1d5db',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#313145';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#2a2a3a';
                  }}
                >
                  <Clock size={14} />
                  Availability
                  {showDropdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}

              {/* Report Issue */}
              {resource.status === 'ACTIVE' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReportIssue?.(resource);
                  }}
                  style={{
                    height: '40px',
                    width: '44px',
                    padding: '0',
                    background: '#2a2a3a',
                    border: '1px solid #ef444430',
                    borderRadius: '6px',
                    color: '#ef4444',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#ef444412';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#2a2a3a';
                  }}
                  title="Report Issue"
                >
                  <AlertTriangle size={14} />
                </button>
              )}
            </div>

            {/* Dropdown Content - Availability Checker */}
            {showDropdown && resource.status === 'ACTIVE' && (
              <div
                style={{
                  marginTop: '14px',
                  padding: '14px',
                  background: '#2a2a3a',
                  borderRadius: '8px',
                  border: '1px solid #3a3a4a',
                  animation: 'slideDown 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <label
                  style={{
                    fontSize: '12px',
                    color: '#a0a0b0',
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}
                >
                  Select Date
                </label>

                <select
                  value={selectedDate}
                  onChange={handleDateChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: '#1e1e2f',
                    border: '1px solid #3a3a4a',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    marginBottom: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Choose a date</option>
                  {getNextDays().map(date => (
                    <option key={date.toISOString()} value={date.toISOString().split('T')[0]}>
                      {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </option>
                  ))}
                </select>

                {selectedDate && (
                  <div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#a0a0b0',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Clock size={12} />
                      Available Slots for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>

                    {loadingSlots ? (
                      <div style={{ textAlign: 'center', padding: '14px' }}>
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            border: '2px solid #3a3a4a',
                            borderTopColor: '#64748b',
                            borderRadius: '50%',
                            margin: '0 auto',
                            animation: 'spin 1s linear infinite'
                          }}
                        />
                      </div>
                    ) : timeSlots.length === 0 ? (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '16px 12px',
                          color: '#9aa0b2',
                          fontSize: '11px',
                          background: '#1e1e2f',
                          borderRadius: '6px',
                          border: '1px solid #343447',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Clock size={14} style={{ opacity: 0.55 }} />
                        <span style={{ fontWeight: '600', color: '#b4b9c8' }}>No available slots</span>
                        <span style={{ fontSize: '10px', color: '#8b91a3' }}>Try another date</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {timeSlots.slice(0, 4).map((slot, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: '5px 8px',
                              background: '#10b98115',
                              borderRadius: '5px',
                              fontSize: '11px',
                              color: '#10b981',
                              border: '1px solid #10b98130',
                              fontWeight: '500'
                            }}
                          >
                            {slot.start} - {slot.end}
                          </span>
                        ))}
                        {timeSlots.length > 4 && (
                          <span
                            style={{
                              padding: '5px 8px',
                              background: '#1e1e2f',
                              borderRadius: '5px',
                              fontSize: '11px',
                              color: '#a0a0b0',
                              border: '1px solid #3a3a4a'
                            }}
                          >
                            +{timeSlots.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default ResourceCard;