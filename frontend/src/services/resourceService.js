import api from './api';

const BASE_URL = '/resources';

const buildQueryString = (params = {}) => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (
            value !== undefined &&
            value !== null &&
            value !== '' &&
            !(Array.isArray(value) && value.length === 0)
        ) {
            if (Array.isArray(value)) {
                value.forEach((item) => searchParams.append(key, item));
            } else {
                searchParams.append(key, value);
            }
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
};

const normalizePaginationResponse = (data, fallbackPage = 0, fallbackSize = 12) => {
    if (data && Array.isArray(data.content)) {
        return data;
    }

    if (Array.isArray(data)) {
        return {
            content: data,
            number: fallbackPage,
            size: fallbackSize,
            totalPages: 1,
            totalElements: data.length,
            first: true,
            last: true
        };
    }

    return {
        content: [],
        number: fallbackPage,
        size: fallbackSize,
        totalPages: 0,
        totalElements: 0,
        first: true,
        last: true
    };
};

const resourceService = {
    // =========================
    // Core CRUD
    // =========================
    getAllResources: async (page = 0, size = 12, sort = 'createdAt,desc') => {
        const query = buildQueryString({ page, size, sort });
        const response = await api.get(`${BASE_URL}${query}`);
        return normalizePaginationResponse(response.data, page, size);
    },

    getResourceById: async (id) => {
        const response = await api.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    createResource: async (data) => {
        console.log('Sending to backend:', data);
        const payload = {
            ...data,
            capacity: data.capacity !== '' && data.capacity !== null && data.capacity !== undefined
                ? Number(data.capacity)
                : data.capacity
        };
        const response = await api.post(BASE_URL, payload);
        return response.data;
    },

    updateResource: async (id, data) => {
        const payload = {
            ...data,
            capacity: data.capacity !== '' && data.capacity !== null && data.capacity !== undefined
                ? Number(data.capacity)
                : data.capacity
        };
        const response = await api.put(`${BASE_URL}/${id}`, payload);
        return response.data;
    },

    deleteResource: async (id) => {
        const response = await api.delete(`${BASE_URL}/${id}`);
        return response.data;
    },

    // =========================
    // Search / Filter / Sort
    // =========================
    searchResources: async (params = {}, page = 0, size = 12, sort = 'createdAt,desc') => {
        const query = buildQueryString({ page, size, sort });
        const response = await api.post(`${BASE_URL}/search${query}`, params);
        return normalizePaginationResponse(response.data, page, size);
    },

    advancedSearchResources: async ({
        page = 0,
        size = 12,
        sort = 'createdAt,desc',
        ...filters
    } = {}) => {
        const query = buildQueryString({ page, size, sort });
        const response = await api.post(`${BASE_URL}/search${query}`, filters);
        return normalizePaginationResponse(response.data, page, size);
    },

    getResourcesByStatus: async (status, page = 0, size = 12) => {
        return resourceService.searchResources({ status }, page, size);
    },

    getResourcesByType: async (type, page = 0, size = 12) => {
        return resourceService.searchResources({ type }, page, size);
    },

    getResourcesByBuilding: async (building, page = 0, size = 12) => {
        return resourceService.searchResources({ building }, page, size);
    },

    // =========================
    // Status Management
    // =========================
    updateResourceStatus: async (id, status) => {
        const response = await api.patch(`${BASE_URL}/${id}/status?status=${encodeURIComponent(status)}`);
        return response.data;
    },

    markAsOutOfService: async (id, reason) => {
        const response = await api.post(
            `${BASE_URL}/${id}/out-of-service?reason=${encodeURIComponent(reason)}`
        );
        return response.data;
    },

    markAsActive: async (id) => {
        const response = await api.post(`${BASE_URL}/${id}/activate`);
        return response.data;
    },

    markAsMaintenance: async (id, reason = '') => {
        try {
            const response = await api.post(
                `${BASE_URL}/${id}/maintenance${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`
            );
            return response.data;
        } catch (error) {
            // Fallback to generic status endpoint if dedicated endpoint does not exist
            return resourceService.updateResourceStatus(id, 'MAINTENANCE');
        }
    },

    // =========================
    // Availability (frontend-ready)
    // These methods are safe additions.
    // They won't affect current logic unless you use them.
    // =========================
    getAvailabilityWindows: async (resourceId) => {
        const response = await api.get(`${BASE_URL}/${resourceId}/availability`);
        return response.data;
    },

    addAvailabilityWindow: async (resourceId, availabilityData) => {
        const response = await api.post(`${BASE_URL}/${resourceId}/availability`, availabilityData);
        return response.data;
    },

    updateAvailabilityWindow: async (resourceId, windowId, availabilityData) => {
        const response = await api.put(
            `${BASE_URL}/${resourceId}/availability/${windowId}`,
            availabilityData
        );
        return response.data;
    },

    deleteAvailabilityWindow: async (resourceId, windowId) => {
        const response = await api.delete(`${BASE_URL}/${resourceId}/availability/${windowId}`);
        return response.data;
    },

    // =========================
    // Analytics
    // =========================
    getResourceAnalytics: async (timeRange = 'week') => {
        try {
            const response = await api.get(`/resources/analytics/dashboard${buildQueryString({ timeRange })}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch resource analytics:', error);
            throw error;
        }
    },

    exportAnalyticsReport: async (format = 'csv') => {
        const response = await api.get(`/resources/analytics/export${buildQueryString({ format })}`, {
            responseType: 'blob'
        });
        return response.data;
    },

    // =========================
    // Export
    // =========================
    exportResources: async (filters = {}, format = 'csv') => {
        try {
            const response = await api.post(
                `${BASE_URL}/export${buildQueryString({ format })}`,
                filters,
                { responseType: 'blob' }
            );
            return response.data;
        } catch (error) {
            console.error('Failed to export resources:', error);
            throw error;
        }
    },

    // =========================
    // Metadata / Lookups
    // Keeping your existing logic intact
    // =========================
    getResourceTypes: async () => {
        return [
            'Lecture Hall',
            'Meeting Room',
            'Laboratory',
            'Equipment',
            'Study Room',
            'Auditorium',
            'Seminar Room',
            'Projector',
            'Camera',
            'Computer Lab'
        ];
    },

    getResourceStatuses: async () => {
        return [
            'ACTIVE',
            'MAINTENANCE',
            'OUT_OF_SERVICE',
            'ACADEMIC_RESERVED',
            'DECOMMISSIONED'
        ];
    },

    getAmenityOptions: async () => {
        return [
            { key: 'isAirConditioned', label: 'Air Conditioned' },
            { key: 'hasProjector', label: 'Projector' },
            { key: 'hasSmartBoard', label: 'Smart Board' },
            { key: 'hasWifi', label: 'WiFi' },
            { key: 'hasPowerOutlets', label: 'Power Outlets' }
        ];
    }
};

export default resourceService;