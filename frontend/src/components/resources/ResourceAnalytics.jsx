import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, Clock, BarChart3, PieChart, Download } from 'lucide-react';

const ResourceAnalytics = ({ onClose }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('week');
    const [hoveredIndex, setHoveredIndex] = useState(null);

    useEffect(() => {
        fetchStats();
    }, [timeRange]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            // Fetch main analytics data
            const response = await fetch(`/api/resources/analytics/dashboard`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            });
            const data = await response.json();
            
            // Fetch real booking trend data from backend
            const trendResponse = await fetch(`/api/resources/analytics/trend?range=${timeRange}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            });
            
            let trendData = [];
            let maxBookings = 1;
            
            if (trendResponse.ok) {
                const realTrendData = await trendResponse.json();
                trendData = realTrendData;
                maxBookings = Math.max(...trendData.map(d => d.count), 1);
            } else {
                // Fallback: Generate trend data from actual resource creation dates
                const resourcesResponse = await fetch(`/api/resources?size=100`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
                });
                const resourcesData = await resourcesResponse.json();
                
                // Group resources by creation date
                const creationMap = new Map();
                resourcesData.content?.forEach(resource => {
                    const date = new Date(resource.createdAt).toLocaleDateString();
                    creationMap.set(date, (creationMap.get(date) || 0) + 1);
                });
                
                // Convert to trend format
                const days = getLastNDays(7);
                trendData = days.map(day => ({
                    label: day.label,
                    count: creationMap.get(day.date) || 0
                }));
                maxBookings = Math.max(...trendData.map(d => d.count), 1);
            }
            
            // Transform data to match component's expected format
            const transformedStats = {
                totalResources: data.totalResources || 0,
                activeResources: data.activeResources || 0,
                outOfServiceResources: data.outOfServiceResources || 0,
                maintenanceResources: data.maintenanceResources || 0,
                utilizationRate: data.utilizationRate || 0,
                maintenanceDue: data.maintenanceResources || 0,
                resourcesByType: data.resourcesByType || {},
                resourcesByBuilding: data.resourcesByBuilding || {},
                amenities: data.amenities || {},
                bookingTrendData: trendData,
                maxDailyBookings: maxBookings,
                maxBookings: 1,
                topResources: []
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
            
            setStats(transformedStats);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const getLastNDays = (n) => {
        const days = [];
        for (let i = n - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push({
                label: date.toLocaleDateString('en-US', { weekday: 'short' }),
                date: date.toLocaleDateString(),
                count: 0
            });
        }
        return days;
    };

    const exportReport = async () => {
        try {
            const response = await fetch(`/api/resources/analytics/export?format=csv&range=${timeRange}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            });
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `resource_analytics_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    if (loading) {
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
                <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 40, textAlign: 'center' }}>
                    <div style={{ width: 40, height: 40, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
                    <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>Loading analytics...</p>
                </div>
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
            background: 'rgba(0,0,0,0.85)',
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
                maxWidth: 1100,
                maxHeight: '85vh',
                overflow: 'auto',
                border: '1px solid var(--border)'
            }}>
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    background: 'var(--bg-card)',
                    zIndex: 10
                }}>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>
                            <BarChart3 size={20} style={{ display: 'inline', marginRight: 8 }} />
                            Resource Analytics
                        </h2>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            Real-time usage statistics and insights
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 20 }}>✕</button>
                </div>

                <div style={{ padding: 24 }}>
                    {/* Time Range Selector */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 24, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {['week', 'month', 'year'].map(range => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    style={{
                                        padding: '8px 20px',
                                        background: timeRange === range ? 'linear-gradient(135deg, var(--accent), var(--accent-2))' : 'rgba(255,255,255,0.05)',
                                        border: timeRange === range ? 'none' : '1px solid var(--border)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: timeRange === range ? 'white' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        fontSize: 13,
                                        fontWeight: timeRange === range ? 600 : 400,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {range.charAt(0).toUpperCase() + range.slice(1)}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={exportReport}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '8px 16px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: 13,
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = 'var(--accent)';
                                e.currentTarget.style.color = 'var(--accent)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'var(--border)';
                                e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                        >
                            <Download size={16} /> Export Report
                        </button>
                    </div>

                    {/* Key Metrics Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
                        <div style={{ background: 'rgba(52,211,153,0.08)', borderRadius: 'var(--radius-sm)', padding: 18, borderLeft: '3px solid #34d399' }}>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Resources</div>
                            <div style={{ fontSize: 32, fontWeight: 700, color: '#34d399' }}>{stats?.totalResources || 0}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                {stats?.activeResources || 0} active
                            </div>
                        </div>
                        <div style={{ background: 'rgba(79,142,247,0.08)', borderRadius: 'var(--radius-sm)', padding: 18, borderLeft: '3px solid #4f8ef7' }}>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Utilization Rate</div>
                            <div style={{ fontSize: 32, fontWeight: 700, color: '#4f8ef7' }}>{stats?.utilizationRate || 0}%</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                Active vs Total
                            </div>
                        </div>
                        <div style={{ background: 'rgba(251,191,36,0.08)', borderRadius: 'var(--radius-sm)', padding: 18, borderLeft: '3px solid #fbbf24' }}>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Maintenance</div>
                            <div style={{ fontSize: 32, fontWeight: 700, color: '#fbbf24' }}>{stats?.maintenanceResources || 0}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                Resources needing attention
                            </div>
                        </div>
                        <div style={{ background: 'rgba(248,113,113,0.08)', borderRadius: 'var(--radius-sm)', padding: 18, borderLeft: '3px solid #f87171' }}>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Out of Service</div>
                            <div style={{ fontSize: 32, fontWeight: 700, color: '#f87171' }}>{stats?.outOfServiceResources || 0}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                Temporarily unavailable
                            </div>
                        </div>
                    </div>

                    {/* Resources by Type */}
                    {stats?.resourcesByType && Object.keys(stats.resourcesByType).length > 0 && (
                        <div style={{ marginBottom: 28 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Resources by Type</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                                {Object.entries(stats.resourcesByType).map(([type, count]) => (
                                    <div key={type} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '10px 14px',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--border)'
                                    }}>
                                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{type}</span>
                                        <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--accent)' }}>{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Amenities Coverage */}
                    {stats?.amenities && Object.keys(stats.amenities).length > 0 && (
                        <div style={{ marginBottom: 28 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Amenities Coverage</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                                {Object.entries(stats.amenities).map(([amenity, count]) => (
                                    <div key={amenity} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: '8px 16px',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--border)'
                                    }}>
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{amenity}:</span>
                                        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--accent)' }}>{count}</span>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                            ({Math.round((count / stats.totalResources) * 100)}%)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Activity Trend Chart */}
                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                            Resource Activity Trend ({timeRange === 'week' ? 'Last 7 Days' : timeRange === 'month' ? 'Last 30 Days' : 'Last 12 Months'})
                        </h3>

                        {stats?.bookingTrendData && stats.bookingTrendData.length > 0 ? (
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
                                                stroke="rgba(255,255,255,0.06)"
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
                                            opacity="0.2"
                                        />
                                    )}

                                    {/* Line */}
                                    <polyline
                                        fill="none"
                                        stroke="url(#lineGradient)"
                                        strokeWidth="2.5"
                                        points={pointsData.map(point => `${point.x},${point.y + 20}`).join(' ')}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />

                                    {/* Data Points */}
                                    {pointsData.map((point, idx) => (
                                        <g key={idx}>
                                            <circle
                                                cx={point.x}
                                                cy={point.y + 20}
                                                r={hoveredIndex === idx ? 7 : 4}
                                                fill={hoveredIndex === idx ? 'var(--accent)' : 'rgba(255,255,255,0.15)'}
                                                stroke={hoveredIndex === idx ? 'white' : 'none'}
                                                strokeWidth="2"
                                                style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                                                onMouseEnter={() => setHoveredIndex(idx)}
                                                onMouseLeave={() => setHoveredIndex(null)}
                                            />
                                        </g>
                                    ))}

                                    {/* Hover vertical line */}
                                    {hoveredIndex !== null && pointsData[hoveredIndex] && (
                                        <line
                                            x1={pointsData[hoveredIndex].x}
                                            y1="20"
                                            x2={pointsData[hoveredIndex].x}
                                            y2="145"
                                            stroke="rgba(255,255,255,0.15)"
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
                                            padding: '8px 12px',
                                            boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                                            pointerEvents: 'none',
                                            zIndex: 10,
                                            minWidth: 80,
                                            textAlign: 'center'
                                        }}
                                    >
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>
                                            {pointsData[hoveredIndex].label}
                                        </div>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>
                                            {pointsData[hoveredIndex].count}
                                        </div>
                                        <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>resources</div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: 40, background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                                <p style={{ color: 'var(--text-muted)' }}>No trend data available</p>
                            </div>
                        )}

                        {/* X-axis labels */}
                        {stats?.bookingTrendData && stats.bookingTrendData.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                                {stats.bookingTrendData.map((day, idx) => (
                                    <span key={idx} style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', flex: 1 }}>
                                        {day.label}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Summary Footer */}
                    <div style={{
                        marginTop: 28,
                        paddingTop: 16,
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 12,
                        fontSize: 11,
                        color: 'var(--text-muted)'
                    }}>
                        <div>📊 Data reflects current resource catalogue</div>
                        <div>🔄 Last updated: {new Date().toLocaleString()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceAnalytics;