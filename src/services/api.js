import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (data) => api.post('/auth/register', data),
    me: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/password', data),
    logout: () => api.post('/auth/logout'),
};

// Hospitals API
export const hospitalsApi = {
    getAll: (params) => api.get('/hospitals', { params }),
    getById: (id) => api.get(`/hospitals/${id}`),
    create: (data) => api.post('/hospitals', data),
    update: (id, data) => api.put(`/hospitals/${id}`, data),
    delete: (id) => api.delete(`/hospitals/${id}`),
    getTypes: () => api.get('/hospitals/types'),
    getDistricts: () => api.get('/hospitals/districts'),
};

// Pharmacies API
export const pharmaciesApi = {
    getAll: (params) => api.get('/pharmacies', { params }),
    getById: (id) => api.get(`/pharmacies/${id}`),
    create: (data) => api.post('/pharmacies', data),
    update: (id, data) => api.put(`/pharmacies/${id}`, data),
    delete: (id) => api.delete(`/pharmacies/${id}`),
    getDuty: (district) => api.get('/pharmacies/duty', { params: { district } }),
    getDistricts: () => api.get('/pharmacies/districts'),
    updateDutyStatus: (id, onDuty) => api.put(`/pharmacies/${id}/duty`, { on_duty: onDuty }),
};

// Users API
export const usersApi = {
    getAll: (params) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
    getStats: () => api.get('/users/stats'),
};

// Admin API
export const adminApi = {
    getDashboard: () => api.get('/admin/dashboard'),
    getSettings: () => api.get('/admin/settings'),
    updateSetting: (key, value) => api.put(`/admin/settings/${key}`, { value }),
    getLogs: (params) => api.get('/admin/logs', { params }),
    createLog: (data) => api.post('/admin/logs', data),
};

export { api };
export default api;
