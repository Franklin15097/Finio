import api from './client';

export const transactionsAPI = {
  // Get transactions with filters
  getTransactions: async (params = {}) => {
    const response = await api.get('/transactions/', { params });
    return response.data;
  },

  // Get transaction by ID
  getTransaction: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  // Create new transaction
  createTransaction: async (transactionData) => {
    const response = await api.post('/transactions/', transactionData);
    return response.data;
  },

  // Update transaction
  updateTransaction: async (id, transactionData) => {
    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data;
  },

  // Delete transaction
  deleteTransaction: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  // Get transaction statistics
  getStats: async (params = {}) => {
    const response = await api.get('/transactions/stats', { params });
    return response.data;
  },
};