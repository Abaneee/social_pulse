/**
 * Social Pulse - API Service Layer
 * Axios instance with JWT auth interceptors and all API call functions.
 */
// import axios from 'axios';

// const API_BASE_URL = import.meta.env.VITE_API_URL || 10000 ;

// // Create axios instance
// const api = axios.create({
//     baseURL: API_BASE_URL,
//     headers: {
//         'Content-Type': 'application/json',
//     },
// });

import axios from 'axios';

// FIX: Fallback should be a string URL, not a number
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: Attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: Refresh token on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Prevent infinite loops
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
                        refresh: refreshToken,
                    });

                    const { access } = response.data;
                    localStorage.setItem('access_token', access);

                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh failed - logout user
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/';
                    return Promise.reject(refreshError);
                }
            } else {
                // No refresh token available
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

// Auth Service
export const register = (userData) => api.post('/auth/register/', userData);
export const login = (credentials) => api.post('/auth/login/', credentials);
export const getUserProfile = () => api.get('/auth/user/');
export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

// Dataset Service
export const uploadDataset = (formData) => api.post('/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});
export const getDatasets = () => api.get('/datasets/');
export const activateDataset = (id) => api.post(`/datasets/${id}/activate/`);

// Processing Service
export const processData = (options) => api.post('/process/', options);

// EDA Service
export const getEDAReport = () => api.get('/eda/');

// ML Service
export const trainModels = (data) => api.post('/train/', data);

// Insights / Prediction Service
export const predictInsights = (filters) => api.post('/predict/insights/', filters);

// Dashboard Service
export const getDashboardData = () => api.get('/dashboard/');
export const getFilters = () => api.get('/filters/');

export default api;
