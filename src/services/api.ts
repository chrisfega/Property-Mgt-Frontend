import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://localhost:4005/api/v1', // Primary: Localhost for testing
  baseURL: 'https://prop-mgt-backend-api-production.up.railway.app/api/v1', // Secondary: Production
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
