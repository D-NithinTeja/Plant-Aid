import axios from 'axios';

// Resolve API base URL: defaults to relative /api (proxied via Vite) or explicit env
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('plant_aid_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global errors and 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('plant_aid_token');
      localStorage.removeItem('plant_aid_user');
      window.dispatchEvent(new Event('plant_aid_auth_changed'));
    }
    return Promise.reject(error);
  }
);

export default api;
