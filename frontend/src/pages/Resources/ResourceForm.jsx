import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ResourceForm = ({ resource, onSubmit, onClose, isEditing = false }) => {
    const [formData, setFormData] = useState({
        name: '',
        resourceType: 'Meeting Room',
        capacity: '',
        location: '',
        building: '',
        floor: '',
        status: 'ACTIVE',
        description: '',
        imageUrl: '',
        isAirConditioned: false,
        hasProjector: false,
        hasSmartBoard: false,
        hasWifi: false,
        hasPowerOutlets: false
    });
    const [errors, setErrors] = useState({});

    const resourceTypes = ['Lecture Hall', 'Laboratory', 'Meeting Room', 'Projector', 'Camera', 'Computer Lab', 'Study Room'];

    useEffect(() => {
        if (resource) {
            setFormData({
                name: resource.name || '',
                resourceType: resource.resourceType || 'Meeting Room',
                capacity: resource.capacity || '',
                location: resource.location || '',
                building: resource.building || '',
                floor: resource.floor || '',
                status: resource.status || 'ACTIVE',
                description: resource.description || '',
                imageUrl: resource.imageUrl || '',
                isAirConditioned: resource.isAirConditioned || false,
                hasProjector: resource.hasProjector || false,
                hasSmartBoard: resource.hasSmartBoard || false,
                hasWifi: resource.hasWifi || false,
                hasPowerOutlets: resource.hasPowerOutlets || false
            });
        }
    }, [resource]);

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Resource name is required';
        if (!formData.capacity) newErrors.capacity = 'Capacity is required';
        else if (formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1';
        else if (formData.capacity > 500) newErrors.capacity = 'Capacity cannot exceed 500';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease'
        }}>
            <div style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius)',
                width: '90%',
                maxWidth: 600,
                maxHeight: '90vh',
                overflow: 'auto',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-glow)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--border)'
                }}>
                    <h2 style={{
                        fontSize: 20,
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, var(--text-primary), var(--accent))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        {isEditing ? 'Edit Resource' : 'Add New Resource'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            padding: 8,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        <X size={18} style={{ color: 'var(--text-secondary)' }} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                    {/* Resource Name */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={{
                            display: 'block',
                            fontSize: 13,
                            fontWeight: 500,
                            marginBottom: 6,
                            color: 'var(--text-secondary)'
                        }}>
                            Resource Name <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: `1px solid ${errors.name ? 'var(--danger)' : 'var(--border)'}`,
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                            onBlur={e => e.currentTarget.style.borderColor = errors.name ? 'var(--danger)' : 'var(--border)'}
                        />
                        {errors.name && <p style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4 }}>{errors.name}</p>}
                    </div>
                    
                    {/* Resource Type & Capacity */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: 13,
                                fontWeight: 500,
                                marginBottom: 6,
                                color: 'var(--text-secondary)'
                            }}>
                                Resource Type
                            </label>
                            <select
                                value={formData.resourceType}
                                onChange={(e) => setFormData({...formData, resourceType: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {resourceTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: 13,
                                fontWeight: 500,
                                marginBottom: 6,
                                color: 'var(--text-secondary)'
                            }}>
                                Capacity <span style={{ color: 'var(--danger)' }}>*</span>
                            </label>
                            <input
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${errors.capacity ? 'var(--danger)' : 'var(--border)'}`,
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-primary)',
                                    outline: 'none'
                                }}
                            />
                            {errors.capacity && <p style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4 }}>{errors.capacity}</p>}
                        </div>
                    </div>
                    
                    {/* Building & Floor */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: 13,
                                fontWeight: 500,
                                marginBottom: 6,
                                color: 'var(--text-secondary)'
                            }}>
                                Building
                            </label>
                            <input
                                type="text"
                                value={formData.building}
                                onChange={(e) => setFormData({...formData, building: e.target.value})}
                                placeholder="e.g., Engineering Building"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-primary)',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: 13,
                                fontWeight: 500,
                                marginBottom: 6,
                                color: 'var(--text-secondary)'
                            }}>
                                Floor
                            </label>
                            <input
                                type="text"
                                value={formData.floor}
                                onChange={(e) => setFormData({...formData, floor: e.target.value})}
                                placeholder="e.g., Floor 2"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-primary)',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>
                    
                    {/* Location */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={{
                            display: 'block',
                            fontSize: 13,
                            fontWeight: 500,
                            marginBottom: 6,
                            color: 'var(--text-secondary)'
                        }}>
                            Location Details <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            placeholder="Room number, directions..."
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: `1px solid ${errors.location ? 'var(--danger)' : 'var(--border)'}`,
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-primary)',
                                outline: 'none'
                            }}
                        />
                        {errors.location && <p style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4 }}>{errors.location}</p>}
                    </div>
                    
                    {/* Status */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={{
                            display: 'block',
                            fontSize: 13,
                            fontWeight: 500,
                            marginBottom: 6,
                            color: 'var(--text-secondary)'
                        }}>
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="OUT_OF_SERVICE">Out of Service</option>
                            <option value="MAINTENANCE">Maintenance</option>
                        </select>
                    </div>
                    
                    {/* Description */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={{
                            display: 'block',
                            fontSize: 13,
                            fontWeight: 500,
                            marginBottom: 6,
                            color: 'var(--text-secondary)'
                        }}>
                            Description
                        </label>
                        <textarea
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Describe features, amenities, special notes..."
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>
                    
                    {/* Amenities */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block',
                            fontSize: 13,
                            fontWeight: 500,
                            marginBottom: 10,
                            color: 'var(--text-secondary)'
                        }}>
                            Amenities
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}>
                                <input
                                    type="checkbox"
                                    checked={formData.isAirConditioned}
                                    onChange={(e) => setFormData({...formData, isAirConditioned: e.target.checked})}
                                    style={{ accentColor: 'var(--accent)' }}
                                />
                                Air Conditioned
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}>
                                <input
                                    type="checkbox"
                                    checked={formData.hasProjector}
                                    onChange={(e) => setFormData({...formData, hasProjector: e.target.checked})}
                                    style={{ accentColor: 'var(--accent)' }}
                                />
                                Projector
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}>
                                <input
                                    type="checkbox"
                                    checked={formData.hasSmartBoard}
                                    onChange={(e) => setFormData({...formData, hasSmartBoard: e.target.checked})}
                                    style={{ accentColor: 'var(--accent)' }}
                                />
                                Smart Board
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}>
                                <input
                                    type="checkbox"
                                    checked={formData.hasWifi}
                                    onChange={(e) => setFormData({...formData, hasWifi: e.target.checked})}
                                    style={{ accentColor: 'var(--accent)' }}
                                />
                                WiFi
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}>
                                <input
                                    type="checkbox"
                                    checked={formData.hasPowerOutlets}
                                    onChange={(e) => setFormData({...formData, hasPowerOutlets: e.target.checked})}
                                    style={{ accentColor: 'var(--accent)' }}
                                />
                                Power Outlets
                            </label>
                        </div>
                    </div>
                    
                    {/* Image URL */}
                    <div style={{ marginBottom: 24 }}>
                        <label style={{
                            display: 'block',
                            fontSize: 13,
                            fontWeight: 500,
                            marginBottom: 6,
                            color: 'var(--text-secondary)'
                        }}>
                            Image URL
                        </label>
                        <input
                            type="url"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                            placeholder="https://example.com/image.jpg"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-primary)',
                                outline: 'none'
                            }}
                        />
                    </div>
                    
                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button
                            type="submit"
                            style={{
                                flex: 1,
                                padding: '12px',
                                background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 500,
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {isEditing ? 'Update Resource' : 'Create Resource'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: 14,
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.borderColor = 'var(--danger)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.borderColor = 'var(--border)';
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResourceForm;