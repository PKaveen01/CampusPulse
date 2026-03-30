import api from './api';

const BASE_URL = '/resources';

const resourceService = {
    getAllResources: async (page = 0, size = 12) => {
        const response = await api.get(`${BASE_URL}?page=${page}&size=${size}`);
        return response.data;
    },

    createResource: async (data) => {
        console.log('Sending to backend:', data);
        const response = await api.post(BASE_URL, data);
        return response.data;
    },

    updateResource: async (id, data) => {
        const response = await api.put(`${BASE_URL}/${id}`, data);
        return response.data;
    },

    deleteResource: async (id) => {
        await api.delete(`${BASE_URL}/${id}`);
    },

    searchResources: async (params, page = 0, size = 12) => {
        const response = await api.post(`${BASE_URL}/search?page=${page}&size=${size}`, params);
        return response.data;
    },

    updateResourceStatus: async (id, status) => {
        const response = await api.patch(`${BASE_URL}/${id}/status?status=${status}`);
        return response.data;
    },

    markAsOutOfService: async (id, reason) => {
        const response = await api.post(`${BASE_URL}/${id}/out-of-service?reason=${encodeURIComponent(reason)}`);
        return response.data;
    },

    markAsActive: async (id) => {
        const response = await api.post(`${BASE_URL}/${id}/activate`);
        return response.data;
    },

    getResourceTypes: async () => {
        return [
            'Lecture Hall',
            'Meeting Room',
            'Laboratory',
            'Equipment',
            'Study Room',
            'Auditorium',
            'Seminar Room'
        ];
    }
};

export default resourceService;