import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, BarChart3, Download, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import ResourceCard from '../../components/resources/ResourceCard';
import ResourceSearch from '../../components/resources/ResourceSearch';
import ResourceForm from './ResourceForm';
import resourceService from '../../services/resourceService';
import { useAuth } from '../../context/AuthContext';

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            padding: '12px 20px',
            background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6',
            color: 'white',
            borderRadius: 'var(--radius)',
            fontSize: 14,
            fontWeight: 500,
            zIndex: 1000,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
            animation: 'slideInRight 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 12
        }}>
            <span>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
    );
};

// Skeleton Loader Component
const SkeletonCard = () => (
    <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        animation: 'pulse 1.5s ease-in-out infinite'
    }}>
        <div style={{ height: 140, background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ padding: 16 }}>
            <div style={{ height: 18, background: 'rgba(255,255,255,0.05)', borderRadius: 4, width: '70%', marginBottom: 12 }} />
            <div style={{ height: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 4, width: '50%', marginBottom: 8 }} />
            <div style={{ height: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 4, width: '60%' }} />
        </div>
    </div>
);

const ResourceList = () => {
    const navigate = useNavigate();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [resourceTypes, setResourceTypes] = useState([]);
    const [toast, setToast] = useState(null);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 12,
        totalPages: 0,
        totalElements: 0
    });
    
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const fetchResources = useCallback(async (page = pagination.page) => {
        try {
            setLoading(true);
            const data = await resourceService.getAllResources(page, pagination.size);
            setResources(data.content || []);
            setPagination(prev => ({
                ...prev,
                page: data.number || 0,
                totalPages: data.totalPages || 0,
                totalElements: data.totalElements || 0
            }));
        } catch (error) {
            console.error('Failed to fetch resources:', error);
            showToast('Failed to load resources', 'error');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.size]);

    const fetchResourceTypes = async () => {
        try {
            const types = await resourceService.getResourceTypes();
            setResourceTypes(types);
        } catch (error) {
            console.error('Failed to fetch resource types:', error);
        }
    };

    const handleSearch = async (filters) => {
        try {
            setLoading(true);
            const data = await resourceService.searchResources(filters, 0, pagination.size);
            setResources(data.content || []);
            setPagination(prev => ({
                ...prev,
                page: 0,
                totalPages: data.totalPages || 0,
                totalElements: data.totalElements || 0
            }));
            if (data.totalElements === 0) {
                showToast('No resources found matching your criteria', 'info');
            }
        } catch (error) {
            console.error('Search failed:', error);
            showToast('Search failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleClearSearch = () => {
        fetchResources(0);
    };

    const handleCreate = async (formData) => {
        try {
            await resourceService.createResource(formData);
            setShowForm(false);
            fetchResources(0);
            showToast('Resource created successfully!', 'success');
        } catch (error) {
            console.error('Create failed:', error);
            showToast(error.response?.data?.message || 'Failed to create resource', 'error');
        }
    };

    const handleUpdate = async (formData) => {
        try {
            await resourceService.updateResource(editingResource.id, formData);
            setEditingResource(null);
            fetchResources(pagination.page);
            showToast('Resource updated successfully!', 'success');
        } catch (error) {
            console.error('Update failed:', error);
            showToast('Failed to update resource', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
            try {
                await resourceService.deleteResource(id);
                fetchResources(pagination.page);
                showToast('Resource deleted successfully', 'success');
            } catch (error) {
                console.error('Delete failed:', error);
                showToast('Failed to delete resource', 'error');
            }
        }
    };

    const handleStatusToggle = async (resource) => {
        try {
            if (resource.status === 'ACTIVE') {
                const reason = prompt('Please provide a reason for taking this resource out of service:');
                if (reason) {
                    await resourceService.markAsOutOfService(resource.id, reason);
                    showToast('Resource marked as out of service', 'success');
                }
            } else {
                await resourceService.markAsActive(resource.id);
                showToast('Resource activated successfully', 'success');
            }
            fetchResources(pagination.page);
        } catch (error) {
            console.error('Status update failed:', error);
            showToast('Failed to update status', 'error');
        }
    };

    const handleViewDetails = (resource) => {
        // Navigate to details page or open modal
        navigate(`/resources/${resource.id}`);
    };

    const handleAnalytics = () => {
        navigate('/resources/analytics');
    };

    const exportToCSV = () => {
        try {
            const headers = ['Name', 'Type', 'Capacity', 'Location', 'Building', 'Status', 'Created At'];
            const rows = resources.map(r => [
                r.name,
                r.resourceType,
                r.capacity,
                r.location,
                r.building || '-',
                r.status,
                new Date(r.createdAt).toLocaleDateString()
            ]);
            const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `resources_export_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('Export completed successfully', 'success');
        } catch (error) {
            showToast('Export failed', 'error');
        }
    };

    useEffect(() => {
        fetchResources();
        fetchResourceTypes();
    }, [fetchResources]);

    // Generate skeleton loaders
    const skeletonCount = Math.min(6, pagination.size);

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px', minHeight: '100vh' }}>
            {/* Header Section */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 8 }}>
                    <div>
                        <h1 style={{ 
                            fontSize: 'clamp(24px, 5vw, 32px)', 
                            fontWeight: 700, 
                            background: 'linear-gradient(135deg, #fff, var(--accent))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            marginBottom: 8
                        }}>
                            Facilities & Resources
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                            {pagination.totalElements.toLocaleString()} {pagination.totalElements === 1 ? 'resource' : 'resources'} available
                        </p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {/* Export Button */}
                        {resources.length > 0 && (
                            <button
                                onClick={exportToCSV}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '10px 18px',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    fontWeight: 500,
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = '#10b981';
                                    e.currentTarget.style.color = '#10b981';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                }}
                            >
                                <Download size={16} /> Export
                            </button>
                        )}

                        {/* Analytics Button */}
                        {isAdmin && (
                            <button
                                onClick={handleAnalytics}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '10px 18px',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    fontWeight: 500,
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
                                <BarChart3 size={16} /> Analytics
                            </button>
                        )}

                        {/* Refresh Button */}
                        <button
                            onClick={() => fetchResources(pagination.page)}
                            disabled={loading}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '10px 18px',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-secondary)',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.6 : 1,
                                fontSize: 14,
                                fontWeight: 500,
                                transition: 'all 0.2s'
                            }}
                        >
                            <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> 
                            Refresh
                        </button>

                        {/* Add Resource Button */}
                        {isAdmin && (
                            <button
                                onClick={() => setShowForm(true)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '10px 24px',
                                    background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 14px rgba(79,142,247,0.3)'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,142,247,0.4)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(79,142,247,0.3)';
                                }}
                            >
                                <Plus size={16} /> New Resource
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Stats Summary Bar */}
                {!loading && resources.length > 0 && (
                    <div style={{
                        display: 'flex',
                        gap: 24,
                        marginTop: 20,
                        paddingTop: 16,
                        borderTop: '1px solid var(--border)',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399' }} />
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                Active: {resources.filter(r => r.status === 'ACTIVE').length}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbbf24' }} />
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                Maintenance: {resources.filter(r => r.status === 'MAINTENANCE').length}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f87171' }} />
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                Out of Service: {resources.filter(r => r.status === 'OUT_OF_SERVICE').length}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                Last updated: {new Date().toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Search Component */}
            <ResourceSearch 
                onSearch={handleSearch} 
                onClear={handleClearSearch} 
                resourceTypes={resourceTypes}
            />

            {/* Loading State with Skeletons */}
            {loading && (
                <div style={{ marginTop: 24 }}>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                        gap: 24
                    }}>
                        {[...Array(skeletonCount)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State - Professional Design */}
            {!loading && resources.length === 0 && (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '80px 24px', 
                    background: 'var(--bg-card)', 
                    borderRadius: 'var(--radius)', 
                    border: '1px solid var(--border)',
                    marginTop: 24
                }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>🏢</div>
                    <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
                        No resources yet
                    </h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto 24px' }}>
                        Get started by adding your first resource to the catalogue.
                    </p>
                    {isAdmin && (
                        <button
                            onClick={() => setShowForm(true)}
                            style={{
                                padding: '12px 32px',
                                background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 500,
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            + Add Your First Resource
                        </button>
                    )}
                </div>
            )}

            {/* Resource Grid */}
            {!loading && resources.length > 0 && (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
                    gap: 24,
                    marginTop: 24
                }}>
                    {resources.map(resource => (
                        <ResourceCard
                            key={resource.id}
                            resource={resource}
                            onEdit={setEditingResource}
                            onDelete={handleDelete}
                            onStatusToggle={handleStatusToggle}
                            onViewDetails={handleViewDetails}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
            )}

            {/* Pagination - Enhanced */}
            {!loading && pagination.totalPages > 1 && (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    gap: 8, 
                    marginTop: 48,
                    flexWrap: 'wrap'
                }}>
                    <button
                        onClick={() => fetchResources(0)}
                        disabled={pagination.page === 0}
                        style={{
                            padding: '8px 12px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-secondary)',
                            cursor: pagination.page === 0 ? 'not-allowed' : 'pointer',
                            opacity: pagination.page === 0 ? 0.5 : 1,
                            fontSize: 13
                        }}
                    >
                        First
                    </button>
                    <button
                        onClick={() => fetchResources(pagination.page - 1)}
                        disabled={pagination.page === 0}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '8px 16px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-secondary)',
                            cursor: pagination.page === 0 ? 'not-allowed' : 'pointer',
                            opacity: pagination.page === 0 ? 0.5 : 1
                        }}
                    >
                        <ChevronLeft size={14} /> Previous
                    </button>
                    
                    <div style={{ display: 'flex', gap: 6 }}>
                        {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                            let pageNum;
                            if (pagination.totalPages <= 5) {
                                pageNum = i;
                            } else if (pagination.page < 3) {
                                pageNum = i;
                            } else if (pagination.page > pagination.totalPages - 3) {
                                pageNum = pagination.totalPages - 5 + i;
                            } else {
                                pageNum = pagination.page - 2 + i;
                            }
                            
                            if (pageNum >= 0 && pageNum < pagination.totalPages) {
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => fetchResources(pageNum)}
                                        style={{
                                            minWidth: 36,
                                            padding: '8px 12px',
                                            background: pagination.page === pageNum ? 'linear-gradient(135deg, var(--accent), var(--accent-2))' : 'var(--bg-card)',
                                            border: pagination.page === pageNum ? 'none' : '1px solid var(--border)',
                                            borderRadius: 'var(--radius-sm)',
                                            color: pagination.page === pageNum ? 'white' : 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            fontWeight: pagination.page === pageNum ? 600 : 400
                                        }}
                                    >
                                        {pageNum + 1}
                                    </button>
                                );
                            }
                            return null;
                        })}
                    </div>
                    
                    <button
                        onClick={() => fetchResources(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages - 1}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '8px 16px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-secondary)',
                            cursor: pagination.page >= pagination.totalPages - 1 ? 'not-allowed' : 'pointer',
                            opacity: pagination.page >= pagination.totalPages - 1 ? 0.5 : 1
                        }}
                    >
                        Next <ChevronRight size={14} />
                    </button>
                    <button
                        onClick={() => fetchResources(pagination.totalPages - 1)}
                        disabled={pagination.page >= pagination.totalPages - 1}
                        style={{
                            padding: '8px 12px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-secondary)',
                            cursor: pagination.page >= pagination.totalPages - 1 ? 'not-allowed' : 'pointer',
                            opacity: pagination.page >= pagination.totalPages - 1 ? 0.5 : 1,
                            fontSize: 13
                        }}
                    >
                        Last
                    </button>
                </div>
            )}

            {/* Create/Edit Form Modal */}
            {showForm && (
                <ResourceForm
                    onSubmit={handleCreate}
                    onClose={() => setShowForm(false)}
                    isEditing={false}
                />
            )}

            {editingResource && (
                <ResourceForm
                    resource={editingResource}
                    onSubmit={handleUpdate}
                    onClose={() => setEditingResource(null)}
                    isEditing={true}
                />
            )}

            {/* Toast Notifications */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Add keyframe animations to document */}
            <style>{`
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes pulse {
                    0%, 100% {
                        opacity: 0.3;
                    }
                    50% {
                        opacity: 0.6;
                    }
                }
                
                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
};

export default ResourceList;