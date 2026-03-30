import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp, Wifi, Wind, Tv, Plug, Smartphone } from 'lucide-react';

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

    const updateActiveCount = (newFilters) => {
        let count = 0;
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
        onClear();
    };

    // Group amenities by category
    const amenitiesByCategory = availableAmenities.reduce((acc, amenity) => {
        if (!acc[amenity.category]) acc[amenity.category] = [];
        acc[amenity.category].push(amenity);
        return acc;
    }, {});

    return (
        <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            padding: 20,
            marginBottom: 24,
            animation: 'fadeIn 0.4s ease'
        }}>
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
                        onChange={(e) => setSearchTerm(e.target.value)}
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
            
            {showFilters && (
                <div style={{
                    marginTop: 20,
                    paddingTop: 20,
                    borderTop: '1px solid var(--border)'
                }}>
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
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>
                                Building
                            </label>
                            <input
                                type="text"
                                value={filters.building}
                                onChange={(e) => handleFilterChange('building', e.target.value)}
                                placeholder="Building name"
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-primary)',
                                    outline: 'none'
                                }}
                            />
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
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                        <button
                            onClick={handleClear}
                            style={{
                                padding: '6px 16px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: 12,
                                transition: 'color 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                            Clear All
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourceSearch;