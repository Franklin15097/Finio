import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api/v1',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status >= 500) {
      // Server error
      toast.error('Произошла ошибка сервера. Попробуйте позже.');
    } else if (error.response?.data?.detail) {
      // API error with detail
      toast.error(error.response.data.detail);
    } else if (error.message === 'Network Error') {
      toast.error('Ошибка сети. Проверьте подключение к интернету.');
    }
    
    return Promise.reject(error);
  }
);

export default api;