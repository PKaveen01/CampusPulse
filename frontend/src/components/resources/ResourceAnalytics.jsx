import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    Calendar,
    Clock,
    BarChart3,
    PieChart,
    Download,
    Activity,
    Wrench,
    AlertTriangle,
    CheckCircle2,
    Layers3,
    Building2,
    Sparkles,
    X,
    ShieldCheck
} from 'lucide-react';

const ResourceAnalytics = ({ onClose }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('week');
    const [hoveredIndex, setHoveredIndex] = useState(null);

    useEffect(() => {
        fetchStats();
    }, [timeRange]);

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
        navigate('/resources');
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/resources/analytics/dashboard`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            });
            const data = await response.json();

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
                const resourcesResponse = await fetch(`/api/resources?size=100`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
                });
                const resourcesData = await resourcesResponse.json();

                const creationMap = new Map();
                resourcesData.content?.forEach(resource => {
                    const date = new Date(resource.createdAt).toLocaleDateString();
                    creationMap.set(date, (creationMap.get(date) || 0) + 1);
                });

                const days = getLastNDays(7);
                trendData = days.map(day => ({
                    label: day.label,
                    count: creationMap.get(day.date) || 0
                }));
                maxBookings = Math.max(...trendData.map(d => d.count), 1);
            }

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
                background: 'rgba(0,0,0,0.82)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: 20
            }}>
                <div style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)), var(--bg-card)',
                    borderRadius: 'var(--radius)',
                    padding: 40,
                    textAlign: 'center',
                    minWidth: 280,
                    border: '1px solid var(--border)',
                    boxShadow: '0 18px 40px rgba(0,0,0,0.28)'
                }}>
                    <div style={{
                        width: 42,
                        height: 42,
                        border: '2px solid rgba(255,255,255,0.12)',
                        borderTopColor: 'var(--accent)',
                        borderRadius: '50%',
                        margin: '0 auto',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ marginTop: 16, color: 'var(--text-muted)', fontSize: 14 }}>
                        Loading analytics...
                    </p>
                </div>

                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    const chartWidth = 600;
    const chartHeight = 120;

    const pointsData = stats?.bookingTrendData?.map((day, index) => {
        const x = stats.bookingTrendData.length > 1
            ? (index / (stats.bookingTrendData.length - 1)) * chartWidth
            : chartWidth / 2;
        const y = chartHeight - (day.count / (stats.maxDailyBookings || 1)) * chartHeight;
        return { x, y, ...day };
    }) || [];

    const activePercentage = stats?.totalResources
        ? Math.round((stats.activeResources / stats.totalResources) * 100)
        : 0;

    const attentionPercentage = stats?.totalResources
        ? Math.round(((stats.maintenanceResources + stats.outOfServiceResources) / stats.totalResources) * 100)
        : 0;

    const timeRangeLabel =
        timeRange === 'week'
            ? 'Last 7 Days'
            : timeRange === 'month'
                ? 'Last 30 Days'
                : 'Last 12 Months';

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
        }}>
            <div style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.01)), var(--bg-card)',
                borderRadius: 'var(--radius)',
                width: '90%',
                maxWidth: 1150,
                maxHeight: '88vh',
                overflow: 'auto',
                border: '1px solid var(--border)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
                position: 'relative'
            }}>
                {/* Header */}
                <div style={{
                    padding: '22px 24px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    background: 'linear-gradient(180deg, rgba(20,20,20,0.95), rgba(20,20,20,0.88)), var(--bg-card)',
                    backdropFilter: 'blur(12px)',
                    zIndex: 10
                }}>
                    <div>
                        <h2 style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            marginBottom: 4
                        }}>
                            <div style={{
                                width: 38,
                                height: 38,
                                borderRadius: 12,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, rgba(79,142,247,0.18), rgba(79,142,247,0.08))',
                                border: '1px solid rgba(79,142,247,0.18)'
                            }}>
                                <BarChart3 size={20} color="var(--accent)" />
                            </div>
                            Resource Analytics
                        </h2>
                        <p style={{
                            fontSize: 13,
                            color: 'var(--text-muted)',
                            margin: 0
                        }}>
                            Real-time operational insights, utilization signals, and portfolio health
                        </p>
                    </div>

                    <button
                        onClick={handleClose}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            border: '1px solid var(--border)',
                            background: 'rgba(255,255,255,0.04)',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'rgba(248,113,113,0.35)';
                            e.currentTarget.style.color = '#f87171';
                            e.currentTarget.style.background = 'rgba(248,113,113,0.08)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div style={{ padding: 24 }}>
                    {/* Top controls */}
                    <div style={{
                        display: 'flex',
                        gap: 12,
                        marginBottom: 24,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{
                            display: 'flex',
                            gap: 8,
                            padding: 6,
                            borderRadius: 14,
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border)'
                        }}>
                            {['week', 'month', 'year'].map(range => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    style={{
                                        padding: '9px 18px',
                                        background: timeRange === range
                                            ? 'linear-gradient(135deg, var(--accent), var(--accent-2))'
                                            : 'transparent',
                                        border: 'none',
                                        borderRadius: 10,
                                        color: timeRange === range ? 'white' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        fontSize: 13,
                                        fontWeight: timeRange === range ? 700 : 500,
                                        transition: 'all 0.2s',
                                        boxShadow: timeRange === range ? '0 10px 22px rgba(79,142,247,0.24)' : 'none'
                                    }}
                                >
                                    {range.charAt(0).toUpperCase() + range.slice(1)}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '8px 12px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--border)',
                                borderRadius: 12,
                                color: 'var(--text-secondary)',
                                fontSize: 12,
                                fontWeight: 600
                            }}>
                                <Calendar size={14} />
                                {timeRangeLabel}
                            </div>

                            <button
                                onClick={exportReport}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '10px 16px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    fontWeight: 600,
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
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                }}
                            >
                                <Download size={16} />
                                Export Report
                            </button>
                        </div>
                    </div>

                    {/* Executive summary strip */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: 16,
                        marginBottom: 24
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(79,142,247,0.1), rgba(79,142,247,0.03))',
                            border: '1px solid rgba(79,142,247,0.16)',
                            borderRadius: 'var(--radius-sm)',
                            padding: 18
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: 10
                            }}>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                                    Portfolio Health
                                </span>
                                <ShieldCheck size={16} color="var(--accent)" />
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                                {activePercentage}%
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                resources currently active
                            </div>
                        </div>

                        <div style={{
                            background: 'linear-gradient(135deg, rgba(52,211,153,0.1), rgba(52,211,153,0.03))',
                            border: '1px solid rgba(52,211,153,0.16)',
                            borderRadius: 'var(--radius-sm)',
                            padding: 18
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: 10
                            }}>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                                    Catalog Coverage
                                </span>
                                <Layers3 size={16} color="#34d399" />
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: '#34d399', marginBottom: 4 }}>
                                {stats?.totalResources || 0}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                total tracked assets and spaces
                            </div>
                        </div>

                        <div style={{
                            background: 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(251,191,36,0.03))',
                            border: '1px solid rgba(251,191,36,0.16)',
                            borderRadius: 'var(--radius-sm)',
                            padding: 18
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: 10
                            }}>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                                    Attention Needed
                                </span>
                                <AlertTriangle size={16} color="#fbbf24" />
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: '#fbbf24', marginBottom: 4 }}>
                                {attentionPercentage}%
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                maintenance or service interruptions
                            </div>
                        </div>
                    </div>

                    {/* KPI cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 16,
                        marginBottom: 28
                    }}>
                        <div style={{
                            background: 'rgba(52,211,153,0.08)',
                            borderRadius: 'var(--radius-sm)',
                            padding: 18,
                            border: '1px solid rgba(52,211,153,0.12)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                bottom: 0,
                                width: 4,
                                background: '#34d399'
                            }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Resources</div>
                                    <div style={{ fontSize: 32, fontWeight: 800, color: '#34d399' }}>
                                        {stats?.totalResources || 0}
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                                        {stats?.activeResources || 0} active
                                    </div>
                                </div>
                                <Building2 size={18} color="#34d399" />
                            </div>
                        </div>

                        <div style={{
                            background: 'rgba(79,142,247,0.08)',
                            borderRadius: 'var(--radius-sm)',
                            padding: 18,
                            border: '1px solid rgba(79,142,247,0.12)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                bottom: 0,
                                width: 4,
                                background: '#4f8ef7'
                            }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Utilization Rate</div>
                                    <div style={{ fontSize: 32, fontWeight: 800, color: '#4f8ef7' }}>
                                        {stats?.utilizationRate || 0}%
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                                        Active vs total
                                    </div>
                                </div>
                                <Activity size={18} color="#4f8ef7" />
                            </div>
                        </div>

                        <div style={{
                            background: 'rgba(251,191,36,0.08)',
                            borderRadius: 'var(--radius-sm)',
                            padding: 18,
                            border: '1px solid rgba(251,191,36,0.12)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                bottom: 0,
                                width: 4,
                                background: '#fbbf24'
                            }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Maintenance</div>
                                    <div style={{ fontSize: 32, fontWeight: 800, color: '#fbbf24' }}>
                                        {stats?.maintenanceResources || 0}
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                                        Resources needing attention
                                    </div>
                                </div>
                                <Wrench size={18} color="#fbbf24" />
                            </div>
                        </div>

                        <div style={{
                            background: 'rgba(248,113,113,0.08)',
                            borderRadius: 'var(--radius-sm)',
                            padding: 18,
                            border: '1px solid rgba(248,113,113,0.12)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                bottom: 0,
                                width: 4,
                                background: '#f87171'
                            }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Out of Service</div>
                                    <div style={{ fontSize: 32, fontWeight: 800, color: '#f87171' }}>
                                        {stats?.outOfServiceResources || 0}
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                                        Temporarily unavailable
                                    </div>
                                </div>
                                <AlertTriangle size={18} color="#f87171" />
                            </div>
                        </div>
                    </div>

                    {/* Two column sections */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: 20,
                        marginBottom: 28
                    }}>
                        {/* Resources by type */}
                        <div style={{
                            background: 'rgba(255,255,255,0.025)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            padding: 18
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginBottom: 16
                            }}>
                                <div style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(79,142,247,0.12)'
                                }}>
                                    <PieChart size={16} color="var(--accent)" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                                        Resources by Type
                                    </h3>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                                        Distribution across categories
                                    </p>
                                </div>
                            </div>

                            {stats?.resourcesByType && Object.keys(stats.resourcesByType).length > 0 ? (
                                <div style={{ display: 'grid', gap: 12 }}>
                                    {Object.entries(stats.resourcesByType).map(([type, count]) => {
                                        const percentage = stats.totalResources
                                            ? Math.round((count / stats.totalResources) * 100)
                                            : 0;

                                        return (
                                            <div
                                                key={type}
                                                style={{
                                                    padding: '12px 14px',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    border: '1px solid rgba(255,255,255,0.05)'
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: 8
                                                }}>
                                                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                                                        {type}
                                                    </span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                            {percentage}%
                                                        </span>
                                                        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>
                                                            {count}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div style={{
                                                    width: '100%',
                                                    height: 8,
                                                    borderRadius: 999,
                                                    background: 'rgba(255,255,255,0.06)',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        width: `${percentage}%`,
                                                        height: '100%',
                                                        background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                                                        borderRadius: 999
                                                    }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: 26,
                                    color: 'var(--text-muted)',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px dashed var(--border)',
                                    borderRadius: 'var(--radius-sm)'
                                }}>
                                    No type data available
                                </div>
                            )}
                        </div>

                        {/* Amenities coverage */}
                        <div style={{
                            background: 'rgba(255,255,255,0.025)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            padding: 18
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginBottom: 16
                            }}>
                                <div style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(52,211,153,0.12)'
                                }}>
                                    <Sparkles size={16} color="#34d399" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                                        Amenities Coverage
                                    </h3>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                                        Feature availability across resources
                                    </p>
                                </div>
                            </div>

                            {stats?.amenities && Object.keys(stats.amenities).length > 0 ? (
                                <div style={{ display: 'grid', gap: 12 }}>
                                    {Object.entries(stats.amenities).map(([amenity, count]) => {
                                        const percentage = stats.totalResources
                                            ? Math.round((count / stats.totalResources) * 100)
                                            : 0;

                                        return (
                                            <div
                                                key={amenity}
                                                style={{
                                                    padding: '12px 14px',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    border: '1px solid rgba(255,255,255,0.05)'
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: 8
                                                }}>
                                                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                                                        {amenity}
                                                    </span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                            {percentage}%
                                                        </span>
                                                        <span style={{ fontSize: 18, fontWeight: 700, color: '#34d399' }}>
                                                            {count}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div style={{
                                                    width: '100%',
                                                    height: 8,
                                                    borderRadius: 999,
                                                    background: 'rgba(255,255,255,0.06)',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        width: `${percentage}%`,
                                                        height: '100%',
                                                        background: 'linear-gradient(135deg, #34d399, #10b981)',
                                                        borderRadius: 999
                                                    }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: 26,
                                    color: 'var(--text-muted)',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px dashed var(--border)',
                                    borderRadius: 'var(--radius-sm)'
                                }}>
                                    No amenities data available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Activity Trend Chart */}
                    <div style={{
                        background: 'rgba(255,255,255,0.025)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: 18
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            gap: 12,
                            marginBottom: 14
                        }}>
                            <div>
                                <h3 style={{
                                    fontSize: 16,
                                    fontWeight: 700,
                                    margin: 0,
                                    color: 'var(--text-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8
                                }}>
                                    <TrendingUp size={16} color="var(--accent)" />
                                    Resource Activity Trend
                                </h3>
                                <p style={{
                                    fontSize: 12,
                                    color: 'var(--text-muted)',
                                    margin: '4px 0 0 0'
                                }}>
                                    {timeRangeLabel} activity signal based on analytics data
                                </p>
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '8px 12px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--border)',
                                borderRadius: 12,
                                fontSize: 12,
                                color: 'var(--text-secondary)',
                                fontWeight: 600
                            }}>
                                <Clock size={13} />
                                Live snapshot
                            </div>
                        </div>

                        {stats?.bookingTrendData && stats.bookingTrendData.length > 0 ? (
                            <div style={{
                                position: 'relative',
                                padding: '18px 12px 8px 12px',
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
                                borderRadius: 14,
                                border: '1px solid rgba(255,255,255,0.04)'
                            }}>
                                <svg width="100%" height={160} viewBox={`0 0 ${chartWidth} 160`} preserveAspectRatio="none">
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
                                            opacity="0.22"
                                        />
                                    )}

                                    <polyline
                                        fill="none"
                                        stroke="url(#lineGradient)"
                                        strokeWidth="3"
                                        points={pointsData.map(point => `${point.x},${point.y + 20}`).join(' ')}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />

                                    {pointsData.map((point, idx) => (
                                        <g key={idx}>
                                            <circle
                                                cx={point.x}
                                                cy={point.y + 20}
                                                r={hoveredIndex === idx ? 7 : 4}
                                                fill={hoveredIndex === idx ? 'var(--accent)' : 'rgba(255,255,255,0.18)'}
                                                stroke={hoveredIndex === idx ? 'white' : 'none'}
                                                strokeWidth="2"
                                                style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                                                onMouseEnter={() => setHoveredIndex(idx)}
                                                onMouseLeave={() => setHoveredIndex(null)}
                                            />
                                        </g>
                                    ))}

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

                                {hoveredIndex !== null && pointsData[hoveredIndex] && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: `${(pointsData[hoveredIndex].x / chartWidth) * 100}%`,
                                            top: `${pointsData[hoveredIndex].y - 2}px`,
                                            transform: 'translate(-50%, -100%)',
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border)',
                                            borderRadius: 10,
                                            padding: '9px 12px',
                                            boxShadow: '0 10px 24px rgba(0,0,0,0.32)',
                                            pointerEvents: 'none',
                                            zIndex: 10,
                                            minWidth: 88,
                                            textAlign: 'center'
                                        }}
                                    >
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>
                                            {pointsData[hoveredIndex].label}
                                        </div>
                                        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>
                                            {pointsData[hoveredIndex].count}
                                        </div>
                                        <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>resources</div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: 40,
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px dashed var(--border)'
                            }}>
                                <p style={{ color: 'var(--text-muted)', margin: 0 }}>No trend data available</p>
                            </div>
                        )}

                        {stats?.bookingTrendData && stats.bookingTrendData.length > 0 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: 10,
                                padding: '0 4px'
                            }}>
                                {stats.bookingTrendData.map((day, idx) => (
                                    <span
                                        key={idx}
                                        style={{
                                            fontSize: 10,
                                            color: 'var(--text-muted)',
                                            textAlign: 'center',
                                            flex: 1,
                                            fontWeight: hoveredIndex === idx ? 700 : 500
                                        }}
                                    >
                                        {day.label}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Summary footer */}
                    <div style={{
                        marginTop: 28,
                        paddingTop: 18,
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 12,
                        fontSize: 11,
                        color: 'var(--text-muted)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <CheckCircle2 size={13} color="#34d399" />
                            Data reflects the current resource portfolio snapshot
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Clock size={13} />
                            Last updated: {new Date().toLocaleString()}
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

export default ResourceAnalytics;