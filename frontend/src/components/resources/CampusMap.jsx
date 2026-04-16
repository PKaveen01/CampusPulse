import React, { useState, useEffect } from 'react';
import {
    Building2,
    Users,
    Wifi,
    Wind,
    Tv,
    X,
    MapPin,
    Loader,
    Sparkles,
    Activity,
    Layers3,
    ChevronRight,
    ShieldCheck,
    Wrench,
    AlertTriangle
} from 'lucide-react';
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
    if (
        location.includes('new academic') ||
        building.includes('new academic') ||
        name.includes('new academic') ||
        (location.includes('floor') && !building.includes('engineering'))
    ) {
        return 'New Academic Building';
    }

    // Main Building
    if (
        location.includes('main building') ||
        building.includes('main') ||
        name.includes('main building')
    ) {
        return 'Main Building';
    }

    // Engineering Building
    if (
        location.includes('engineering') ||
        building.includes('engineering') ||
        name.includes('engineering') ||
        location.includes('fac of eng')
    ) {
        return 'Engineering Building';
    }

    // School of Business
    if (
        location.includes('business') ||
        building.includes('business') ||
        name.includes('business') ||
        location.includes('school of business')
    ) {
        return 'School of Business';
    }

    // William Angliss Institute
    if (
        location.includes('william angliss') ||
        building.includes('angliss') ||
        name.includes('angliss') ||
        location.includes('hospitality')
    ) {
        return 'William Angliss Institute';
    }

    // Library
    if (
        location.includes('library') ||
        building.includes('library') ||
        name.includes('library')
    ) {
        return 'Library';
    }

    // Sports Complex
    if (
        location.includes('sports') ||
        building.includes('sports') ||
        name.includes('gym') ||
        location.includes('sport')
    ) {
        return 'Sports Complex';
    }

    // Student Center
    if (
        location.includes('student center') ||
        building.includes('student') ||
        name.includes('cafeteria')
    ) {
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

    const getResourceCountByStatus = (resourcesList, status) => {
        return resourcesList.filter(r => r.status === status).length;
    };

    const getResourcesByFloor = (buildingName, floor) => {
        return floorResources[buildingName]?.[floor] || [];
    };

    const getBuildingOperationalScore = (resourcesList) => {
        if (!resourcesList.length) return 0;
        const active = resourcesList.filter(r => r.status === 'ACTIVE').length;
        return Math.round((active / resourcesList.length) * 100);
    };

    const getAmenityCount = (resource) => {
        let count = 0;
        if (resource.isAirConditioned) count++;
        if (resource.hasProjector) count++;
        if (resource.hasSmartBoard) count++;
        if (resource.hasWifi) count++;
        if (resource.hasPowerOutlets) count++;
        return count;
    };

    const getResourceStatusStyles = (status) => {
        if (status === 'ACTIVE') {
            return {
                bg: 'rgba(52,211,153,0.15)',
                color: '#34d399',
                border: 'rgba(52,211,153,0.25)'
            };
        }
        if (status === 'MAINTENANCE') {
            return {
                bg: 'rgba(251,191,36,0.15)',
                color: '#fbbf24',
                border: 'rgba(251,191,36,0.25)'
            };
        }
        return {
            bg: 'rgba(248,113,113,0.15)',
            color: '#f87171',
            border: 'rgba(248,113,113,0.25)'
        };
    };

    if (loading) {
        return (
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}>
                <div style={{
                    textAlign: 'center',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)), var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '36px 40px',
                    minWidth: 280,
                    boxShadow: '0 20px 48px rgba(0,0,0,0.3)'
                }}>
                    <Loader size={40} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                    <p style={{ marginTop: 16, color: 'var(--text-muted)', fontSize: 14 }}>Loading campus map...</p>
                </div>
            </div>
        );
    }

    const selectedBuildingData = buildingLocations.find(b => b.name === selectedBuilding?.name);
    const selectedBuildingResources = selectedBuilding ? getResourcesForBuilding(selectedBuilding.name) : [];
    const selectedBuildingOperationalScore = getBuildingOperationalScore(selectedBuildingResources);

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.86)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000
        }}>
            {/* Header */}
            <div style={{
                padding: '18px 24px',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.01)), var(--bg-card)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10,
                boxShadow: '0 10px 24px rgba(0,0,0,0.12)'
            }}>
                <div>
                    <h2 style={{
                        fontSize: 22,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        color: 'var(--text-primary)',
                        marginBottom: 4
                    }}>
                        <div style={{
                            width: 38,
                            height: 38,
                            borderRadius: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(79,142,247,0.12)',
                            border: '1px solid rgba(79,142,247,0.18)'
                        }}>
                            <MapPin size={20} style={{ color: 'var(--accent)' }} />
                        </div>
                        SLIIT Smart Campus Resource Map
                    </h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                        Interactive campus visualization with real resource distribution, building-level insights, and floor-based exploration
                    </p>
                </div>

                <button
                    onClick={onClose}
                    style={{
                        padding: '10px 16px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontWeight: 600,
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(248,113,113,0.08)';
                        e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)';
                        e.currentTarget.style.color = '#f87171';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                >
                    <X size={16} /> Close
                </button>
            </div>

            {/* Top insights strip */}
            <div style={{
                padding: '12px 24px',
                background: 'rgba(255,255,255,0.02)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap'
            }}>
                <div style={{
                    padding: '8px 12px',
                    borderRadius: 999,
                    background: 'rgba(79,142,247,0.1)',
                    border: '1px solid rgba(79,142,247,0.18)',
                    fontSize: 12,
                    color: 'var(--accent)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}>
                    <Layers3 size={14} />
                    {resources.length} total resources
                </div>

                <div style={{
                    padding: '8px 12px',
                    borderRadius: 999,
                    background: 'rgba(52,211,153,0.1)',
                    border: '1px solid rgba(52,211,153,0.18)',
                    fontSize: 12,
                    color: '#34d399',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}>
                    <ShieldCheck size={14} />
                    {resources.filter(r => r.status === 'ACTIVE').length} active
                </div>

                <div style={{
                    padding: '8px 12px',
                    borderRadius: 999,
                    background: 'rgba(251,191,36,0.1)',
                    border: '1px solid rgba(251,191,36,0.18)',
                    fontSize: 12,
                    color: '#fbbf24',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}>
                    <Wrench size={14} />
                    {resources.filter(r => r.status === 'MAINTENANCE').length} in maintenance
                </div>

                <div style={{
                    padding: '8px 12px',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border)',
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}>
                    <Sparkles size={14} />
                    Click a building to explore floor-wise resources
                </div>
            </div>

            {/* Map Container */}
            <div style={{ flex: 1, display: 'flex', padding: '20px', gap: 20, minHeight: 0 }}>
                {/* SVG Map */}
                <div style={{
                    flex: 2,
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 18px 40px rgba(0,0,0,0.16)'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        zIndex: 5,
                        background: 'rgba(15,23,42,0.72)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 14,
                        padding: '12px 14px',
                        color: 'white',
                        maxWidth: 280
                    }}>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Campus overview</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)', lineHeight: 1.5 }}>
                            Building badges show resource counts. Hover to preview, click to open building insights and floor-level resource lists.
                        </div>
                    </div>

                    <svg
                        viewBox="0 0 800 500"
                        style={{
                            width: '100%',
                            height: '100%',
                            background: 'radial-gradient(circle at center, #1e2433, #141824)'
                        }}
                    >
                        {/* Background Grid */}
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                            </pattern>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                            <filter id="softShadow">
                                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(0,0,0,0.35)" />
                            </filter>
                        </defs>

                        <rect width="800" height="500" fill="url(#grid)" />

                        {/* Campus Roads */}
                        <path d="M 0 200 L 800 200" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="10,5" />
                        <path d="M 400 0 L 400 500" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="10,5" />
                        <path d="M 0 350 L 800 350" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="8,4" />

                        {/* Campus Green Areas */}
                        <ellipse cx="200" cy="400" rx="60" ry="30" fill="rgba(52,211,153,0.1)" />
                        <ellipse cx="600" cy="100" rx="50" ry="25" fill="rgba(52,211,153,0.1)" />

                        {/* Buildings */}
                        {buildingLocations.map(building => {
                            const buildingRes = getResourcesForBuilding(building.name);
                            const resourceCount = buildingRes.length;
                            const activeCount = getResourceCountByStatus(buildingRes, 'ACTIVE');
                            const hovered = hoveredBuilding === building.id;

                            return (
                                <g key={building.id}>
                                    {/* Building Shadow */}
                                    <rect
                                        x={building.x - 40}
                                        y={building.y - 30}
                                        width="80"
                                        height="60"
                                        rx="10"
                                        fill="rgba(0,0,0,0.28)"
                                        transform={`translate(${hovered ? 5 : 4}, ${hovered ? 5 : 4})`}
                                    />

                                    {/* Building Rectangle */}
                                    <rect
                                        x={building.x - 40}
                                        y={building.y - 30}
                                        width="80"
                                        height="60"
                                        rx="10"
                                        fill={hovered ? `${building.color}35` : `${building.color}16`}
                                        stroke={hovered ? building.color : `${building.color}85`}
                                        strokeWidth={hovered ? 2.5 : 1.5}
                                        cursor="pointer"
                                        filter={hovered ? 'url(#glow)' : 'url(#softShadow)'}
                                        onMouseEnter={() => setHoveredBuilding(building.id)}
                                        onMouseLeave={() => setHoveredBuilding(null)}
                                        onClick={() => setSelectedBuilding(building)}
                                        style={{
                                            transition: 'all 0.25s ease',
                                            transformOrigin: `${building.x}px ${building.y}px`,
                                            transform: hovered ? 'scale(1.05)' : 'scale(1)'
                                        }}
                                    />

                                    {/* Building Icon */}
                                    <foreignObject
                                        x={building.x - 14}
                                        y={building.y - 14}
                                        width="28"
                                        height="28"
                                        style={{
                                            pointerEvents: 'none'
                                        }}
                                    >
                                        <div style={{
                                            width: 28,
                                            height: 28,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Building2
                                                size={28}
                                                color={hovered ? building.color : '#ffffff'}
                                                style={{ opacity: hovered ? 1 : 0.75 }}
                                            />
                                        </div>
                                    </foreignObject>

                                    {/* Building Name Label */}
                                    <text
                                        x={building.x}
                                        y={building.y + 44}
                                        textAnchor="middle"
                                        fill={hovered ? building.color : 'rgba(255,255,255,0.75)'}
                                        fontSize="8.5"
                                        fontWeight="700"
                                        cursor="pointer"
                                        onMouseEnter={() => setHoveredBuilding(building.id)}
                                        onMouseLeave={() => setHoveredBuilding(null)}
                                        onClick={() => setSelectedBuilding(building)}
                                        style={{ transition: 'all 0.2s' }}
                                    >
                                        {building.name}
                                    </text>

                                    {/* Floor Count Badge */}
                                    {building.floors > 1 && (
                                        <g transform={`translate(${building.x + 35}, ${building.y - 25})`}>
                                            <rect x="-15" y="-10" width="30" height="20" rx="10" fill={building.color} stroke="white" strokeWidth="1.5" />
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

                                    {/* Hover Tooltip */}
                                    {hovered && (
                                        <g transform={`translate(${building.x - 66}, ${building.y - 82})`}>
                                            <rect
                                                x="0"
                                                y="0"
                                                width="132"
                                                height="46"
                                                rx="8"
                                                fill="rgba(0,0,0,0.78)"
                                                stroke="rgba(255,255,255,0.12)"
                                                strokeWidth="1"
                                            />
                                            <text x="66" y="16" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="700">
                                                {building.name}
                                            </text>
                                            <text x="66" y="29" textAnchor="middle" fill="rgba(255,255,255,0.72)" fontSize="9">
                                                {resourceCount} resources • {activeCount} active
                                            </text>
                                            <text x="66" y="40" textAnchor="middle" fill={building.color} fontSize="9" fontWeight="700">
                                                Click to inspect building
                                            </text>
                                        </g>
                                    )}
                                </g>
                            );
                        })}

                        {/* Map Legend */}
                        <g transform="translate(20, 438)">
                            <rect x="0" y="0" width="470" height="46" rx="10" fill="rgba(0,0,0,0.62)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            {buildingLocations.slice(0, 5).map((building, i) => (
                                <g key={i} transform={`translate(${12 + i * 90}, 14)`}>
                                    <rect x="0" y="0" width="12" height="12" rx="3" fill={building.color} />
                                    <text x="16" y="10" fill="rgba(255,255,255,0.78)" fontSize="9" fontWeight="600">
                                        {building.type}
                                    </text>
                                </g>
                            ))}
                        </g>
                    </svg>
                </div>

                {/* Sidebar - Selected Building Details */}
                <div style={{
                    width: selectedBuilding ? '400px' : '0',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius)',
                    border: selectedBuilding ? '1px solid var(--border)' : 'none',
                    overflow: 'hidden',
                    transition: 'width 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: selectedBuilding ? '0 18px 40px rgba(0,0,0,0.16)' : 'none'
                }}>
                    {selectedBuilding && selectedBuildingData && (
                        <>
                            <div style={{
                                padding: '20px',
                                borderBottom: '1px solid var(--border)',
                                background: `linear-gradient(135deg, ${selectedBuildingData.color}20, transparent)`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                        <div style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 14,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: `${selectedBuildingData.color}20`,
                                            border: `1px solid ${selectedBuildingData.color}35`
                                        }}>
                                            <Building2 size={26} color={selectedBuildingData.color} />
                                        </div>

                                        <div>
                                            <h3 style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                                                {selectedBuildingData.name}
                                            </h3>
                                            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                                                {selectedBuildingData.type} • {selectedBuildingData.floors} Floors
                                            </p>
                                            {selectedBuildingData.faculties && (
                                                <p style={{ fontSize: 11, color: 'var(--accent)', lineHeight: 1.4 }}>
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
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid var(--border)',
                                            cursor: 'pointer',
                                            color: 'var(--text-muted)',
                                            width: 34,
                                            height: 34,
                                            borderRadius: 10,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.color = '#f87171';
                                            e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)';
                                            e.currentTarget.style.background = 'rgba(248,113,113,0.08)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.color = 'var(--text-muted)';
                                            e.currentTarget.style.borderColor = 'var(--border)';
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                        }}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
                                {/* Building summary cards */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: 12,
                                    marginBottom: 20
                                }}>
                                    <div style={{
                                        padding: '14px',
                                        background: 'rgba(79,142,247,0.08)',
                                        border: '1px solid rgba(79,142,247,0.14)',
                                        borderRadius: 'var(--radius-sm)'
                                    }}>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Total Resources</div>
                                        <div style={{ fontSize: 24, fontWeight: 800, color: selectedBuildingData.color }}>
                                            {selectedBuildingResources.length}
                                        </div>
                                    </div>

                                    <div style={{
                                        padding: '14px',
                                        background: 'rgba(52,211,153,0.08)',
                                        border: '1px solid rgba(52,211,153,0.14)',
                                        borderRadius: 'var(--radius-sm)'
                                    }}>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Operational Score</div>
                                        <div style={{ fontSize: 24, fontWeight: 800, color: '#34d399' }}>
                                            {selectedBuildingOperationalScore}%
                                        </div>
                                    </div>
                                </div>

                                {/* Resource Count Summary */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: 20,
                                    padding: '14px',
                                    background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border)',
                                    gap: 12
                                }}>
                                    <div>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total</span>
                                        <div style={{ fontSize: 20, fontWeight: 800, color: selectedBuildingData.color }}>
                                            {selectedBuildingResources.length}
                                        </div>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Active</span>
                                        <div style={{ fontSize: 20, fontWeight: 800, color: '#34d399' }}>
                                            {getResourceCountByStatus(selectedBuildingResources, 'ACTIVE')}
                                        </div>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Maintenance</span>
                                        <div style={{ fontSize: 20, fontWeight: 800, color: '#fbbf24' }}>
                                            {getResourceCountByStatus(selectedBuildingResources, 'MAINTENANCE')}
                                        </div>
                                    </div>
                                </div>

                                {/* Floor Selector */}
                                {selectedBuildingData.floors > 1 && (
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, display: 'block', fontWeight: 600 }}>
                                            Select Floor
                                        </label>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                            <button
                                                onClick={() => setSelectedFloor(null)}
                                                style={{
                                                    padding: '7px 12px',
                                                    background: !selectedFloor ? 'linear-gradient(135deg, var(--accent), var(--accent-2))' : 'rgba(255,255,255,0.05)',
                                                    border: !selectedFloor ? 'none' : '1px solid var(--border)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    color: !selectedFloor ? 'white' : 'var(--text-secondary)',
                                                    cursor: 'pointer',
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                All Floors
                                            </button>

                                            {[...Array(selectedBuildingData.floors)].map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setSelectedFloor(i + 1)}
                                                    style={{
                                                        padding: '7px 12px',
                                                        background: selectedFloor === i + 1 ? 'linear-gradient(135deg, var(--accent), var(--accent-2))' : 'rgba(255,255,255,0.05)',
                                                        border: selectedFloor === i + 1 ? 'none' : '1px solid var(--border)',
                                                        borderRadius: 'var(--radius-sm)',
                                                        color: selectedFloor === i + 1 ? 'white' : 'var(--text-secondary)',
                                                        cursor: 'pointer',
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    Floor {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Resources List */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: 12
                                }}>
                                    <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {selectedFloor ? `Floor ${selectedFloor} Resources` : 'All Resources'}
                                    </h4>

                                    <span style={{
                                        fontSize: 11,
                                        color: 'var(--text-muted)',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: 999,
                                        padding: '4px 8px'
                                    }}>
                                        Click card to open details
                                    </span>
                                </div>

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
                                                <div style={{
                                                    textAlign: 'center',
                                                    padding: 50,
                                                    color: 'var(--text-muted)',
                                                    background: 'rgba(255,255,255,0.025)',
                                                    border: '1px dashed var(--border)',
                                                    borderRadius: 'var(--radius-sm)'
                                                }}>
                                                    <MapPin size={36} style={{ opacity: 0.3, marginBottom: 10 }} />
                                                    <div style={{ fontWeight: 600, marginBottom: 6 }}>No resources found</div>
                                                    <div style={{ fontSize: 12 }}>
                                                        {selectedFloor ? `No resources found on Floor ${selectedFloor}` : 'No resources found in this building'}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return resourcesToShow.map(resource => {
                                            const statusStyles = getResourceStatusStyles(resource.status);
                                            const amenityCount = getAmenityCount(resource);
                                            const faculty = getFacultyFromResource(resource);

                                            return (
                                                <div
                                                    key={resource.id}
                                                    onClick={() => onResourceClick(resource)}
                                                    style={{
                                                        padding: '16px',
                                                        background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
                                                        borderRadius: 'var(--radius-sm)',
                                                        border: '1px solid var(--border)',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.25s ease',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
                                                    }}
                                                    onMouseEnter={e => {
                                                        e.currentTarget.style.background = 'rgba(79,142,247,0.1)';
                                                        e.currentTarget.style.borderColor = 'var(--accent)';
                                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                                        e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.2)';
                                                    }}
                                                    onMouseLeave={e => {
                                                        e.currentTarget.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))';
                                                        e.currentTarget.style.borderColor = 'var(--border)';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)';
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 10 }}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
                                                                {resource.name}
                                                            </div>

                                                            <div style={{
                                                                display: 'flex',
                                                                flexWrap: 'wrap',
                                                                gap: 6
                                                            }}>
                                                                <span style={{
                                                                    fontSize: 10,
                                                                    background: 'rgba(255,255,255,0.05)',
                                                                    border: '1px solid rgba(255,255,255,0.06)',
                                                                    padding: '3px 8px',
                                                                    borderRadius: 999,
                                                                    color: 'var(--text-secondary)',
                                                                    fontWeight: 600
                                                                }}>
                                                                    {resource.resourceType || 'Resource'}
                                                                </span>

                                                                <span style={{
                                                                    fontSize: 10,
                                                                    background: 'rgba(79,142,247,0.1)',
                                                                    border: '1px solid rgba(79,142,247,0.16)',
                                                                    padding: '3px 8px',
                                                                    borderRadius: 999,
                                                                    color: 'var(--accent)',
                                                                    fontWeight: 600
                                                                }}>
                                                                    {faculty}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <span style={{
                                                            fontSize: 10,
                                                            padding: '4px 10px',
                                                            borderRadius: 999,
                                                            background: statusStyles.bg,
                                                            color: statusStyles.color,
                                                            border: `1px solid ${statusStyles.border}`,
                                                            fontWeight: 700,
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {resource.status}
                                                        </span>
                                                    </div>

                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 8,
                                                        fontSize: 12,
                                                        color: 'var(--text-muted)',
                                                        marginBottom: 10
                                                    }}>
                                                        <Users size={12} />
                                                        Capacity: {resource.capacity} people
                                                    </div>

                                                    <div style={{
                                                        display: 'flex',
                                                        gap: 10,
                                                        flexWrap: 'wrap',
                                                        marginBottom: 10
                                                    }}>
                                                        <span style={{
                                                            fontSize: 10,
                                                            background: 'rgba(255,255,255,0.05)',
                                                            padding: '3px 8px',
                                                            borderRadius: 999,
                                                            color: 'var(--text-secondary)',
                                                            border: '1px solid rgba(255,255,255,0.06)'
                                                        }}>
                                                            {amenityCount} amenities
                                                        </span>

                                                        {resource.floor && (
                                                            <span style={{
                                                                fontSize: 10,
                                                                background: 'rgba(255,255,255,0.05)',
                                                                padding: '3px 8px',
                                                                borderRadius: 999,
                                                                color: 'var(--text-secondary)',
                                                                border: '1px solid rgba(255,255,255,0.06)'
                                                            }}>
                                                                {resource.floor}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                                                        {resource.isAirConditioned && (
                                                            <span style={{ fontSize: 10, background: 'rgba(79,142,247,0.1)', padding: '3px 8px', borderRadius: 12, color: 'var(--accent)', border: '1px solid rgba(79,142,247,0.16)' }}>
                                                                ❄️ AC
                                                            </span>
                                                        )}
                                                        {resource.hasProjector && (
                                                            <span style={{ fontSize: 10, background: 'rgba(79,142,247,0.1)', padding: '3px 8px', borderRadius: 12, color: 'var(--accent)', border: '1px solid rgba(79,142,247,0.16)' }}>
                                                                📽️ Projector
                                                            </span>
                                                        )}
                                                        {resource.hasSmartBoard && (
                                                            <span style={{ fontSize: 10, background: 'rgba(79,142,247,0.1)', padding: '3px 8px', borderRadius: 12, color: 'var(--accent)', border: '1px solid rgba(79,142,247,0.16)' }}>
                                                                📱 Smart Board
                                                            </span>
                                                        )}
                                                        {resource.hasWifi && (
                                                            <span style={{ fontSize: 10, background: 'rgba(79,142,247,0.1)', padding: '3px 8px', borderRadius: 12, color: 'var(--accent)', border: '1px solid rgba(79,142,247,0.16)' }}>
                                                                📶 WiFi
                                                            </span>
                                                        )}
                                                    </div>

                                                    <button
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px',
                                                            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                                                            border: 'none',
                                                            borderRadius: 'var(--radius-sm)',
                                                            color: 'white',
                                                            cursor: 'pointer',
                                                            fontSize: 12,
                                                            fontWeight: 700,
                                                            transition: 'all 0.25s ease',
                                                            boxShadow: '0 6px 14px rgba(79,142,247,0.28)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: 8
                                                        }}
                                                        onMouseEnter={e => {
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                            e.currentTarget.style.boxShadow = '0 10px 20px rgba(79,142,247,0.4)';
                                                        }}
                                                        onMouseLeave={e => {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = '0 6px 14px rgba(79,142,247,0.28)';
                                                        }}
                                                    >
                                                        View Details <ChevronRight size={14} />
                                                    </button>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Footer Stats */}
            <div style={{
                padding: '14px 24px',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 12,
                color: 'var(--text-muted)',
                flexWrap: 'wrap',
                gap: 10
            }}>
                <div>🏫 Campus Buildings: {buildingLocations.length}</div>
                <div>📚 Total Resources: {resources.length}</div>
                <div>✅ Active: {resources.filter(r => r.status === 'ACTIVE').length}</div>
                <div>🔧 Maintenance: {resources.filter(r => r.status === 'MAINTENANCE').length}</div>
                <div>⚠️ Out of Service: {resources.filter(r => r.status !== 'ACTIVE' && r.status !== 'MAINTENANCE').length}</div>
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