import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Building2, Users, MapPin,
    Wifi, Wind, Tv, Plug, Smartphone,
    Printer, ShieldCheck, Info, Layers3, Sparkles, CheckCircle, AlertTriangle
} from 'lucide-react';
import resourceService from '../../services/resourceService';

const ResourceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        fetchResourceDetails();
    }, [id]);

    const fetchResourceDetails = async () => {
        try {
            setLoading(true);
            const data = await resourceService.getResourceById(id);
            setResource(data);
        } catch (error) {
            console.error('Failed to fetch resource:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyles = (status) => {
        if (status === 'ACTIVE') {
            return {
                bg: 'rgba(52,211,153,0.18)',
                color: '#34d399',
                border: 'rgba(52,211,153,0.28)',
                label: 'Operational',
                icon: <CheckCircle size={13} />
            };
        }

        if (status === 'MAINTENANCE') {
            return {
                bg: 'rgba(251,191,36,0.18)',
                color: '#fbbf24',
                border: 'rgba(251,191,36,0.28)',
                label: 'Under Maintenance',
                icon: <AlertTriangle size={13} />
            };
        }

        return {
            bg: 'rgba(248,113,113,0.18)',
            color: '#f87171',
            border: 'rgba(248,113,113,0.28)',
            label: 'Unavailable',
            icon: <AlertTriangle size={13} />
        };
    };

    const getAmenityCount = () => {
        let count = 0;
        if (resource?.isAirConditioned) count++;
        if (resource?.hasProjector) count++;
        if (resource?.hasSmartBoard) count++;
        if (resource?.hasWifi) count++;
        if (resource?.hasPowerOutlets) count++;
        return count;
    };

    const getResourcePreviewImage = () => {
        if (resource?.imageUrl && !imageError) return resource.imageUrl;

        const fallbackImages = {
            'Lecture Hall': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200',
            'Meeting Room': 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=1200',
            'Laboratory': 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=1200',
            'Computer Lab': 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=1200',
            'Study Room': 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200',
            'Auditorium': 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200',
            'Equipment': 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=1200'
        };

        return fallbackImages[resource?.resourceType] || null;
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'var(--bg-primary)'
            }}>
                <div style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)), var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '36px 40px',
                    textAlign: 'center',
                    minWidth: 280,
                    boxShadow: '0 20px 48px rgba(0,0,0,0.2)'
                }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        border: '2px solid var(--border)',
                        borderTopColor: 'var(--accent)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }}></div>
                    <p style={{ marginTop: 16, color: 'var(--text-muted)', fontSize: 14 }}>Loading resource details...</p>
                </div>
            </div>
        );
    }

    if (!resource) {
        return (
            <div style={{
                textAlign: 'center',
                padding: 50,
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)'
            }}>
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '40px 32px',
                    maxWidth: 420
                }}>
                    <Building2 size={48} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: 16 }} />
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
                        Resource not found
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                        The selected resource could not be loaded or may no longer be available.
                    </p>
                    <button
                        onClick={() => navigate('/resources')}
                        style={{
                            padding: '10px 18px',
                            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        Back to Resources
                    </button>
                </div>
            </div>
        );
    }

    const statusStyles = getStatusStyles(resource.status);
    const amenityCount = getAmenityCount();
    const previewImage = getResourcePreviewImage();

    return (
        <div style={{
            maxWidth: 1240,
            margin: '0 auto',
            padding: '32px 24px 48px',
            background: 'var(--bg-primary)'
        }}>
            {/* Back Button */}
            <button
                onClick={() => navigate('/resources')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 16px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    marginBottom: 24,
                    fontWeight: 600,
                    transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.color = 'var(--accent)';
                    e.currentTarget.style.background = 'rgba(79,142,247,0.06)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'var(--bg-card)';
                }}
            >
                <ArrowLeft size={16} /> Back to Resources
            </button>

            {/* Resource Details */}
            <div style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                boxShadow: '0 20px 46px rgba(0,0,0,0.14)'
            }}>
                {/* Header Image */}
                <div style={{
                    height: 340,
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                }}>
                    {previewImage ? (
                        <img
                            src={previewImage}
                            alt={resource.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <Building2 size={88} style={{ color: 'white', opacity: 0.5 }} />
                    )}

                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.76), rgba(0,0,0,0.18), transparent)'
                    }} />

                    <div style={{
                        position: 'absolute',
                        top: 18,
                        left: 18,
                        display: 'flex',
                        gap: 10,
                        flexWrap: 'wrap'
                    }}>
                        <span style={{
                            padding: '6px 12px',
                            borderRadius: 999,
                            background: `${statusStyles.bg}`,
                            color: statusStyles.color,
                            fontSize: 12,
                            border: `1px solid ${statusStyles.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontWeight: 700,
                            backdropFilter: 'blur(10px)'
                        }}>
                            {statusStyles.icon}
                            {resource.status}
                        </span>

                        <span style={{
                            padding: '6px 12px',
                            borderRadius: 999,
                            background: 'rgba(255,255,255,0.14)',
                            color: 'white',
                            fontSize: 12,
                            border: '1px solid rgba(255,255,255,0.16)',
                            fontWeight: 700,
                            backdropFilter: 'blur(10px)'
                        }}>
                            {resource.resourceType}
                        </span>
                    </div>

                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '24px'
                    }}>
                        <h1 style={{
                            fontSize: 30,
                            fontWeight: 800,
                            color: 'white',
                            marginBottom: 10,
                            lineHeight: 1.2
                        }}>
                            {resource.name}
                        </h1>

                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <span style={{
                                padding: '6px 12px',
                                borderRadius: 999,
                                background: 'rgba(255,255,255,0.14)',
                                color: 'white',
                                fontSize: 12,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                fontWeight: 600,
                                border: '1px solid rgba(255,255,255,0.14)'
                            }}>
                                <Users size={13} />
                                Capacity {resource.capacity}
                            </span>

                            <span style={{
                                padding: '6px 12px',
                                borderRadius: 999,
                                background: 'rgba(255,255,255,0.14)',
                                color: 'white',
                                fontSize: 12,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                fontWeight: 600,
                                border: '1px solid rgba(255,255,255,0.14)'
                            }}>
                                <Sparkles size={13} />
                                {amenityCount} amenities
                            </span>

                            <span style={{
                                padding: '6px 12px',
                                borderRadius: 999,
                                background: 'rgba(255,255,255,0.14)',
                                color: 'white',
                                fontSize: 12,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                fontWeight: 600,
                                border: '1px solid rgba(255,255,255,0.14)'
                            }}>
                                <ShieldCheck size={13} />
                                {statusStyles.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Top stats strip */}
                <div style={{
                    padding: '18px 24px',
                    borderBottom: '1px solid var(--border)',
                    background: 'rgba(255,255,255,0.02)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 14
                }}>
                    <div style={{
                        padding: '14px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(79,142,247,0.08)',
                        border: '1px solid rgba(79,142,247,0.14)'
                    }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Type</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>{resource.resourceType}</div>
                    </div>

                    <div style={{
                        padding: '14px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(52,211,153,0.08)',
                        border: '1px solid rgba(52,211,153,0.14)'
                    }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Capacity</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#34d399' }}>{resource.capacity} people</div>
                    </div>

                    <div style={{
                        padding: '14px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border)'
                    }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Operational State</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: statusStyles.color }}>{resource.status}</div>
                    </div>

                    <div style={{
                        padding: '14px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border)'
                    }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Amenity Count</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{amenityCount}</div>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
                        {/* Left Column - Details */}
                        <div>
                            <div style={{
                                padding: 20,
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))'
                            }}>
                                <h3 style={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    marginBottom: 18,
                                    color: 'var(--text-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8
                                }}>
                                    <Info size={18} style={{ color: 'var(--accent)' }} />
                                    Resource Details
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: '10px 12px',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid rgba(255,255,255,0.04)'
                                    }}>
                                        <Users size={18} style={{ color: 'var(--accent)' }} />
                                        <span>Capacity: {resource.capacity} people</span>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: '10px 12px',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid rgba(255,255,255,0.04)'
                                    }}>
                                        <MapPin size={18} style={{ color: 'var(--accent)' }} />
                                        <span>{resource.building ? `${resource.building}, ` : ''}{resource.location}</span>
                                    </div>

                                    {resource.floor && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 10,
                                            padding: '10px 12px',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid rgba(255,255,255,0.04)'
                                        }}>
                                            <Building2 size={18} style={{ color: 'var(--accent)' }} />
                                            <span>Floor: {resource.floor}</span>
                                        </div>
                                    )}

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: '10px 12px',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid rgba(255,255,255,0.04)'
                                    }}>
                                        <Layers3 size={18} style={{ color: 'var(--accent)' }} />
                                        <span>Resource Type: {resource.resourceType}</span>
                                    </div>
                                </div>
                            </div>

                            {resource.description && (
                                <div style={{
                                    marginTop: 20,
                                    padding: 20,
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border)',
                                    background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))'
                                }}>
                                    <h3 style={{
                                        fontSize: 18,
                                        fontWeight: 700,
                                        marginBottom: 14,
                                        color: 'var(--text-primary)'
                                    }}>
                                        Description
                                    </h3>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>
                                        {resource.description}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Amenities */}
                        <div>
                            <div style={{
                                padding: 20,
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))'
                            }}>
                                <h3 style={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    marginBottom: 16,
                                    color: 'var(--text-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8
                                }}>
                                    <Sparkles size={18} style={{ color: 'var(--accent)' }} />
                                    Amenities
                                </h3>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                                    {resource.isAirConditioned && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            padding: '10px 12px',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid rgba(255,255,255,0.04)',
                                            fontSize: 13,
                                            fontWeight: 500
                                        }}>
                                            <Wind size={16} style={{ color: '#60a5fa' }} /> Air Conditioned
                                        </div>
                                    )}

                                    {resource.hasProjector && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            padding: '10px 12px',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid rgba(255,255,255,0.04)',
                                            fontSize: 13,
                                            fontWeight: 500
                                        }}>
                                            <Tv size={16} style={{ color: '#fbbf24' }} /> Projector
                                        </div>
                                    )}

                                    {resource.hasSmartBoard && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            padding: '10px 12px',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid rgba(255,255,255,0.04)',
                                            fontSize: 13,
                                            fontWeight: 500
                                        }}>
                                            <Smartphone size={16} style={{ color: '#34d399' }} /> Smart Board
                                        </div>
                                    )}

                                    {resource.hasWifi && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            padding: '10px 12px',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid rgba(255,255,255,0.04)',
                                            fontSize: 13,
                                            fontWeight: 500
                                        }}>
                                            <Wifi size={16} style={{ color: '#60a5fa' }} /> WiFi
                                        </div>
                                    )}

                                    {resource.hasPowerOutlets && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            padding: '10px 12px',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid rgba(255,255,255,0.04)',
                                            fontSize: 13,
                                            fontWeight: 500
                                        }}>
                                            <Plug size={16} style={{ color: '#f87171' }} /> Power Outlets
                                        </div>
                                    )}

                                    {!resource.isAirConditioned &&
                                        !resource.hasProjector &&
                                        !resource.hasSmartBoard &&
                                        !resource.hasWifi &&
                                        !resource.hasPowerOutlets && (
                                            <div style={{
                                                gridColumn: '1 / -1',
                                                textAlign: 'center',
                                                padding: 24,
                                                color: 'var(--text-muted)',
                                                border: '1px dashed var(--border)',
                                                borderRadius: 'var(--radius-sm)',
                                                background: 'rgba(255,255,255,0.02)'
                                            }}>
                                                No amenities listed for this resource
                                            </div>
                                        )}
                                </div>

                                {/* Action Buttons */}
                                <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                    {resource.status === 'ACTIVE' && (
                                        <button
                                            onClick={() => navigate('/bookings', { state: { resourceId: resource.id } })}
                                            style={{
                                                flex: 1,
                                                padding: '12px',
                                                background: 'var(--accent)',
                                                border: '1px solid var(--accent)',
                                                borderRadius: 'var(--radius-sm)',
                                                color: '#fff',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 8,
                                                fontWeight: 600,
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            📅 Book This Resource
                                        </button>
                                    )}
                                    <button
                                        onClick={() => window.print()}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid var(--border)',
                                            borderRadius: 'var(--radius-sm)',
                                            color: 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 8,
                                            fontWeight: 600,
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = 'var(--accent)';
                                            e.currentTarget.style.color = 'var(--accent)';
                                            e.currentTarget.style.background = 'rgba(79,142,247,0.06)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = 'var(--border)';
                                            e.currentTarget.style.color = 'var(--text-secondary)';
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                        }}
                                    >
                                        <Printer size={16} /> Print Details
                                    </button>
                                </div>
                            </div>

                            {/* Operational note */}
                            <div style={{
                                marginTop: 20,
                                padding: 18,
                                borderRadius: 'var(--radius-sm)',
                                background: `${statusStyles.bg}`,
                                border: `1px solid ${statusStyles.border}`
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    fontWeight: 700,
                                    color: statusStyles.color,
                                    marginBottom: 8
                                }}>
                                    {statusStyles.icon}
                                    Current Status
                                </div>

                                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    This resource is currently marked as <strong style={{ color: statusStyles.color }}>{resource.status}</strong>.
                                    {resource.status === 'ACTIVE' && ' It is available for normal operational use.'}
                                    {resource.status === 'MAINTENANCE' && ' It may be temporarily unavailable while service work is being carried out.'}
                                    {resource.status !== 'ACTIVE' && resource.status !== 'MAINTENANCE' && ' Access or usage may be restricted at the moment.'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ResourceDetails;