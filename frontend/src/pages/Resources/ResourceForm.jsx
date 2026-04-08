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

    // NEW: extra UX states
    const [touched, setTouched] = useState({});
    const [imagePreviewError, setImagePreviewError] = useState(false);
    const [formTouched, setFormTouched] = useState(false);

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

    // NEW: reset image preview error when URL changes
    useEffect(() => {
        setImagePreviewError(false);
    }, [formData.imageUrl]);

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Resource name is required';
        else if (formData.name.trim().length < 3) newErrors.name = 'Resource name must be at least 3 characters';

        if (!formData.capacity) newErrors.capacity = 'Capacity is required';
        else if (Number(formData.capacity) < 1) newErrors.capacity = 'Capacity must be at least 1';
        else if (Number(formData.capacity) > 500) newErrors.capacity = 'Capacity cannot exceed 500';

        if (!formData.location.trim()) newErrors.location = 'Location is required';
        else if (formData.location.trim().length < 2) newErrors.location = 'Location details are too short';

        // NEW: more realistic validation
        if (formData.building && formData.building.trim().length > 0 && formData.building.trim().length < 2) {
            newErrors.building = 'Building name is too short';
        }

        if (formData.floor && formData.floor.trim().length > 0 && formData.floor.trim().length < 1) {
            newErrors.floor = 'Floor is invalid';
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Description cannot exceed 500 characters';
        }

        if (formData.imageUrl && formData.imageUrl.trim()) {
            const isValidUrl = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg)(\?.*)?)$/i.test(formData.imageUrl.trim()) ||
                               /^(https?:\/\/.+)$/i.test(formData.imageUrl.trim());
            if (!isValidUrl) {
                newErrors.imageUrl = 'Please enter a valid image URL';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // NEW: field level touch handling
    const handleFieldBlur = (fieldName) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
        validate();
    };

    // NEW: reusable change handler to preserve logic and add UX
    const handleFieldChange = (field, value) => {
        setFormTouched(true);
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setTouched({
            name: true,
            resourceType: true,
            capacity: true,
            location: true,
            building: true,
            floor: true,
            status: true,
            description: true,
            imageUrl: true
        });
        if (validate()) {
            onSubmit(formData);
        }
    };

    // NEW: derived UI helpers
    const selectedAmenitiesCount = [
        formData.isAirConditioned,
        formData.hasProjector,
        formData.hasSmartBoard,
        formData.hasWifi,
        formData.hasPowerOutlets
    ].filter(Boolean).length;

    const capacityLabel =
        Number(formData.capacity) >= 100 ? 'Large capacity venue' :
        Number(formData.capacity) >= 40 ? 'Medium capacity venue' :
        Number(formData.capacity) >= 1 ? 'Small capacity venue' : '';

    const statusHelperText = {
        ACTIVE: 'This resource will appear as available for normal operations.',
        OUT_OF_SERVICE: 'Use this when the resource is temporarily unavailable.',
        MAINTENANCE: 'Use this when the resource is under maintenance or inspection.'
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
                    <div>
                        <h2 style={{
                            fontSize: 20,
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, var(--text-primary), var(--accent))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            marginBottom: 4
                        }}>
                            {isEditing ? 'Edit Resource' : 'Add New Resource'}
                        </h2>
                        {/* NEW */}
                        <p style={{
                            fontSize: 12,
                            color: 'var(--text-secondary)',
                            margin: 0
                        }}>
                            {isEditing ? 'Update facility details and amenities' : 'Create a new facility or asset entry for the catalogue'}
                        </p>
                    </div>
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
                    {/* NEW: compact form progress/info bar */}
                    <div style={{
                        marginBottom: 18,
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(79,142,247,0.08)',
                        border: '1px solid rgba(79,142,247,0.18)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12,
                        flexWrap: 'wrap'
                    }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            Required fields: Name, Capacity, Location
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>
                            Amenities selected: {selectedAmenitiesCount}
                        </span>
                    </div>

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
                            onChange={(e) => handleFieldChange('name', e.target.value)}
                            onBlur={() => handleFieldBlur('name')}
                            placeholder="e.g., Seminar Hall A, Lab 03, Projector P-12"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: `1px solid ${(errors.name && touched.name) ? 'var(--danger)' : 'var(--border)'}`,
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                            onBlurCapture={e => e.currentTarget.style.borderColor = (errors.name && touched.name) ? 'var(--danger)' : 'var(--border)'}
                        />
                        {errors.name && touched.name && <p style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4 }}>{errors.name}</p>}
                        {/* NEW */}
                        {!errors.name && formData.name && (
                            <p style={{ color: '#34d399', fontSize: 11, marginTop: 4 }}>
                                Looks good
                            </p>
                        )}
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
                                onChange={(e) => handleFieldChange('resourceType', e.target.value)}
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
                                onChange={(e) => handleFieldChange('capacity', e.target.value)}
                                onBlur={() => handleFieldBlur('capacity')}
                                min="1"
                                max="500"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${(errors.capacity && touched.capacity) ? 'var(--danger)' : 'var(--border)'}`,
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-primary)',
                                    outline: 'none'
                                }}
                            />
                            {errors.capacity && touched.capacity && <p style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4 }}>{errors.capacity}</p>}
                            {/* NEW */}
                            {!errors.capacity && formData.capacity && (
                                <p style={{ color: 'var(--text-secondary)', fontSize: 11, marginTop: 4 }}>
                                    {capacityLabel}
                                </p>
                            )}
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
                                onChange={(e) => handleFieldChange('building', e.target.value)}
                                onBlur={() => handleFieldBlur('building')}
                                placeholder="e.g., Engineering Building"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${(errors.building && touched.building) ? 'var(--danger)' : 'var(--border)'}`,
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-primary)',
                                    outline: 'none'
                                }}
                            />
                            {errors.building && touched.building && <p style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4 }}>{errors.building}</p>}
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
                                onChange={(e) => handleFieldChange('floor', e.target.value)}
                                onBlur={() => handleFieldBlur('floor')}
                                placeholder="e.g., Floor 2"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${(errors.floor && touched.floor) ? 'var(--danger)' : 'var(--border)'}`,
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-primary)',
                                    outline: 'none'
                                }}
                            />
                            {errors.floor && touched.floor && <p style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4 }}>{errors.floor}</p>}
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
                            onChange={(e) => handleFieldChange('location', e.target.value)}
                            onBlur={() => handleFieldBlur('location')}
                            placeholder="Room number, directions..."
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: `1px solid ${(errors.location && touched.location) ? 'var(--danger)' : 'var(--border)'}`,
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-primary)',
                                outline: 'none'
                            }}
                        />
                        {errors.location && touched.location && <p style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4 }}>{errors.location}</p>}
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
                            onChange={(e) => handleFieldChange('status', e.target.value)}
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
                        {/* NEW */}
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6 }}>
                            {statusHelperText[formData.status]}
                        </p>
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
                            onChange={(e) => handleFieldChange('description', e.target.value)}
                            onBlur={() => handleFieldBlur('description')}
                            placeholder="Describe features, amenities, special notes..."
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: `1px solid ${(errors.description && touched.description) ? 'var(--danger)' : 'var(--border)'}`,
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                            }}
                        />
                        {errors.description && touched.description && <p style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4 }}>{errors.description}</p>}
                        {/* NEW */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                            <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>
                                Add useful operational notes, features, or restrictions.
                            </p>
                            <span style={{ fontSize: 11, color: formData.description.length > 450 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                                {formData.description.length}/500
                            </span>
                        </div>
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
                                    onChange={(e) => handleFieldChange('isAirConditioned', e.target.checked)}
                                    style={{ accentColor: 'var(--accent)' }}
                                />
                                Air Conditioned
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}>
                                <input
                                    type="checkbox"
                                    checked={formData.hasProjector}
                                    onChange={(e) => handleFieldChange('hasProjector', e.target.checked)}
                                    style={{ accentColor: 'var(--accent)' }}
                                />
                                Projector
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}>
                                <input
                                    type="checkbox"
                                    checked={formData.hasSmartBoard}
                                    onChange={(e) => handleFieldChange('hasSmartBoard', e.target.checked)}
                                    style={{ accentColor: 'var(--accent)' }}
                                />
                                Smart Board
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}>
                                <input
                                    type="checkbox"
                                    checked={formData.hasWifi}
                                    onChange={(e) => handleFieldChange('hasWifi', e.target.checked)}
                                    style={{ accentColor: 'var(--accent)' }}
                                />
                                WiFi
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}>
                                <input
                                    type="checkbox"
                                    checked={formData.hasPowerOutlets}
                                    onChange={(e) => handleFieldChange('hasPowerOutlets', e.target.checked)}
                                    style={{ accentColor: 'var(--accent)' }}
                                />
                                Power Outlets
                            </label>
                        </div>

                        {/* NEW */}
                        <div style={{
                            marginTop: 12,
                            padding: '10px 12px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px dashed var(--border)',
                            borderRadius: 'var(--radius-sm)'
                        }}>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                Selected amenities: {selectedAmenitiesCount === 0 ? 'None selected' : selectedAmenitiesCount}
                            </span>
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
                            onChange={(e) => handleFieldChange('imageUrl', e.target.value)}
                            onBlur={() => handleFieldBlur('imageUrl')}
                            placeholder="https://example.com/image.jpg"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: `1px solid ${(errors.imageUrl && touched.imageUrl) ? 'var(--danger)' : 'var(--border)'}`,
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-primary)',
                                outline: 'none'
                            }}
                        />
                        {errors.imageUrl && touched.imageUrl && <p style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4 }}>{errors.imageUrl}</p>}

                        {/* NEW: image preview */}
                        {formData.imageUrl && !errors.imageUrl && (
                            <div style={{
                                marginTop: 12,
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                overflow: 'hidden',
                                background: 'rgba(255,255,255,0.03)'
                            }}>
                                {!imagePreviewError ? (
                                    <img
                                        src={formData.imageUrl}
                                        alt="Resource preview"
                                        onError={() => setImagePreviewError(true)}
                                        style={{
                                            width: '100%',
                                            height: 180,
                                            objectFit: 'cover',
                                            display: 'block'
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        height: 180,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--text-secondary)',
                                        fontSize: 13
                                    }}>
                                        Unable to preview this image
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* NEW: summary panel */}
                    <div style={{
                        marginBottom: 24,
                        padding: '14px 16px',
                        background: 'rgba(52,211,153,0.06)',
                        border: '1px solid rgba(52,211,153,0.15)',
                        borderRadius: 'var(--radius-sm)'
                    }}>
                        <h4 style={{
                            margin: '0 0 8px 0',
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'var(--text-primary)'
                        }}>
                            Quick Summary
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                Type: <strong style={{ color: 'var(--text-primary)' }}>{formData.resourceType || '-'}</strong>
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                Status: <strong style={{ color: 'var(--text-primary)' }}>{formData.status || '-'}</strong>
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                Capacity: <strong style={{ color: 'var(--text-primary)' }}>{formData.capacity || '-'}</strong>
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                Amenities: <strong style={{ color: 'var(--text-primary)' }}>{selectedAmenitiesCount}</strong>
                            </span>
                        </div>
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

                    {/* NEW: unsaved hint */}
                    {formTouched && (
                        <p style={{
                            marginTop: 12,
                            fontSize: 11,
                            color: 'var(--text-secondary)',
                            textAlign: 'center'
                        }}>
                            You have unsaved changes in this form.
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ResourceForm;