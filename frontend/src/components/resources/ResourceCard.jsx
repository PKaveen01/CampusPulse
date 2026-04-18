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
    ACTIVE: { color: '#10b981', label: 'Active', bg: '#10b98115' },
    MAINTENANCE: { color: '#f59e0b', label: 'Maintenance', bg: '#f59e0b15' },
    OUT_OF_SERVICE: { color: '#ef4444', label: 'Out of Service', bg: '#ef444415' }
  };

  const status = statusConfig[resource.status] || statusConfig.ACTIVE;

  const amenities = [];
  if (resource.hasWifi) amenities.push('WiFi');
  if (resource.isAirConditioned) amenities.push('AC');
  if (resource.hasProjector) amenities.push('Projector');

  const fetchTimeSlots = async (date) => {
    setLoadingSlots(true);
    try {
      const response = await fetch(`/api/resources/${resource.id}/available-slots?date=${date}`);
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
        transition: 'transform 0.2s, box-shadow 0.2s',
        position: 'relative'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        setShowDropdown(false); // Close dropdown on mouse leave
      }}
    >
      {/* Image Section */}
      <div 
        style={{ height: '140px', background: '#2a2a3a', position: 'relative', cursor: 'pointer' }}
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            background: '#2a2a3a'
          }}>
            <Building2 size={32} style={{ opacity: 0.3 }} />
          </div>
        )}
        
        {/* Status Badge */}
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          padding: '4px 8px',
          borderRadius: '6px',
          background: status.bg,
          color: status.color,
          fontSize: '11px',
          fontWeight: '600',
          backdropFilter: 'blur(4px)'
        }}>
          {status.label}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        {/* Title - Clickable */}
        <div 
          style={{ cursor: 'pointer' }} 
          onClick={() => onViewDetails(resource)}
        >
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            margin: '0 0 4px 0',
            color: '#fff'
          }}>
            {resource.name}
          </h3>
          
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '12px',
            fontSize: '12px',
            color: '#a0a0b0'
          }}>
            <span>{resource.resourceType}</span>
            <span>•</span>
            <span><Users size={12} style={{ display: 'inline', marginRight: '4px' }} />{resource.capacity}</span>
            <span>•</span>
            <span><MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />{resource.location}</span>
          </div>
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '6px',
            marginBottom: '16px',
            flexWrap: 'wrap'
          }}>
            {amenities.map(amenity => (
              <span key={amenity} style={{
                padding: '2px 8px',
                background: '#2a2a3a',
                borderRadius: '4px',
                fontSize: '10px',
                color: '#c0c0d0'
              }}>
                {amenity}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {isAdmin ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(resource); }}
              style={{
                flex: 1,
                padding: '8px',
                background: '#3b82f6',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <Edit size={14} /> Edit
            </button>
            
            <button
              onClick={(e) => { e.stopPropagation(); onStatusToggle(resource); }}
              style={{
                padding: '8px',
                background: resource.status === 'ACTIVE' ? '#ef4444' : '#10b981',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                minWidth: '90px'
              }}
            >
              {resource.status === 'ACTIVE' ? <PowerOff size={14} /> : <Power size={14} />}
              {resource.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            </button>
            
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(resource.id); }}
              style={{
                padding: '8px',
                background: '#2a2a3a',
                border: 'none',
                borderRadius: '6px',
                color: '#ef4444',
                cursor: 'pointer'
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ) : (
          <>
            {/* Main Action Row */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={(e) => { e.stopPropagation(); onViewDetails(resource); }}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: resource.status === 'ACTIVE' ? '#3b82f6' : '#2a2a3a',
                  border: 'none',
                  borderRadius: '6px',
                  color: resource.status === 'ACTIVE' ? '#fff' : '#a0a0b0',
                  cursor: resource.status === 'ACTIVE' ? 'pointer' : 'not-allowed',
                  fontSize: '13px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
                disabled={resource.status !== 'ACTIVE'}
              >
                <Calendar size={14} />
                {resource.status === 'ACTIVE' ? 'Book Now' : 'Unavailable'}
              </button>

              {/* Dropdown Toggle Button */}
              {resource.status === 'ACTIVE' && (
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setShowDropdown(!showDropdown); 
                  }}
                  style={{
                    padding: '10px',
                    background: '#2a2a3a',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#a0a0b0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    minWidth: '80px',
                    justifyContent: 'center'
                  }}
                >
                  <Clock size={14} />
                  Check
                  {showDropdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}

              {/* Report Issue Button (Icon only) */}
              {resource.status === 'ACTIVE' && (
                <button
                  onClick={(e) => { e.stopPropagation(); onReportIssue?.(resource); }}
                  style={{
                    padding: '10px',
                    background: '#ef444415',
                    border: '1px solid #ef444430',
                    borderRadius: '6px',
                    color: '#ef4444',
                    cursor: 'pointer'
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
                  marginTop: '12px',
                  padding: '12px',
                  background: '#2a2a3a',
                  borderRadius: '8px',
                  border: '1px solid #3a3a4a',
                  animation: 'slideDown 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <label style={{ 
                  fontSize: '12px', 
                  color: '#a0a0b0', 
                  display: 'block', 
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>
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
                    <div style={{
                      fontSize: '11px',
                      color: '#a0a0b0',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Clock size={12} />
                      Available Slots for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>

                    {loadingSlots ? (
                      <div style={{ textAlign: 'center', padding: '12px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          border: '2px solid #3a3a4a',
                          borderTopColor: '#3b82f6',
                          borderRadius: '50%',
                          margin: '0 auto',
                          animation: 'spin 1s linear infinite'
                        }} />
                      </div>
                    ) : timeSlots.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        padding: '12px',
                        color: '#a0a0b0',
                        fontSize: '11px',
                        background: '#1e1e2f',
                        borderRadius: '6px'
                      }}>
                        No available slots
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {timeSlots.slice(0, 4).map((slot, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: '4px 8px',
                              background: '#10b98115',
                              borderRadius: '4px',
                              fontSize: '11px',
                              color: '#10b981',
                              border: '1px solid #10b98130'
                            }}
                          >
                            {slot.start} - {slot.end}
                          </span>
                        ))}
                        {timeSlots.length > 4 && (
                          <span style={{
                            padding: '4px 8px',
                            background: '#2a2a3a',
                            borderRadius: '4px',
                            fontSize: '11px',
                            color: '#a0a0b0'
                          }}>
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
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ResourceCard;