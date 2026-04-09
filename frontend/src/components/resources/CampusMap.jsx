import React, { useState, useEffect } from 'react';
import { Building2, Users, Wifi, Wind, Tv, X, MapPin, Loader } from 'lucide-react';
import resourceService from '../../services/resourceService';

// ========== YOUR ACTUAL CAMPUS BUILDINGS ==========
const buildingLocations = [
    { 
        id: 1, 
        name: 'New Academic Building', 
        type: 'Academic', 
        x: 150, 
        y: 120, 
        color: '#4f8ef7',
        floors: 14,
        faculties: ['Faculty of Computing', 'Faculty of Business', 'Faculty of Engineering', 'Faculty of Science']
    },
    { 
        id: 2, 
        name: 'Main Building', 
        type: 'Administrative', 
        x: 350, 
        y: 100, 
        color: '#34d399',
        floors: 8,
        faculties: ['Administration', 'Student Services', 'Lecture Halls']
    },
    { 
        id: 3, 
        name: 'Engineering Building', 
        type: 'Engineering', 
        x: 550, 
        y: 150, 
        color: '#fbbf24',
        floors: 6,
        faculties: ['Faculty of Engineering']
    },
    { 
        id: 4, 
        name: 'School of Business', 
        type: 'Business', 
        x: 250, 
        y: 300, 
        color: '#a78bfa',
        floors: 5,
        faculties: ['Faculty of Business']
    },
    { 
        id: 5, 
        name: 'William Angliss Institute', 
        type: 'Hospitality', 
        x: 500, 
        y: 320, 
        color: '#f97316',
        floors: 4,
        faculties: ['Hospitality Management', 'Culinary Arts']
    },
    { 
        id: 6, 
        name: 'Library', 
        type: 'Study', 
        x: 400, 
        y: 220, 
        color: '#ec4899',
        floors: 4,
        faculties: ['All Faculties']
    },
    { 
        id: 7, 
        name: 'Sports Complex', 
        type: 'Recreation', 
        x: 650, 
        y: 280, 
        color: '#06b6d4',
        floors: 2,
        faculties: ['All Faculties']
    },
    { 
        id: 8, 
        name: 'Student Center', 
        type: 'Amenities', 
        x: 100, 
        y: 250, 
        color: '#84cc16',
        floors: 3,
        faculties: ['All Faculties']
    }
];

// Function to determine which building a resource belongs to
const getBuildingFromResource = (resource) => {
    const location = resource.location?.toLowerCase() || '';
    const building = resource.building?.toLowerCase() || '';
    const name = resource.name?.toLowerCase() || '';
    
    // New Academic Building - 14 floors
    if (location.includes('new academic') || building.includes('new academic') || 
        name.includes('new academic') || (location.includes('floor') && !building.includes('engineering'))) {
        return 'New Academic Building';
    }
    
    // Main Building
    if (location.includes('main building') || building.includes('main') || 
        name.includes('main building')) {
        return 'Main Building';
    }
    
    // Engineering Building
    if (location.includes('engineering') || building.includes('engineering') || 
        name.includes('engineering') || location.includes('fac of eng')) {
        return 'Engineering Building';
    }
    
    // School of Business
    if (location.includes('business') || building.includes('business') || 
        name.includes('business') || location.includes('school of business')) {
        return 'School of Business';
    }
    
    // William Angliss Institute
    if (location.includes('william angliss') || building.includes('angliss') || 
        name.includes('angliss') || location.includes('hospitality')) {
        return 'William Angliss Institute';
    }
    
    // Library
    if (location.includes('library') || building.includes('library') || 
        name.includes('library')) {
        return 'Library';
    }
    
    // Sports Complex
    if (location.includes('sports') || building.includes('sports') || 
        name.includes('gym') || location.includes('sport')) {
        return 'Sports Complex';
    }
    
    // Student Center
    if (location.includes('student center') || building.includes('student') || 
        name.includes('cafeteria')) {
        return 'Student Center';
    }
    
    return 'Other';
};

// Function to get floor from resource
const getFloorFromResource = (resource) => {
    const location = resource.location?.toLowerCase() || '';
    const floorMatch = location.match(/floor\s*(\d+)/i);
    if (floorMatch) {
        return parseInt(floorMatch[1]);
    }
    return null;
};

// Function to get faculty from resource
const getFacultyFromResource = (resource) => {
    const location = resource.location?.toLowerCase() || '';
    const name = resource.name?.toLowerCase() || '';
    
    if (location.includes('computing') || name.includes('computing') || location.includes('it')) return 'Faculty of Computing';
    if (location.includes('engineering') || name.includes('engineering')) return 'Faculty of Engineering';
    if (location.includes('business') || name.includes('business')) return 'Faculty of Business';
    if (location.includes('science') || name.includes('science')) return 'Faculty of Science';
    if (location.includes('hospitality') || name.includes('culinary')) return 'Hospitality Management';
    
    return 'General';
};

const CampusMap = ({ onResourceClick, onClose }) => {
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [hoveredBuilding, setHoveredBuilding] = useState(null);
    const [selectedFloor, setSelectedFloor] = useState(null);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [buildingResources, setBuildingResources] = useState({});
    const [floorResources, setFloorResources] = useState({});

    // Fetch real resources from backend
    useEffect(() => {
        fetchRealResources();
    }, []);

    const fetchRealResources = async () => {
        try {
            setLoading(true);
            const data = await resourceService.getAllResources(0, 100);
            const allResources = data.content || [];
            setResources(allResources);
            
            // Group resources by building
            const grouped = {};
            const floorGrouped = {};
            
            buildingLocations.forEach(building => {
                grouped[building.name] = [];
                floorGrouped[building.name] = {};
                for (let i = 1; i <= building.floors; i++) {
                    floorGrouped[building.name][i] = [];
                }
            });
            grouped['Other'] = [];
            floorGrouped['Other'] = {};
            
            allResources.forEach(resource => {
                const buildingName = getBuildingFromResource(resource);
                if (grouped[buildingName]) {
                    grouped[buildingName].push(resource);
                    
                    // Group by floor
                    const floor = getFloorFromResource(resource);
                    if (floor && floorGrouped[buildingName] && floorGrouped[buildingName][floor]) {
                        floorGrouped[buildingName][floor].push(resource);
                    } else if (floorGrouped[buildingName]) {
                        // If floor not specified, put in "Various" 
                        if (!floorGrouped[buildingName]['various']) {
                            floorGrouped[buildingName]['various'] = [];
                        }
                        floorGrouped[buildingName]['various'].push(resource);
                    }
                } else {
                    grouped['Other'].push(resource);
                }
            });
            
            setBuildingResources(grouped);
            setFloorResources(floorGrouped);
        } catch (error) {
            console.error('Failed to fetch resources:', error);
        } finally {
            setLoading(false);
        }
    };

    const getResourcesForBuilding = (buildingName) => {
        return buildingResources[buildingName] || [];
    };

    const getResourceCountByStatus = (resources, status) => {
        return resources.filter(r => r.status === status).length;
    };

    const getResourcesByFloor = (buildingName, floor) => {
        return floorResources[buildingName]?.[floor] || [];
    };

    if (loading) {
        return (
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader size={40} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>Loading campus map...</p>
                </div>
            </div>
        );
    }

    const selectedBuildingData = buildingLocations.find(b => b.name === selectedBuilding?.name);

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 24px',
                background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10
            }}>
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MapPin size={20} style={{ color: 'var(--accent)' }} />
                        SLIIT Campus Map - Interactive Resource Locator
                    </h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                        {resources.length} total resources | {buildingLocations.length} buildings | Click any building to view resources by floor
                    </p>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        padding: '8px 16px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                    }}
                >
                    <X size={16} /> Close
                </button>
            </div>

            {/* Map Container */}
            <div style={{ flex: 1, display: 'flex', padding: '20px', gap: 20, minHeight: 0 }}>
                {/* SVG Map */}
                <div style={{
                    flex: 2,
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    overflow: 'auto',
                    position: 'relative'
                }}>
                    <svg
                        viewBox="0 0 800 500"
                        style={{ width: '100%', height: '100%', background: '#1a1f2e' }}
                    >
                        {/* Background Grid */}
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
                            </pattern>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>
                        
                        <rect width="800" height="500" fill="url(#grid)"/>
                        
                        {/* Campus Roads */}
                        <path d="M 0 200 L 800 200" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="10,5"/>
                        <path d="M 400 0 L 400 500" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="10,5"/>
                        <path d="M 0 350 L 800 350" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="8,4"/>
                        
                        {/* Campus Green Areas */}
                        <ellipse cx="200" cy="400" rx="60" ry="30" fill="rgba(52,211,153,0.1)" />
                        <ellipse cx="600" cy="100" rx="50" ry="25" fill="rgba(52,211,153,0.1)" />
                        
                        {/* Buildings */}
                        {buildingLocations.map(building => {
                            const buildingRes = getResourcesForBuilding(building.name);
                            const resourceCount = buildingRes.length;
                            
                            return (
                                <g key={building.id}>
                                    {/* Building Shadow */}
                                    <rect
                                        x={building.x - 40}
                                        y={building.y - 30}
                                        width="80"
                                        height="60"
                                        rx="8"
                                        fill="rgba(0,0,0,0.3)"
                                        transform={`translate(4, 4)`}
                                    />
                                    
                                    {/* Building Rectangle */}
                                    <rect
                                        x={building.x - 40}
                                        y={building.y - 30}
                                        width="80"
                                        height="60"
                                        rx="8"
                                        fill={hoveredBuilding === building.id ? `${building.color}30` : `${building.color}15`}
                                        stroke={hoveredBuilding === building.id ? building.color : `${building.color}80`}
                                        strokeWidth={hoveredBuilding === building.id ? 2.5 : 1.5}
                                        cursor="pointer"
                                        filter={hoveredBuilding === building.id ? "url(#glow)" : "none"}
                                        onMouseEnter={() => setHoveredBuilding(building.id)}
                                        onMouseLeave={() => setHoveredBuilding(null)}
                                        onClick={() => setSelectedBuilding(building)}
                                        style={{ transition: 'all 0.2s' }}
                                    />
                                    
                                    {/* Building Icon */}
                                    <Building2
                                        x={building.x - 14}
                                        y={building.y - 14}
                                        size={28}
                                        color={hoveredBuilding === building.id ? building.color : '#fff'}
                                        style={{ opacity: hoveredBuilding === building.id ? 1 : 0.7 }}
                                        cursor="pointer"
                                        onMouseEnter={() => setHoveredBuilding(building.id)}
                                        onMouseLeave={() => setHoveredBuilding(null)}
                                        onClick={() => setSelectedBuilding(building)}
                                    />
                                    
                                    {/* Building Name Label */}
                                    <text
                                        x={building.x}
                                        y={building.y + 40}
                                        textAnchor="middle"
                                        fill={hoveredBuilding === building.id ? building.color : 'rgba(255,255,255,0.7)'}
                                        fontSize="8"
                                        fontWeight="600"
                                        cursor="pointer"
                                        onMouseEnter={() => setHoveredBuilding(building.id)}
                                        onMouseLeave={() => setHoveredBuilding(null)}
                                        onClick={() => setSelectedBuilding(building)}
                                    >
                                        {building.name.split(' ').slice(0, 2).join('\n')}
                                    </text>
                                    
                                    {/* Floor Count Badge */}
                                    {building.floors > 1 && (
                                        <g transform={`translate(${building.x + 35}, ${building.y - 25})`}>
                                            <rect x="-15" y="-10" width="30" height="20" rx="10" fill={building.color} stroke="white" strokeWidth="1.5"/>
                                            <text x="0" y="4" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">
                                                {building.floors}F
                                            </text>
                                        </g>
                                    )}
                                    
                                    {/* Resource Count Badge */}
                                    {resourceCount > 0 && (
                                        <g transform={`translate(${building.x - 35}, ${building.y - 25})`}>
                                            <circle r="12" fill={building.color} stroke="white" strokeWidth="2" />
                                            <text x="0" y="4" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                                                {resourceCount}
                                            </text>
                                        </g>
                                    )}
                                </g>
                            );
                        })}
                        
                        {/* Map Legend */}
                        <g transform="translate(20, 450)">
                            <rect x="0" y="0" width="420" height="40" rx="8" fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                            {buildingLocations.slice(0, 5).map((building, i) => (
                                <g key={i} transform={`translate(${10 + i * 82}, 12)`}>
                                    <rect x="0" y="0" width="12" height="12" rx="2" fill={building.color} />
                                    <text x="16" y="10" fill="rgba(255,255,255,0.7)" fontSize="9">{building.type}</text>
                                </g>
                            ))}
                        </g>
                    </svg>
                </div>

                {/* Sidebar - Selected Building Details */}
                <div style={{
                    width: selectedBuilding ? '380px' : '0',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius)',
                    border: selectedBuilding ? '1px solid var(--border)' : 'none',
                    overflow: 'hidden',
                    transition: 'width 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {selectedBuilding && selectedBuildingData && (
                        <>
                            <div style={{
                                padding: '20px',
                                borderBottom: '1px solid var(--border)',
                                background: `${selectedBuildingData.color}10`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <Building2 size={28} color={selectedBuildingData.color} />
                                        <div>
                                            <h3 style={{ fontSize: 18, fontWeight: 600 }}>{selectedBuildingData.name}</h3>
                                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                {selectedBuildingData.type} • {selectedBuildingData.floors} Floors
                                            </p>
                                            {selectedBuildingData.faculties && (
                                                <p style={{ fontSize: 11, color: 'var(--accent)', marginTop: 4 }}>
                                                    {selectedBuildingData.faculties.join(' • ')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedBuilding(null);
                                            setSelectedFloor(null);
                                        }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                            
                            <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
                                {/* Floor Selector */}
                                {selectedBuildingData.floors > 1 && (
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>
                                            Select Floor
                                        </label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                            <button
                                                onClick={() => setSelectedFloor(null)}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: !selectedFloor ? 'linear-gradient(135deg, var(--accent), var(--accent-2))' : 'rgba(255,255,255,0.05)',
                                                    border: 'none',
                                                    borderRadius: 'var(--radius-sm)',
                                                    color: !selectedFloor ? 'white' : 'var(--text-secondary)',
                                                    cursor: 'pointer',
                                                    fontSize: 12
                                                }}
                                            >
                                                All Floors
                                            </button>
                                            {[...Array(selectedBuildingData.floors)].map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setSelectedFloor(i + 1)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: selectedFloor === i + 1 ? 'linear-gradient(135deg, var(--accent), var(--accent-2))' : 'rgba(255,255,255,0.05)',
                                                        border: 'none',
                                                        borderRadius: 'var(--radius-sm)',
                                                        color: selectedFloor === i + 1 ? 'white' : 'var(--text-secondary)',
                                                        cursor: 'pointer',
                                                        fontSize: 12
                                                    }}
                                                >
                                                    Floor {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Resource Count Summary */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                                    <div>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Resources</span>
                                        <div style={{ fontSize: 20, fontWeight: 700, color: selectedBuildingData.color }}>
                                            {getResourcesForBuilding(selectedBuilding.name).length}
                                        </div>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Active</span>
                                        <div style={{ fontSize: 20, fontWeight: 700, color: '#34d399' }}>
                                            {getResourceCountByStatus(getResourcesForBuilding(selectedBuilding.name), 'ACTIVE')}
                                        </div>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Maintenance</span>
                                        <div style={{ fontSize: 20, fontWeight: 700, color: '#fbbf24' }}>
                                            {getResourceCountByStatus(getResourcesForBuilding(selectedBuilding.name), 'MAINTENANCE')}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Resources List */}
                                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                                    {selectedFloor ? `Floor ${selectedFloor} Resources` : 'All Resources'}
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {(() => {
                                        let resourcesToShow = selectedFloor 
                                            ? getResourcesByFloor(selectedBuilding.name, selectedFloor)
                                            : getResourcesForBuilding(selectedBuilding.name);
                                        
                                        if (resourcesToShow.length === 0 && selectedFloor) {
                                            resourcesToShow = getResourcesByFloor(selectedBuilding.name, 'various') || [];
                                        }
                                        
                                        if (resourcesToShow.length === 0) {
                                            return (
                                                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                                                    No resources found {selectedFloor ? `on Floor ${selectedFloor}` : 'in this building'}
                                                </div>
                                            );
                                        }
                                        
                                        return resourcesToShow.map(resource => (
                                            <div
                                                key={resource.id}
                                                onClick={() => onResourceClick(resource)}
                                                style={{
                                                    padding: '14px',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    border: '1px solid var(--border)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.background = 'rgba(79,142,247,0.1)';
                                                    e.currentTarget.style.borderColor = 'var(--accent)';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                                    e.currentTarget.style.borderColor = 'var(--border)';
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                                    <span style={{ fontWeight: 600, fontSize: 14 }}>{resource.name}</span>
                                                    <span style={{
                                                        fontSize: 10,
                                                        padding: '2px 10px',
                                                        borderRadius: 12,
                                                        background: resource.status === 'ACTIVE' ? 'rgba(52,211,153,0.15)' : resource.status === 'MAINTENANCE' ? 'rgba(251,191,36,0.15)' : 'rgba(248,113,113,0.15)',
                                                        color: resource.status === 'ACTIVE' ? '#34d399' : resource.status === 'MAINTENANCE' ? '#fbbf24' : '#f87171'
                                                    }}>
                                                        {resource.status}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                                                    <Users size={12} /> Capacity: {resource.capacity} people
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                                                    {resource.isAirConditioned && <span style={{ fontSize: 10, background: 'rgba(79,142,247,0.1)', padding: '2px 8px', borderRadius: 12 }}>❄️ AC</span>}
                                                    {resource.hasProjector && <span style={{ fontSize: 10, background: 'rgba(79,142,247,0.1)', padding: '2px 8px', borderRadius: 12 }}>📽️ Projector</span>}
                                                    {resource.hasSmartBoard && <span style={{ fontSize: 10, background: 'rgba(79,142,247,0.1)', padding: '2px 8px', borderRadius: 12 }}>📱 Smart Board</span>}
                                                    {resource.hasWifi && <span style={{ fontSize: 10, background: 'rgba(79,142,247,0.1)', padding: '2px 8px', borderRadius: 12 }}>📶 WiFi</span>}
                                                </div>
                                                <button
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px',
                                                        background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                                                        border: 'none',
                                                        borderRadius: 'var(--radius-sm)',
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        fontSize: 12,
                                                        fontWeight: 500,
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Footer Stats */}
            <div style={{
                padding: '12px 24px',
                background: 'var(--bg-card)',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 12,
                color: 'var(--text-muted)',
                flexWrap: 'wrap',
                gap: 8
            }}>
                <div>🏫 {buildingLocations.length} Buildings on Campus</div>
                <div>📚 Total Resources: {resources.length}</div>
                <div>✅ Active: {resources.filter(r => r.status === 'ACTIVE').length}</div>
                <div>🔧 Maintenance: {resources.filter(r => r.status === 'MAINTENANCE').length}</div>
                <div>🏢 New Academic Building: 14 Floors</div>
                <div>📍 Click any building to see resources by floor</div>
            </div>

            {/* Keyframe animation */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default CampusMap;