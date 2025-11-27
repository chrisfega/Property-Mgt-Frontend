import axios from 'axios';

const api = axios.create({
  baseURL: 'https://prop-mgt-backend-api-production.up.railway.app/api/v1',
  // baseURL: 'http://localhost:4000/api/v1', // Secondary: Localhost
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
