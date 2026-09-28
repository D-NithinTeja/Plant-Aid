import axios, { AxiosInstance } from 'axios';

const API_BASE_URL: string = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor: automatically attaches JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('plant_aid_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handles session expirations and 401s gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      const isAuthUrl = url.includes('/api/auth/login') || url.includes('/api/auth/verify-2fa');
      if (!isAuthUrl) {
        localStorage.removeItem('plant_aid_token');
        localStorage.removeItem('plant_aid_user');
        if (window.location.pathname !== '/auth' && window.location.pathname !== '/') {
          window.location.href = '/auth';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
