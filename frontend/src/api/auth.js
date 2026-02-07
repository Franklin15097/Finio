import api from './client';

export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Get current user info
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put('/users/me', userData);
    return response.data;
  },

  // Link Telegram account
  linkTelegram: async (telegramId) => {
    const response = await api.post('/users/link-telegram', { telegram_id: telegramId });
    return response.data;
  },
};