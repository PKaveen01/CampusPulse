import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, Clock, BarChart3, PieChart, Download } from 'lucide-react';

const ResourceAnalytics = ({ onClose }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('week'); // week, month, year
    const [hoveredIndex, setHoveredIndex] = useState(null);

    useEffect(() => {
        fetchStats();
    }, [timeRange]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            // Use the correct endpoint from your backend
            const response = await fetch(`/api/resources/analytics/dashboard`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            });
            const data = await response.json();
            
            // Transform data to match your component's expected format
            const transformedStats = {
                totalResources: data.totalResources || 0,
                activeResources: data.activeResources || 0,
                utilizationRate: data.utilizationRate || 0,
                maintenanceDue: data.maintenanceResources || 0,
                totalBookings: 0,
                bookingTrend: 0,
                topResources: [],
                bookingTrendData: [],
                maxBookings: 1
            };
            
            // Add resources by type as top resources
            if (data.resourcesByType && Object.keys(data.resourcesByType).length > 0) {
                transformedStats.topResources = Object.entries(data.resourcesByType)
                    .map(([type, count]) => ({
                        name: type,
                        type: type,
                        bookingCount: count
                    }))
                    .sort((a, b) => b.bookingCount - a.bookingCount)
                    .slice(0, 5);
                transformedStats.maxBookings = transformedStats.topResources[0]?.bookingCount || 1;
            }
            
            // Generate mock booking trend data (you can replace with real data later)
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            transformedStats.bookingTrendData = days.map((day, i) => ({
                label: day,
                count: Math.floor(Math.random() * 20) + 5
            }));
            transformedStats.maxDailyBookings = Math.max(...transformedStats.bookingTrendData.map(d => d.count));
            
            setStats(transformedStats);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportReport = () => {
        window.open('/api/resources/analytics/export?format=csv', '_blank');
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <div style={{ width: 32, height: 32, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
        );
    }

    const chartWidth = 600;
    const chartHeight = 120;

    const pointsData = stats?.bookingTrendData?.map((day, index) => {
        const x = (index / (stats.bookingTrendData.length - 1)) * chartWidth;
        const y = chartHeight - (day.count / (stats.maxDailyBookings || 1)) * chartHeight;
        return { x, y, ...day };
    }) || [];

    const polylinePoints = pointsData.map(point => `${point.x},${point.y}`).join(' ');

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius)',
                width: '90%',
                maxWidth: 1000,
                maxHeight: '85vh',
                overflow: 'auto',
                border: '1px solid var(--border)'
            }}>
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>
                            <BarChart3 size={20} style={{ display: 'inline', marginRight: 8 }} />
                            Resource Analytics
                        </h2>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            Usage statistics and insights
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>✕</button>
                </div>

                <div style={{ padding: 24 }}>
                    {/* Time Range Selector */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 24, justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {['week', 'month', 'year'].map(range => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    style={{
                                        padding: '6px 16px',
                                        background: timeRange === range ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                                        border: 'none',
                                        borderRadius: 'var(--radius-sm)',
                                        color: timeRange === range ? 'white' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        fontSize: 12,
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={exportReport}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '6px 12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: 12
                            }}
                        >
                            <Download size={14} /> Export Report
                        </button>
                    </div>

                    {/* Key Metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                        <div style={{ background: 'rgba(52,211,153,0.1)', borderRadius: 'var(--radius-sm)', padding: 16, borderLeft: '3px solid #34d399' }}>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Resources</div>
                            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>{stats?.totalResources || 0}</div>
                        </div>
                        <div style={{ background: 'rgba(79,142,247,0.1)', borderRadius: 'var(--radius-sm)', padding: 16, borderLeft: '3px solid #4f8ef7' }}>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Active Resources</div>
                            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>{stats?.activeResources || 0}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>of {stats?.totalResources} total</div>
                        </div>
                        <div style={{ background: 'rgba(251,191,36,0.1)', borderRadius: 'var(--radius-sm)', padding: 16, borderLeft: '3px solid #fbbf24' }}>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Utilization Rate</div>
                            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>{stats?.utilizationRate || 0}%</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Active vs Total</div>
                        </div>
                        <div style={{ background: 'rgba(248,113,113,0.1)', borderRadius: 'var(--radius-sm)', padding: 16, borderLeft: '3px solid #f87171' }}>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Maintenance</div>
                            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>{stats?.maintenanceDue || 0}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Resources needing attention</div>
                        </div>
                    </div>

                    {/* Top Resources by Type */}
                    <div style={{ marginBottom: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Resources by Type</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {stats?.topResources?.map((resource, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 30, fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>#{idx + 1}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500 }}>{resource.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{resource.type}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 600 }}>{resource.bookingCount}</div>
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>resources</div>
                                    </div>
                                    <div style={{ width: 100 }}>
                                        <div style={{
                                            height: 6,
                                            background: 'rgba(255,255,255,0.1)',
                                            borderRadius: 3,
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${(resource.bookingCount / stats?.maxBookings) * 100}%`,
                                                height: '100%',
                                                background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                                                borderRadius: 3
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Booking Trend Chart */}
                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Activity Trend (Last 7 Days)</h3>

                        <div style={{ position: 'relative' }}>
                            <svg width="100%" height={160} viewBox={`0 0 ${chartWidth} 160`} preserveAspectRatio="none">
                                {/* Grid lines */}
                                {[0, 1, 2, 3, 4].map((line) => {
                                    const y = 20 + (line * 25);
                                    return (
                                        <line
                                            key={line}
                                            x1="0"
                                            y1={y}
                                            x2={chartWidth}
                                            y2={y}
                                            stroke="rgba(255,255,255,0.08)"
                                            strokeWidth="1"
                                        />
                                    );
                                })}

                                {/* Area fill */}
                                {pointsData.length > 0 && (
                                    <path
                                        d={`
                                            M ${pointsData[0].x} ${pointsData[0].y + 20}
                                            ${pointsData.map(point => `L ${point.x} ${point.y + 20}`).join(' ')}
                                            L ${pointsData[pointsData.length - 1].x} 145
                                            L ${pointsData[0].x} 145
                                            Z
                                        `}
                                        fill="url(#areaGradient)"
                                        opacity="0.25"
                                    />
                                )}

                                {/* Line */}
                                <polyline
                                    fill="none"
                                    stroke="url(#lineGradient)"
                                    strokeWidth="3"
                                    points={pointsData.map(point => `${point.x},${point.y + 20}`).join(' ')}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                                {/* Points */}
                                {pointsData.map((point, idx) => (
                                    <g key={idx}>
                                        <circle
                                            cx={point.x}
                                            cy={point.y + 20}
                                            r={hoveredIndex === idx ? 8 : 5}
                                            fill="rgba(255,255,255,0.12)"
                                            style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                                            onMouseEnter={() => setHoveredIndex(idx)}
                                            onMouseLeave={() => setHoveredIndex(null)}
                                        />
                                        <circle
                                            cx={point.x}
                                            cy={point.y + 20}
                                            r={hoveredIndex === idx ? 5 : 3.5}
                                            fill="var(--accent)"
                                            stroke="white"
                                            strokeWidth="2"
                                            style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                                            onMouseEnter={() => setHoveredIndex(idx)}
                                            onMouseLeave={() => setHoveredIndex(null)}
                                        />
                                    </g>
                                ))}

                                {/* Hover line */}
                                {hoveredIndex !== null && pointsData[hoveredIndex] && (
                                    <line
                                        x1={pointsData[hoveredIndex].x}
                                        y1="20"
                                        x2={pointsData[hoveredIndex].x}
                                        y2="145"
                                        stroke="rgba(255,255,255,0.2)"
                                        strokeDasharray="4 4"
                                    />
                                )}

                                <defs>
                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="var(--accent)" />
                                        <stop offset="100%" stopColor="var(--accent-2)" />
                                    </linearGradient>

                                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--accent)" />
                                        <stop offset="100%" stopColor="transparent" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            {/* Tooltip */}
                            {hoveredIndex !== null && pointsData[hoveredIndex] && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: `${(pointsData[hoveredIndex].x / chartWidth) * 100}%`,
                                        top: `${pointsData[hoveredIndex].y - 5}px`,
                                        transform: 'translate(-50%, -100%)',
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 8,
                                        padding: '8px 10px',
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
                                        pointerEvents: 'none',
                                        zIndex: 10,
                                        minWidth: 70,
                                        textAlign: 'center'
                                    }}
                                >
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>
                                        {pointsData[hoveredIndex].label}
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {pointsData[hoveredIndex].count}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                            {stats?.bookingTrendData?.map((day, idx) => (
                                <span key={idx} style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                                    {day.label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceAnalytics;