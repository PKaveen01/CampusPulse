import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Building2, Users, MapPin, 
    Wifi, Wind, Tv, Plug, Smartphone,
    Printer
} from 'lucide-react';
import resourceService from '../../services/resourceService';

const ResourceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div style={{ width: 40, height: 40, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
        );
    }

    if (!resource) {
        return (
            <div style={{ textAlign: 'center', padding: 50 }}>
                <h2>Resource not found</h2>
                <button onClick={() => navigate('/resources')}>Back to Resources</button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
            {/* Back Button */}
            <button
                onClick={() => navigate('/resources')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    marginBottom: 24
                }}
            >
                <ArrowLeft size={16} /> Back to Resources
            </button>

            {/* Resource Details */}
            <div style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                overflow: 'hidden'
            }}>
                {/* Header Image */}
                <div style={{
                    height: 300,
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {resource.imageUrl ? (
                        <img src={resource.imageUrl} alt={resource.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <Building2 size={80} style={{ color: 'white', opacity: 0.5 }} />
                    )}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '20px',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)'
                    }}>
                        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 8 }}>{resource.name}</h1>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                            <span style={{
                                padding: '4px 12px',
                                borderRadius: 20,
                                background: resource.status === 'ACTIVE' ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)',
                                color: resource.status === 'ACTIVE' ? '#34d399' : '#f87171',
                                fontSize: 12
                            }}>
                                {resource.status}
                            </span>
                            <span style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.2)', fontSize: 12 }}>
                                {resource.resourceType}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                        {/* Left Column - Details */}
                        <div>
                            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Resource Details</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <Users size={18} style={{ color: 'var(--accent)' }} />
                                    <span>Capacity: {resource.capacity} people</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <MapPin size={18} style={{ color: 'var(--accent)' }} />
                                    <span>{resource.building ? `${resource.building}, ` : ''}{resource.location}</span>
                                </div>
                                {resource.floor && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <Building2 size={18} style={{ color: 'var(--accent)' }} />
                                        <span>Floor: {resource.floor}</span>
                                    </div>
                                )}
                            </div>

                            {resource.description && (
                                <>
                                    <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>Description</h3>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{resource.description}</p>
                                </>
                            )}
                        </div>

                        {/* Right Column - Amenities */}
                        <div>
                            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Amenities</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                                {resource.isAirConditioned && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                                        <Wind size={16} style={{ color: '#60a5fa' }} /> Air Conditioned
                                    </div>
                                )}
                                {resource.hasProjector && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                                        <Tv size={16} style={{ color: '#fbbf24' }} /> Projector
                                    </div>
                                )}
                                {resource.hasSmartBoard && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                                        <Smartphone size={16} style={{ color: '#34d399' }} /> Smart Board
                                    </div>
                                )}
                                {resource.hasWifi && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                                        <Wifi size={16} style={{ color: '#60a5fa' }} /> WiFi
                                    </div>
                                )}
                                {resource.hasPowerOutlets && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                                        <Plug size={16} style={{ color: '#f87171' }} /> Power Outlets
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
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
                                        gap: 8
                                    }}
                                >
                                    <Printer size={16} /> Print Details
                                </button>
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