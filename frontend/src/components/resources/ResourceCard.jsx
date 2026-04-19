import React, { useState } from 'react';
import {
  Building2, Users, MapPin, Edit, Trash2, Power, PowerOff, Calendar,
  Wind, Tv, Wifi, Plug, Smartphone, Clock, AlertTriangle, CheckCircle,
  BookOpen, Wrench, History, Eye, Star, TrendingUp, Image as ImageIcon,
  ShieldCheck, Sparkles, BadgeCheck, Activity, Layers3, ChevronRight
} from 'lucide-react';

const ResourceCard = ({
  resource,
  onEdit,
  onDelete,
  onStatusToggle,
  onViewDetails,
  onViewHistory,
  onReportIssue,
  isAdmin
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
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

  // Check if image URL is valid and from a real source
  const hasValidImageUrl =
    resource.imageUrl &&
    resource.imageUrl.trim() !== '' &&
    !resource.imageUrl.includes('placeholder') &&
    !imageError;

  // Get image URL - use the one from resource or fallback to unsplash
  const getImageUrl = () => {
    if (hasValidImageUrl) {
      return resource.imageUrl;
    }

    const fallbackImages = {
      'Lecture Hall': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400',
      'Meeting Room': 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=400',
      'Laboratory': 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=400',
      'Computer Lab': 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=400',
      'Study Room': 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400',
      'Auditorium': 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400',
      'Equipment': 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=400'
    };

    return fallbackImages[resource.resourceType] || 'https://images.unsplash.com/photo-1562774053-701939374585?w=400';
  };

  const imageUrl = getImageUrl();

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

  const totalInsights = [
    {
      icon: <Layers3 size={12} />,
      label: resourceLabel
    },
    {
      icon: <Users size={12} />,
      label: `${resource.capacity || 0} seats`
    },
    {
      icon: <Activity size={12} />,
      label: resource.totalBookings > 0 ? `${resource.totalBookings} bookings` : 'New / low usage'
    }
  ];

  const imageSourceLabel = hasValidImageUrl ? 'Uploaded image' : 'Smart fallback image';

  return (
    <div
      style={{
        background: isHovered
          ? 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)), var(--bg-card)'
          : 'var(--bg-card)',
        borderRadius: 'var(--radius)',
        border: `1px solid ${resource.status === 'MAINTENANCE'
          ? 'rgba(251,191,36,0.3)'
          : isHovered
            ? 'rgba(79,142,247,0.28)'
            : 'var(--border)'}`,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        position: 'relative',
        transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: isHovered
          ? '0 18px 40px rgba(0,0,0,0.18), 0 0 0 1px rgba(79,142,247,0.06)'
          : '0 6px 20px rgba(0,0,0,0.06)',
        backdropFilter: 'blur(10px)'
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
      {/* Left Accent Border */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background:
            resource.status === 'ACTIVE'
              ? 'linear-gradient(180deg, #34d399, #10b981)'
              : resource.status === 'MAINTENANCE'
                ? 'linear-gradient(180deg, #fbbf24, #f59e0b)'
                : resource.status === 'OUT_OF_SERVICE'
                  ? 'linear-gradient(180deg, #f87171, #ef4444)'
                  : resource.status === 'ACADEMIC_RESERVED'
                    ? 'linear-gradient(180deg, #60a5fa, #4f46e5)'
                    : 'linear-gradient(180deg, #9ca3af, #6b7280)',
          opacity: 0.9,
          zIndex: 3
        }}
      />

      {/* Popularity Badge */}
      {popularityScore >= 3 && resource.status === 'ACTIVE' && (
        <div style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 10,
          background: 'linear-gradient(135deg, #f59e0b, #f97316)',
          color: 'white',
          padding: '3px 10px',
          borderRadius: 20,
          fontSize: 10,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          boxShadow: '0 8px 16px rgba(245,158,11,0.25)'
        }}>
          <Star size={10} fill="white" /> Popular
        </div>
      )}

      {/* Maintenance Warning Badge */}
      {resource.status === 'ACTIVE' && resource.totalBookings > 80 && (
        <div style={{
          position: 'absolute',
          top: popularityScore >= 3 ? 42 : 12,
          left: 12,
          zIndex: 10,
          background: 'rgba(251,191,36,0.95)',
          color: '#111827',
          padding: '3px 10px',
          borderRadius: 20,
          fontSize: 10,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          boxShadow: '0 8px 16px rgba(251,191,36,0.24)'
        }}>
          <Clock size={10} /> Maintenance Soon
        </div>
      )}

      {/* Image Section */}
      <div style={{
        height: 172,
        background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {/* Image loading overlay */}
        {imageLoading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(0,0,0,0.22), rgba(0,0,0,0.35))',
            zIndex: 2
          }}>
            <div style={{
              width: 30,
              height: 30,
              border: '2px solid rgba(255,255,255,0.28)',
              borderTopColor: '#ffffff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        )}

        <img
          src={imageUrl}
          alt={resource.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.35s ease, opacity 0.3s ease, filter 0.3s ease',
            transform: isHovered ? 'scale(1.06)' : 'scale(1)',
            opacity: imageLoading ? 0 : 1,
            filter: isHovered ? 'saturate(1.08)' : 'saturate(1)'
          }}
          onLoad={() => setImageLoading(false)}
          onError={(e) => {
            setImageLoading(false);
            setImageError(true);

            const fallbackMap = {
              'Lecture Hall': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400',
              'Meeting Room': 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=400',
              'Laboratory': 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=400',
              'Computer Lab': 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=400',
              'Study Room': 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400',
              'Auditorium': 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400'
            };

            if (fallbackMap[resource.resourceType] && e.target.src !== fallbackMap[resource.resourceType]) {
              e.target.src = fallbackMap[resource.resourceType];
              setImageError(false);
            } else {
              e.target.style.display = 'none';
              e.target.parentElement.style.background = 'linear-gradient(135deg, var(--accent), var(--accent-2))';
            }
          }}
        />

        {/* Fallback Content */}
        {(!hasValidImageUrl && !imageLoading) && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))'
          }}>
            <Building2 size={54} style={{ opacity: 0.25, marginBottom: 8 }} />
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              backdropFilter: 'blur(6px)',
              marginBottom: 8
            }}>
              {fallbackInitial}
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              fontWeight: 600,
              padding: '5px 10px',
              borderRadius: 20,
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(6px)'
            }}>
              <ImageIcon size={12} />
              Preview unavailable
            </div>
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(15,23,42,0.62), rgba(15,23,42,0.12) 45%, transparent 75%)',
          pointerEvents: 'none'
        }} />

        {/* Bottom image labels */}
        <div style={{
          position: 'absolute',
          left: 14,
          bottom: 12,
          right: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          zIndex: 5
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 10px',
            borderRadius: 20,
            background: 'rgba(15,23,42,0.38)',
            backdropFilter: 'blur(8px)',
            color: 'white',
            fontSize: 10,
            fontWeight: 600
          }}>
            <ShieldCheck size={11} />
            {imageSourceLabel}
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 10px',
            borderRadius: 20,
            background: 'rgba(15,23,42,0.38)',
            backdropFilter: 'blur(8px)',
            color: 'white',
            fontSize: 10,
            fontWeight: 600
          }}>
            <Sparkles size={11} />
            {resource.resourceType || 'Space'}
          </div>
        </div>

        {/* Status and utilization */}
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 6,
          zIndex: 5
        }}>
          <span style={{
            padding: '5px 12px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            background: `${style.bg}dd`,
            color: style.color,
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
          }}>
            {style.icon}
            {style.label}
          </span>

          {utilizationBadge && (
            <span style={{
              padding: '4px 10px',
              borderRadius: 20,
              fontSize: 10,
              fontWeight: 700,
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
        {/* Top summary chips */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 14
        }}>
          {totalInsights.map((item, idx) => (
            <span
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 999,
                color: 'var(--text-secondary)',
                fontSize: 11,
                fontWeight: 500
              }}
            >
              {item.icon}
              {item.label}
            </span>
          ))}
        </div>

        {/* Title Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: 17,
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.35,
              marginBottom: 5,
              letterSpacing: '-0.01em'
            }}>
              {resource.name}
            </h3>

            <div style={{
              fontSize: 11,
              color: style.color,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 500
            }}>
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: style.color,
                display: 'inline-block',
                boxShadow: `0 0 0 4px ${style.bg}`
              }} />
              {style.description}
            </div>
          </div>

          {resource.totalBookings > 0 && (
            <span style={{
              fontSize: 10,
              color: 'var(--text-muted)',
              background: 'rgba(255,255,255,0.08)',
              padding: '4px 8px',
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              whiteSpace: 'nowrap',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <TrendingUp size={10} />
              {resource.totalBookings} bookings
            </span>
          )}
        </div>

        {/* Detail blocks */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 10,
          marginBottom: 16
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--text-secondary)',
            fontSize: 13,
            flexWrap: 'wrap',
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(255,255,255,0.04)'
          }}>
            <Users size={14} />
            <span>Capacity: {resource.capacity} people</span>

            {resource.capacity <= 10 && (
              <span style={{
                fontSize: 9,
                background: 'rgba(52,211,153,0.15)',
                color: '#34d399',
                padding: '3px 8px',
                borderRadius: 12,
                fontWeight: 600
              }}>
                Intimate
              </span>
            )}

            {resource.capacity > 50 && (
              <span style={{
                fontSize: 9,
                background: 'rgba(79,142,247,0.15)',
                color: '#4f8ef7',
                padding: '3px 8px',
                borderRadius: 12,
                fontWeight: 600
              }}>
                Large
              </span>
            )}

            {resource.capacity > 10 && resource.capacity <= 50 && (
              <span style={{
                fontSize: 9,
                background: capacityTier.bg,
                color: capacityTier.color,
                padding: '3px 8px',
                borderRadius: 12,
                fontWeight: 600
              }}>
                {capacityTier.label}
              </span>
            )}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--text-secondary)',
            fontSize: 13,
            flexWrap: 'wrap',
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(255,255,255,0.04)'
          }}>
            <MapPin size={14} />
            <span>{resource.building ? `${resource.building}, ` : ''}{resource.location}</span>

            {resource.floor && (
              <span style={{
                fontSize: 9,
                background: 'rgba(255,255,255,0.08)',
                color: 'var(--text-secondary)',
                padding: '3px 8px',
                borderRadius: 12,
                fontWeight: 600
              }}>
                {resource.floor}
              </span>
            )}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--text-secondary)',
            fontSize: 12,
            flexWrap: 'wrap'
          }}>
            <span style={{
              padding: '4px 10px',
              background: 'rgba(79,142,247,0.1)',
              border: '1px solid rgba(79,142,247,0.14)',
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--accent)'
            }}>
              {resource.resourceType}
            </span>

            {amenityCount > 0 && (
              <span style={{
                padding: '4px 10px',
                background: 'rgba(52,211,153,0.1)',
                border: '1px solid rgba(52,211,153,0.16)',
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 700,
                color: '#34d399'
              }}>
                {amenityCount} amenit{amenityCount > 1 ? 'ies' : 'y'}
              </span>
            )}

            {resource.status === 'ACTIVE' && (
              <span style={{
                padding: '4px 10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--text-secondary)'
              }}>
                Operational
              </span>
            )}
          </div>
        </div>

        {/* Description preview */}
        {hasDescription && (
          <div style={{
            marginBottom: 16,
            padding: '12px 13px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.02))',
            border: '1px dashed var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 12,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: 10,
              right: 10,
              fontSize: 9,
              color: 'var(--text-muted)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              Overview
            </div>
            <div style={{ paddingRight: 52 }}>
              {shortDescription}
            </div>
          </div>
        )}

        {/* Amenities Section */}
        {amenities.length > 0 && (
          <div style={{
            marginBottom: 18,
            paddingTop: 12,
            borderTop: '1px solid var(--border)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--text-muted)',
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <BadgeCheck size={12} />
              Included amenities
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8
            }}>
              {amenities.map((amenity, idx) => (
                <span
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 10px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 20,
                    fontSize: 11,
                    color: 'var(--text-secondary)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(79,142,247,0.15)';
                    e.currentTarget.style.color = 'var(--accent)';
                    e.currentTarget.style.borderColor = 'rgba(79,142,247,0.18)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  }}
                >
                  {amenity.icon} {amenity.name}
                </span>
              ))}
            </div>
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
            padding: '5px 9px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 10,
            fontSize: 10,
            color: 'var(--text-muted)',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            Category: {resourceLabel}
          </span>

          <span style={{
            padding: '5px 9px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 10,
            fontSize: 10,
            color: 'var(--text-muted)',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            {resource.totalBookings > 0 ? 'In active circulation' : 'Low recent usage'}
          </span>

          <span style={{
            padding: '5px 9px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 10,
            fontSize: 10,
            color: 'var(--text-muted)',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            {hasValidImageUrl ? 'Profile enriched' : 'Visual fallback enabled'}
          </span>
        </div>

        {/* Availability Time Slots Section */}
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
                padding: '11px 12px',
                background: showSlotPicker
                  ? 'rgba(79,142,247,0.16)'
                  : 'rgba(79,142,247,0.1)',
                border: '1px solid rgba(79,142,247,0.22)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--accent)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(79,142,247,0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = showSlotPicker
                  ? 'rgba(79,142,247,0.16)'
                  : 'rgba(79,142,247,0.1)';
              }}
            >
              <Clock size={14} />
              {showSlotPicker ? 'Hide Availability' : 'Check Availability'}
            </button>

            {showSlotPicker && (
              <div
                style={{
                  marginTop: 12,
                  padding: '14px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block', fontWeight: 600 }}>
                    Select Date
                  </label>
                  <select
                    value={selectedDate}
                    onChange={handleDateChange}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      outline: 'none'
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
                    <div style={{
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      marginBottom: 10,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <Calendar size={12} />
                      Available Time Slots for {formatDate(selectedDate)}
                    </div>

                    {loadingSlots ? (
                      <div style={{ textAlign: 'center', padding: '16px' }}>
                        <div style={{
                          width: 24,
                          height: 24,
                          border: '2px solid var(--border)',
                          borderTopColor: 'var(--accent)',
                          borderRadius: '50%',
                          margin: '0 auto',
                          animation: 'spin 1s linear infinite'
                        }} />
                      </div>
                    ) : timeSlots.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        padding: '16px',
                        color: 'var(--text-muted)',
                        fontSize: 12,
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 10,
                        border: '1px dashed var(--border)'
                      }}>
                        No available slots for this date
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {timeSlots.slice(0, 6).map((slot, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: '7px 12px',
                              background: 'rgba(16,185,129,0.1)',
                              borderRadius: '20px',
                              fontSize: 11,
                              color: '#10b981',
                              border: '1px solid rgba(16,185,129,0.2)',
                              fontWeight: 600
                            }}
                          >
                            {slot.start} - {slot.end}
                          </span>
                        ))}

                        {timeSlots.length > 6 && (
                          <span style={{
                            padding: '7px 12px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '20px',
                            fontSize: 11,
                            color: 'var(--text-muted)',
                            fontWeight: 600
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
          <div style={{
            display: 'flex',
            gap: 8,
            marginTop: 4,
            paddingTop: 2
          }}>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(resource); }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '9px 12px',
                background: 'rgba(79,142,247,0.1)',
                border: '1px solid rgba(79,142,247,0.2)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--accent)',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 700,
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
                padding: '9px 12px',
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
                fontWeight: 700,
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
                padding: '9px 12px',
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
                padding: '9px 12px',
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
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button
              onClick={(e) => { e.stopPropagation(); onViewDetails(resource); }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '11px 12px',
                background: resource.status === 'ACTIVE'
                  ? 'linear-gradient(135deg, var(--accent), var(--accent-2))'
                  : 'rgba(255,255,255,0.05)',
                border: resource.status !== 'ACTIVE' ? '1px solid var(--border)' : 'none',
                borderRadius: 'var(--radius-sm)',
                color: resource.status === 'ACTIVE' ? 'white' : 'var(--text-muted)',
                cursor: resource.status === 'ACTIVE' ? 'pointer' : 'not-allowed',
                fontSize: 13,
                fontWeight: 700,
                transition: 'all 0.2s',
                boxShadow: resource.status === 'ACTIVE' ? '0 8px 18px rgba(79,142,247,0.24)' : 'none'
              }}
              onMouseEnter={e => {
                if (resource.status === 'ACTIVE') {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 22px rgba(79,142,247,0.3)';
                }
              }}
              onMouseLeave={e => {
                if (resource.status === 'ACTIVE') {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 18px rgba(79,142,247,0.24)';
                }
              }}
              disabled={resource.status !== 'ACTIVE'}
            >
              <Calendar size={14} />
              {resource.status === 'ACTIVE' ? 'Book Now' : 'Currently Unavailable'}
              {resource.status === 'ACTIVE' && <ChevronRight size={14} />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onReportIssue) onReportIssue(resource);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '11px 14px',
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.22)',
                borderRadius: 'var(--radius-sm)',
                color: '#f87171',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                transition: 'all 0.2s',
                minWidth: 130
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.background = 'rgba(248,113,113,0.14)';
                e.currentTarget.style.borderColor = 'rgba(248,113,113,0.32)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(248,113,113,0.08)';
                e.currentTarget.style.borderColor = 'rgba(248,113,113,0.22)';
              }}
            >
              <AlertTriangle size={14} />
              Report Issue
            </button>
          </div>
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
          padding: '7px 12px',
          fontSize: 11,
          color: 'var(--text-muted)',
          whiteSpace: 'nowrap',
          zIndex: 20,
          boxShadow: '0 12px 24px rgba(0,0,0,0.12)'
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