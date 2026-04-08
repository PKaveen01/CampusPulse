import React, { useState, useMemo } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp, Wifi, Wind, Tv, Plug, Smartphone, MapPin, Building2, SlidersHorizontal, RotateCcw } from 'lucide-react';

const ResourceSearch = ({ onSearch, onClear, resourceTypes = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [filters, setFilters] = useState({
        type: '',
        minCapacity: '',
        maxCapacity: '',
        location: '',
        building: '',
        status: '',
        // Multi-select amenities
        amenities: []
    });
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);

    const statuses = ['ACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE', 'ACADEMIC_RESERVED'];

    // Available amenities for filtering
    const availableAmenities = [
        { id: 'isAirConditioned', name: 'Air Conditioned', icon: <Wind size={14} />, category: 'Comfort' },
        { id: 'hasProjector', name: 'Projector', icon: <Tv size={14} />, category: 'AV' },
        { id: 'hasSmartBoard', name: 'Smart Board', icon: <Smartphone size={14} />, category: 'AV' },
        { id: 'hasWifi', name: 'WiFi', icon: <Wifi size={14} />, category: 'Connectivity' },
        { id: 'hasPowerOutlets', name: 'Power Outlets', icon: <Plug size={14} />, category: 'Utility' }
    ];

    const quickFilterPresets = [
        { label: 'Active Only', action: () => handleQuickFilter({ status: 'ACTIVE' }) },
        { label: 'Large Venues', action: () => handleQuickFilter({ minCapacity: '100' }) },
        { label: 'Meeting Rooms', action: () => handleQuickFilter({ type: 'Meeting Room' }) },
        { label: 'WiFi Enabled', action: () => handleQuickFilter({ amenities: ['hasWifi'] }) },
        { label: 'Projector Ready', action: () => handleQuickFilter({ amenities: ['hasProjector'] }) }
    ];

    const updateActiveCount = (newFilters, currentSearchTerm = searchTerm) => {
        let count = 0;
        if (currentSearchTerm && currentSearchTerm.trim()) count++;
        if (newFilters.type) count++;
        if (newFilters.minCapacity) count++;
        if (newFilters.maxCapacity) count++;
        if (newFilters.location) count++;
        if (newFilters.building) count++;
        if (newFilters.status) count++;
        count += newFilters.amenities.length;
        setActiveFiltersCount(count);
    };

    const handleAmenityToggle = (amenityId) => {
        const newAmenities = filters.amenities.includes(amenityId)
            ? filters.amenities.filter(a => a !== amenityId)
            : [...filters.amenities, amenityId];
        const newFilters = { ...filters, amenities: newAmenities };
        setFilters(newFilters);
        updateActiveCount(newFilters);
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        updateActiveCount(newFilters);
    };

    const handleQuickFilter = (quickValues) => {
        const mergedFilters = {
            ...filters,
            ...quickValues,
            amenities: quickValues.amenities !== undefined ? quickValues.amenities : filters.amenities
        };
        setFilters(mergedFilters);
        setShowFilters(true);
        updateActiveCount(mergedFilters);
    };

    const handleSearch = () => {
        const activeFilters = {};
        if (searchTerm) activeFilters.searchTerm = searchTerm;
        if (filters.type) activeFilters.type = filters.type;
        if (filters.minCapacity) activeFilters.minCapacity = parseInt(filters.minCapacity);
        if (filters.maxCapacity) activeFilters.maxCapacity = parseInt(filters.maxCapacity);
        if (filters.location) activeFilters.location = filters.location;
        if (filters.building) activeFilters.building = filters.building;
        if (filters.status) activeFilters.status = filters.status;
        
        // Add amenities filters
        if (filters.amenities.length > 0) {
            filters.amenities.forEach(amenity => {
                activeFilters[amenity] = true;
            });
        }
        
        onSearch(activeFilters);
    };

    const handleClear = () => {
        setSearchTerm('');
        setFilters({
            type: '',
            minCapacity: '',
            maxCapacity: '',
            location: '',
            building: '',
            status: '',
            amenities: []
        });
        setActiveFiltersCount(0);
        setShowAdvanced(false);
        onClear();
    };

    const handleRemoveSingleFilter = (key, amenityId = null) => {
        if (key === 'searchTerm') {
            setSearchTerm('');
            updateActiveCount(filters, '');
            return;
        }

        if (key === 'amenities' && amenityId) {
            const newAmenities = filters.amenities.filter(item => item !== amenityId);
            const newFilters = { ...filters, amenities: newAmenities };
            setFilters(newFilters);
            updateActiveCount(newFilters);
            return;
        }

        const newFilters = { ...filters, [key]: '' };
        if (key === 'amenities') {
            newFilters.amenities = [];
        }
        setFilters(newFilters);
        updateActiveCount(newFilters);
    };

    // Group amenities by category
    const amenitiesByCategory = availableAmenities.reduce((acc, amenity) => {
        if (!acc[amenity.category]) acc[amenity.category] = [];
        acc[amenity.category].push(amenity);
        return acc;
    }, {});

    const activeFilterTags = useMemo(() => {
        const tags = [];

        if (searchTerm) {
            tags.push({ key: 'searchTerm', label: `Search: ${searchTerm}` });
        }
        if (filters.type) {
            tags.push({ key: 'type', label: `Type: ${filters.type}` });
        }
        if (filters.minCapacity) {
            tags.push({ key: 'minCapacity', label: `Min Capacity: ${filters.minCapacity}` });
        }
        if (filters.maxCapacity) {
            tags.push({ key: 'maxCapacity', label: `Max Capacity: ${filters.maxCapacity}` });
        }
        if (filters.location) {
            tags.push({ key: 'location', label: `Location: ${filters.location}` });
        }
        if (filters.building) {
            tags.push({ key: 'building', label: `Building: ${filters.building}` });
        }
        if (filters.status) {
            tags.push({ key: 'status', label: `Status: ${filters.status.replace('_', ' ')}` });
        }
        if (filters.amenities.length > 0) {
            filters.amenities.forEach(amenityId => {
                const amenity = availableAmenities.find(item => item.id === amenityId);
                if (amenity) {
                    tags.push({
                        key: 'amenities',
                        amenityId,
                        label: amenity.name
                    });
                }
            });
        }

        return tags;
    }, [searchTerm, filters]);

    return (
        <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            padding: 20,
            marginBottom: 24,
            animation: 'fadeIn 0.4s ease'
        }}>
            {/* Header Summary */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                marginBottom: 16,
                flexWrap: 'wrap'
            }}>
                <div>
                    <h3 style={{
                        margin: 0,
                        fontSize: 16,
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}>
                        <SlidersHorizontal size={16} />
                        Search & Filter Resources
                    </h3>
                    <p style={{
                        margin: '4px 0 0 0',
                        fontSize: 12,
                        color: 'var(--text-secondary)'
                    }}>
                        Find facilities by type, capacity, building, location, status, and amenities
                    </p>
                </div>

                {activeFiltersCount > 0 && (
                    <div style={{
                        padding: '6px 10px',
                        borderRadius: 20,
                        background: 'rgba(79,142,247,0.12)',
                        color: 'var(--accent)',
                        fontSize: 12,
                        fontWeight: 600
                    }}>
                        {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
                    <Search size={18} style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)'
                    }} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            updateActiveCount(filters, e.target.value);
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search by name, description, or tags..."
                        style={{
                            width: '100%',
                            padding: '10px 12px 10px 40px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            transition: 'all 0.2s'
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 16px',
                        background: showFilters ? 'rgba(79,142,247,0.1)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${showFilters ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-sm)',
                        color: showFilters ? 'var(--accent)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        transition: 'all 0.2s'
                    }}
                >
                    <Filter size={16} />
                    Filters
                    {activeFiltersCount > 0 && (
                        <span style={{
                            background: 'var(--accent)',
                            color: 'white',
                            fontSize: 10,
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: 10,
                            marginLeft: 4
                        }}>
                            {activeFiltersCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={handleSearch}
                    style={{
                        padding: '8px 28px',
                        background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    Search
                </button>
            </div>

            {/* Quick Filters */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                marginTop: 14
            }}>
                {quickFilterPresets.map((preset, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={preset.action}
                        style={{
                            padding: '6px 12px',
                            borderRadius: 20,
                            border: '1px solid var(--border)',
                            background: 'rgba(255,255,255,0.04)',
                            color: 'var(--text-secondary)',
                            fontSize: 12,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'var(--accent)';
                            e.currentTarget.style.color = 'var(--accent)';
                            e.currentTarget.style.background = 'rgba(79,142,247,0.08)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        }}
                    >
                        {preset.label}
                    </button>
                ))}
            </div>

            {/* Active Filter Tags */}
            {activeFilterTags.length > 0 && (
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: '1px dashed var(--border)'
                }}>
                    {activeFilterTags.map((tag, index) => (
                        <span
                            key={`${tag.key}-${tag.amenityId || index}`}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '5px 10px',
                                borderRadius: 16,
                                background: 'rgba(79,142,247,0.1)',
                                color: 'var(--accent)',
                                fontSize: 12,
                                fontWeight: 500
                            }}
                        >
                            {tag.label}
                            <button
                                type="button"
                                onClick={() => handleRemoveSingleFilter(tag.key, tag.amenityId)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--accent)',
                                    cursor: 'pointer',
                                    padding: 0
                                }}
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>
            )}
            
            {showFilters && (
                <div style={{
                    marginTop: 20,
                    paddingTop: 20,
                    borderTop: '1px solid var(--border)'
                }}>
                    {/* Filter Description */}
                    <div style={{
                        marginBottom: 16,
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px dashed var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-secondary)',
                        fontSize: 12
                    }}>
                        Use these filters to narrow down the facilities catalogue with more realistic operational criteria.
                    </div>

                    {/* Basic Filters */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 16,
                        marginBottom: 16
                    }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>
                                Resource Type
                            </label>
                            <select
                                value={filters.type}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="">All Types</option>
                                {resourceTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>
                                Capacity Range
                            </label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input
                                    type="number"
                                    value={filters.minCapacity}
                                    onChange={(e) => handleFilterChange('minCapacity', e.target.value)}
                                    placeholder="Min"
                                    min="0"
                                    style={{
                                        width: '50%',
                                        padding: '8px 12px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--text-primary)',
                                        outline: 'none'
                                    }}
                                />
                                <input
                                    type="number"
                                    value={filters.maxCapacity}
                                    onChange={(e) => handleFilterChange('maxCapacity', e.target.value)}
                                    placeholder="Max"
                                    min="0"
                                    style={{
                                        width: '50%',
                                        padding: '8px 12px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--text-primary)',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                            {(filters.minCapacity || filters.maxCapacity) && (
                                <p style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                                    Filtering by seating or usage capacity
                                </p>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>
                                Building
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Building2 size={14} style={{
                                    position: 'absolute',
                                    left: 10,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)'
                                }} />
                                <input
                                    type="text"
                                    value={filters.building}
                                    onChange={(e) => handleFilterChange('building', e.target.value)}
                                    placeholder="Building name"
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px 8px 32px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--text-primary)',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>
                                Status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="">All Status</option>
                                {statuses.map(status => (
                                    <option key={status} value={status}>
                                        {status.replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* NEW: Location field added using existing filter state */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 16,
                        marginBottom: 16
                    }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>
                                Location Details
                            </label>
                            <div style={{ position: 'relative' }}>
                                <MapPin size={14} style={{
                                    position: 'absolute',
                                    left: 10,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)'
                                }} />
                                <input
                                    type="text"
                                    value={filters.location}
                                    onChange={(e) => handleFilterChange('location', e.target.value)}
                                    placeholder="Room number, wing, area..."
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px 8px 32px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--text-primary)',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-end'
                        }}>
                            <div style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'rgba(79,142,247,0.06)',
                                border: '1px solid rgba(79,142,247,0.12)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-secondary)',
                                fontSize: 12
                            }}>
                                Tip: combine building + location + amenities for more accurate results.
                            </div>
                        </div>
                    </div>

                    {/* Advanced Filters Toggle */}
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 12,
                            color: 'var(--accent)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            marginBottom: 16
                        }}
                    >
                        {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {showAdvanced ? 'Hide Amenities' : 'Filter by Amenities'}
                    </button>

                    {/* Amenities Multi-Select */}
                    {showAdvanced && (
                        <div style={{ marginBottom: 16 }}>
                            {Object.entries(amenitiesByCategory).map(([category, amenities]) => (
                                <div key={category} style={{ marginBottom: 12 }}>
                                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.5px' }}>
                                        {category.toUpperCase()}
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                                        {amenities.map(amenity => (
                                            <label
                                                key={amenity.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                    cursor: 'pointer',
                                                    fontSize: 12,
                                                    color: filters.amenities.includes(amenity.id) ? 'var(--accent)' : 'var(--text-secondary)',
                                                    padding: '4px 8px',
                                                    background: filters.amenities.includes(amenity.id) ? 'rgba(79,142,247,0.1)' : 'transparent',
                                                    borderRadius: 'var(--radius-sm)',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={filters.amenities.includes(amenity.id)}
                                                    onChange={() => handleAmenityToggle(amenity.id)}
                                                    style={{ accentColor: 'var(--accent)' }}
                                                />
                                                {amenity.icon}
                                                {amenity.name}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingTop: 8, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            Use filters to narrow down operationally suitable resources.
                        </div>

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                onClick={handleClear}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '6px 16px',
                                    background: 'transparent',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    fontSize: 12,
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.color = 'var(--danger)';
                                    e.currentTarget.style.borderColor = 'var(--danger)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.color = 'var(--text-muted)';
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                }}
                            >
                                <RotateCcw size={13} />
                                Clear All
                            </button>

                            <button
                                onClick={handleSearch}
                                style={{
                                    padding: '6px 16px',
                                    background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: 12,
                                    fontWeight: 600
                                }}
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourceSearch;