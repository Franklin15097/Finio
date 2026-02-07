import api from './client';

export const categoriesAPI = {
  // Get categories with optional type filter
  getCategories: async (type = null) => {
    const params = type ? { transaction_type: type } : {};
    const response = await api.get('/categories/', { params });
    return response.data;
  },

  // Get category by ID
  getCategory: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Create new category
  createCategory: async (categoryData) => {
    const response = await api.post('/categories/', categoryData);
    return response.data;
  },

  // Update category
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete category
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};