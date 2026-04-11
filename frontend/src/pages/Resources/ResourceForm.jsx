import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Clock, Image as ImageIcon } from 'lucide-react';

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
    const [availabilityWindows, setAvailabilityWindows] = useState([]);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [imagePreviewError, setImagePreviewError] = useState(false);
    const [formTouched, setFormTouched] = useState(false);
    const [loadingWindows, setLoadingWindows] = useState(false);
    const [selectedSuggestedImage, setSelectedSuggestedImage] = useState('');

    // Suggested images based on resource type
    const suggestedImages = {
        'Lecture Hall': [
            { url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400', name: 'Modern Lecture Hall' },
            { url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400', name: 'Smart Lecture Hall' },
            { url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400', name: 'University Lecture Hall' },
        ],
        'Meeting Room': [
            { url: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=400', name: 'Executive Meeting Room' },
            { url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400', name: 'Modern Conference Room' },
            { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', name: 'Small Meeting Space' },
        ],
        'Laboratory': [
            { url: 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=400', name: 'Computer Lab' },
            { url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400', name: 'Science Lab' },
            { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', name: 'Research Lab' },
        ],
        'Study Room': [
            { url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400', name: 'Quiet Study Room' },
            { url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400', name: 'Group Study Area' },
        ],
        'Auditorium': [
            { url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400', name: 'Main Auditorium' },
            { url: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400', name: 'Outdoor Amphitheater' },
        ],
        'Equipment': [
            { url: 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=400', name: 'Projector Equipment' },
            { url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400', name: 'Camera Equipment' },
        ]
    };

    const resourceTypes = ['Lecture Hall', 'Laboratory', 'Meeting Room', 'Projector', 'Camera', 'Computer Lab', 'Study Room', 'Auditorium', 'Seminar Room'];

    const daysOfWeek = [
        { value: 0, label: 'Monday' },
        { value: 1, label: 'Tuesday' },
        { value: 2, label: 'Wednesday' },
        { value: 3, label: 'Thursday' },
        { value: 4, label: 'Friday' },
        { value: 5, label: 'Saturday' },
        { value: 6, label: 'Sunday' }
    ];

    useEffect(() => {
        if (resource && resource.id && isEditing) {
            fetchAvailabilityWindows();
        }
    }, [resource]);

    const fetchAvailabilityWindows = async () => {
        setLoadingWindows(true);
        try {
            const response = await fetch(`/api/resources/${resource.id}/availability`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            });
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                setAvailabilityWindows(data);
            } else {
                setAvailabilityWindows([{ id: null, dayOfWeek: 0, startTime: '09:00', endTime: '17:00' }]);
            }
        } catch (error) {
            console.error('Failed to fetch availability windows:', error);
            setAvailabilityWindows([{ id: null, dayOfWeek: 0, startTime: '09:00', endTime: '17:00' }]);
        } finally {
            setLoadingWindows(false);
        }
    };

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

    useEffect(() => {
        setImagePreviewError(false);
    }, [formData.imageUrl]);

    // Update suggested images when resource type changes
    useEffect(() => {
        const images = suggestedImages[formData.resourceType];
        if (images && images.length > 0 && !formData.imageUrl) {
            setSelectedSuggestedImage('');
        }
    }, [formData.resourceType]);

    const addAvailabilityWindow = () => {
        setAvailabilityWindows([...availabilityWindows, { id: null, dayOfWeek: 0, startTime: '09:00', endTime: '17:00' }]);
        setFormTouched(true);
    };

    const updateAvailabilityWindow = (index, field, value) => {
        const updated = [...availabilityWindows];
        updated[index][field] = value;
        setAvailabilityWindows(updated);
        setFormTouched(true);
    };

    const removeAvailabilityWindow = async (index) => {
        const windowToRemove = availabilityWindows[index];
        if (windowToRemove.id) {
            try {
                await fetch(`/api/resources/availability/${windowToRemove.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
                });
            } catch (error) {
                console.error('Failed to delete availability window:', error);
            }
        }
        const updated = availabilityWindows.filter((_, i) => i !== index);
        setAvailabilityWindows(updated);
        setFormTouched(true);
    };

    const useSuggestedImage = (imageUrl) => {
        setFormData(prev => ({ ...prev, imageUrl: imageUrl }));
        setSelectedSuggestedImage(imageUrl);
        setImagePreviewError(false);
        setFormTouched(true);
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Resource name is required';
        else if (formData.name.trim().length < 3) newErrors.name = 'Resource name must be at least 3 characters';

        if (!formData.capacity) newErrors.capacity = 'Capacity is required';
        else if (Number(formData.capacity) < 1) newErrors.capacity = 'Capacity must be at least 1';
        else if (Number(formData.capacity) > 500) newErrors.capacity = 'Capacity cannot exceed 500';

        if (!formData.location.trim()) newErrors.location = 'Location is required';
        else if (formData.location.trim().length < 2) newErrors.location = 'Location details are too short';

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

        for (let i = 0; i < availabilityWindows.length; i++) {
            const win = availabilityWindows[i];
            if (!win.startTime || !win.endTime) {
                newErrors[`window_${i}`] = 'Start and end times are required';
            } else if (win.startTime >= win.endTime) {
                newErrors[`window_${i}`] = 'End time must be after start time';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFieldBlur = (fieldName) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
        validate();
    };

    const handleFieldChange = (field, value) => {
        setFormTouched(true);
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const saveAvailabilityWindows = async (resourceId) => {
        if (!resourceId || availabilityWindows.length === 0) return;
        
        for (const window of availabilityWindows) {
            if (window.startTime && window.endTime) {
                await fetch(`/api/resources/availability`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    },
                    body: JSON.stringify({
                        resourceId: resourceId,
                        dayOfWeek: window.dayOfWeek,
                        startTime: window.startTime,
                        endTime: window.endTime
                    })
                });
            }
        }
    };

    const handleSubmit = async (e) => {
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
            const result = await onSubmit(formData);
            
            let resourceId = resource?.id;
            if (!resourceId && result && result.id) {
                resourceId = result.id;
            }
            
            if (resourceId && availabilityWindows.length > 0) {
                await saveAvailabilityWindows(resourceId);
            }
        }
    };

    const selectedAmenitiesCount = [
        formData.isAirConditioned,
        formData.hasProjector,
        formData.hasSmartBoard,
        formData.hasWifi,
        formData.hasPowerOutlets
    ].filter(Boolean).length;

    const capacityLabel = Number(formData.capacity) >= 100 ? 'Large capacity venue' :
                          Number(formData.capacity) >= 40 ? 'Medium capacity venue' :
                          Number(formData.capacity) >= 1 ? 'Small capacity venue' : '';

    const statusHelperText = {
        ACTIVE: 'This resource will appear as available for normal operations.',
        OUT_OF_SERVICE: 'Use this when the resource is temporarily unavailable.',
        MAINTENANCE: 'Use this when the resource is under maintenance or inspection.'
    };

    const currentSuggestedImages = suggestedImages[formData.resourceType] || suggestedImages['Meeting Room'];

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
                maxWidth: 680,
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
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
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
                    {/* Form Progress Bar */}
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
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Required fields: Name, Capacity, Location</span>
                        <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>Amenities selected: {selectedAmenitiesCount}</span>
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
                        />
                        {errors.name && touched.name && <p style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4 }}>{errors.name}</p>}
                        {!errors.name && formData.name && <p style={{ color: '#34d399', fontSize: 11, marginTop: 4 }}>Looks good</p>}
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
                                {resourceTypes.map(type => (<option key={type} value={type}>{type}</option>))}
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
                            {!errors.capacity && formData.capacity && <p style={{ color: 'var(--text-secondary)', fontSize: 11, marginTop: 4 }}>{capacityLabel}</p>}
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
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6 }}>{statusHelperText[formData.status]}</p>
                    </div>

                    {/* Availability Windows Section */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block',
                            fontSize: 13,
                            fontWeight: 600,
                            marginBottom: 10,
                            color: 'var(--text-primary)'
                        }}>
                            <Clock size={14} style={{ display: 'inline', marginRight: 6 }} />
                            Availability Windows (Recurring Weekly)
                        </label>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>Set when this resource is available for booking. These times repeat weekly.</p>

                        {loadingWindows ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
                            </div>
                        ) : (
                            <>
                                {availabilityWindows.map((window, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        gap: '10px',
                                        marginBottom: '12px',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        padding: '10px',
                                        background: 'rgba(255,255,255,0.02)',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--border)'
                                    }}>
                                        <select
                                            value={window.dayOfWeek}
                                            onChange={(e) => updateAvailabilityWindow(idx, 'dayOfWeek', parseInt(e.target.value))}
                                            style={{
                                                flex: 2,
                                                minWidth: '100px',
                                                padding: '8px 10px',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid var(--border)',
                                                borderRadius: 'var(--radius-sm)',
                                                color: 'var(--text-primary)',
                                                fontSize: '13px'
                                            }}
                                        >
                                            {daysOfWeek.map(day => (<option key={day.value} value={day.value}>{day.label}</option>))}
                                        </select>
                                        
                                        <input
                                            type="time"
                                            value={window.startTime}
                                            onChange={(e) => updateAvailabilityWindow(idx, 'startTime', e.target.value)}
                                            style={{
                                                flex: 1,
                                                padding: '8px 10px',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid var(--border)',
                                                borderRadius: 'var(--radius-sm)',
                                                color: 'var(--text-primary)',
                                                fontSize: '13px'
                                            }}
                                        />
                                        
                                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>to</span>
                                        
                                        <input
                                            type="time"
                                            value={window.endTime}
                                            onChange={(e) => updateAvailabilityWindow(idx, 'endTime', e.target.value)}
                                            style={{
                                                flex: 1,
                                                padding: '8px 10px',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid var(--border)',
                                                borderRadius: 'var(--radius-sm)',
                                                color: 'var(--text-primary)',
                                                fontSize: '13px'
                                            }}
                                        />
                                        
                                        <button
                                            type="button"
                                            onClick={() => removeAvailabilityWindow(idx)}
                                            style={{
                                                padding: '8px',
                                                background: 'rgba(239,68,68,0.1)',
                                                border: '1px solid rgba(239,68,68,0.2)',
                                                borderRadius: 'var(--radius-sm)',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title="Remove window"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                
                                <button
                                    type="button"
                                    onClick={addAvailabilityWindow}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '8px 16px',
                                        background: 'rgba(79,142,247,0.1)',
                                        border: '1px dashed rgba(79,142,247,0.3)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--accent)',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        marginTop: '8px',
                                        width: '100%',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Plus size={14} /> Add Availability Window
                                </button>
                            </>
                        )}
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                            <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>Add useful operational notes, features, or restrictions.</p>
                            <span style={{ fontSize: 11, color: formData.description.length > 450 ? 'var(--danger)' : 'var(--text-secondary)' }}>{formData.description.length}/500</span>
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
                                <input type="checkbox" checked={formData.isAirConditioned} onChange={(e) => handleFieldChange('isAirConditioned', e.target.checked)} style={{ accentColor: 'var(--accent)' }} /> Air Conditioned
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}>
                                <input type="checkbox" checked={formData.hasProjector} onChange={(e) => handleFieldChange('hasProjector', e.target.checked)} style={{ accentColor: 'var(--accent)' }} /> Projector
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}>
                                <input type="checkbox" checked={formData.hasSmartBoard} onChange={(e) => handleFieldChange('hasSmartBoard', e.target.checked)} style={{ accentColor: 'var(--accent)' }} /> Smart Board
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}>
                                <input type="checkbox" checked={formData.hasWifi} onChange={(e) => handleFieldChange('hasWifi', e.target.checked)} style={{ accentColor: 'var(--accent)' }} /> WiFi
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}>
                                <input type="checkbox" checked={formData.hasPowerOutlets} onChange={(e) => handleFieldChange('hasPowerOutlets', e.target.checked)} style={{ accentColor: 'var(--accent)' }} /> Power Outlets
                            </label>
                        </div>
                        <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)' }}>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Selected amenities: {selectedAmenitiesCount === 0 ? 'None selected' : selectedAmenitiesCount}</span>
                        </div>
                    </div>
                    
                    {/* Image URL with Suggested Images */}
                    <div style={{ marginBottom: 24 }}>
                        <label style={{
                            display: 'block',
                            fontSize: 13,
                            fontWeight: 500,
                            marginBottom: 6,
                            color: 'var(--text-secondary)'
                        }}>
                            <ImageIcon size={14} style={{ display: 'inline', marginRight: 6 }} />
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

                        {/* Suggested Images */}
                        {currentSuggestedImages && (
                            <div style={{ marginTop: 12 }}>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                                    Suggested Images for {formData.resourceType}:
                                </div>
                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                    {currentSuggestedImages.map((img, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => useSuggestedImage(img.url)}
                                            style={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: 'var(--radius-sm)',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                border: selectedSuggestedImage === img.url ? '2px solid var(--accent)' : '1px solid var(--border)',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <img
                                                src={img.url}
                                                alt={img.name}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Image Preview */}
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
                    
                    {/* Summary Panel */}
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
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                Availability Windows: <strong style={{ color: 'var(--text-primary)' }}>{availabilityWindows.length}</strong>
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

                    {formTouched && <p style={{ marginTop: 12, fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center' }}>You have unsaved changes in this form.</p>}
                </form>
            </div>
        </div>
    );
};

export default ResourceForm;