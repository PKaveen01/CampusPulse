import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, BarChart3 } from 'lucide-react';
import ResourceCard from '../../components/resources/ResourceCard';
import ResourceSearch from '../../components/resources/ResourceSearch';
import ResourceForm from './ResourceForm';
import resourceService from '../../services/resourceService';
import { useAuth } from '../../context/AuthContext';

const ResourceList = () => {
    const navigate = useNavigate();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [resourceTypes, setResourceTypes] = useState([]);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 12,
        totalPages: 0,
        totalElements: 0
    });
    
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    const fetchResources = async (page = pagination.page) => {
        try {
            setLoading(true);
            const data = await resourceService.getAllResources(page, pagination.size);
            setResources(data.content || []);
            setPagination({
                ...pagination,
                page: data.number || 0,
                totalPages: data.totalPages || 0,
                totalElements: data.totalElements || 0
            });
        } catch (error) {
            console.error('Failed to fetch resources:', error);
        } finally {
            setLoading(false);
        }
    };

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
            setPagination({
                ...pagination,
                page: 0,
                totalPages: data.totalPages || 0,
                totalElements: data.totalElements || 0
            });
        } catch (error) {
            console.error('Search failed:', error);
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
        } catch (error) {
            console.error('Create failed:', error);
            alert('Failed to create resource: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleUpdate = async (formData) => {
        try {
            await resourceService.updateResource(editingResource.id, formData);
            setEditingResource(null);
            fetchResources(pagination.page);
        } catch (error) {
            console.error('Update failed:', error);
            alert('Failed to update resource.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this resource?')) {
            try {
                await resourceService.deleteResource(id);
                fetchResources(pagination.page);
            } catch (error) {
                console.error('Delete failed:', error);
                alert('Failed to delete resource.');
            }
        }
    };

    const handleStatusToggle = async (resource) => {
        try {
            if (resource.status === 'ACTIVE') {
                const reason = prompt('Reason for taking out of service:');
                if (reason) {
                    await resourceService.markAsOutOfService(resource.id, reason);
                }
            } else {
                await resourceService.markAsActive(resource.id);
            }
            fetchResources(pagination.page);
        } catch (error) {
            console.error('Status update failed:', error);
            alert('Failed to update status.');
        }
    };

    const handleViewDetails = (resource) => {
        console.log('View details for:', resource);
    };

    const handleAnalytics = () => {
        navigate('/resources/analytics');
    };

    useEffect(() => {
        fetchResources();
        fetchResourceTypes();
    }, []);

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px', animation: 'fadeIn 0.4s ease' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, background: 'linear-gradient(135deg, var(--text-primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        Facilities & Resources
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                        {pagination.totalElements} {pagination.totalElements === 1 ? 'resource' : 'resources'} available
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    {/* Analytics Button */}
                    <button
                        onClick={handleAnalytics}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 20px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: 14,
                            fontWeight: 500
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

                    {/* Refresh Button */}
                    <button
                        onClick={() => fetchResources(pagination.page)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 20px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: 14,
                            fontWeight: 500
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
                        <RefreshCw size={16} /> Refresh
                    </button>

                    {/* Add Resource Button - Admin Only */}
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
                                transition: 'all 0.2s',
                                fontSize: 14,
                                fontWeight: 500,
                                boxShadow: '0 0 20px rgba(79,142,247,0.3)'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 0 30px rgba(79,142,247,0.5)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 0 20px rgba(79,142,247,0.3)';
                            }}
                        >
                            <Plus size={16} /> Add Resource
                        </button>
                    )}
                </div>
            </div>

            {/* Search Component */}
            <ResourceSearch 
                onSearch={handleSearch} 
                onClear={handleClearSearch} 
                resourceTypes={resourceTypes}
            />

            {/* Loading State */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '64px' }}>
                    <div style={{ 
                        width: 48, 
                        height: 48, 
                        border: '3px solid var(--border)', 
                        borderTopColor: 'var(--accent)', 
                        borderRadius: '50%', 
                        margin: '0 auto',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>Loading resources...</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && resources.length === 0 && (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '64px', 
                    background: 'var(--bg-card)', 
                    borderRadius: 'var(--radius)', 
                    border: '1px solid var(--border)',
                    marginTop: 24
                }}>
                    <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 16 }}>No resources found.</p>
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
                                fontWeight: 500
                            }}
                        >
                            Add your first resource
                        </button>
                    )}
                </div>
            )}

            {/* Resource Grid */}
            {!loading && resources.length > 0 && (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
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

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
                    <button
                        onClick={() => fetchResources(pagination.page - 1)}
                        disabled={pagination.page === 0}
                        style={{
                            padding: '8px 16px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-secondary)',
                            cursor: pagination.page === 0 ? 'not-allowed' : 'pointer',
                            opacity: pagination.page === 0 ? 0.5 : 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        Previous
                    </button>
                    <span style={{ padding: '8px 16px', color: 'var(--text-primary)' }}>
                        Page {pagination.page + 1} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => fetchResources(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages - 1}
                        style={{
                            padding: '8px 16px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-secondary)',
                            cursor: pagination.page >= pagination.totalPages - 1 ? 'not-allowed' : 'pointer',
                            opacity: pagination.page >= pagination.totalPages - 1 ? 0.5 : 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        Next
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
        </div>
    );
};

export default ResourceList;