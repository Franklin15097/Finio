const API_URL = window.location.origin + '/api';

// Получаем токен из localStorage
function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export const api = {
  // Auth
  async register(data) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to register');
    return response.json();
  },

  async login(data) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to login');
    return response.json();
  },

  // Transactions
  async getTransactions() {
    const response = await fetch(`${API_URL}/transactions`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  async createTransaction(data) {
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create transaction');
    return response.json();
  },

  async updateTransaction(id, data) {
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update transaction');
    return response.json();
  },

  async deleteTransaction(id) {
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete transaction');
    return response.json();
  },

  // Recurring Expenses
  async getRecurringExpenses() {
    const response = await fetch(`${API_URL}/recurring-expenses`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch recurring expenses');
    return response.json();
  },

  async createRecurringExpense(data) {
    const response = await fetch(`${API_URL}/recurring-expenses`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create recurring expense');
    return response.json();
  },

  async deleteRecurringExpense(id) {
    const response = await fetch(`${API_URL}/recurring-expenses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete recurring expense');
    return response.json();
  },

  // Assets
  async getAssets() {
    const response = await fetch(`${API_URL}/assets`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch assets');
    return response.json();
  },

  async createAsset(data) {
    const response = await fetch(`${API_URL}/assets`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create asset');
    return response.json();
  },

  async updateAsset(id, data) {
    const response = await fetch(`${API_URL}/assets/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update asset');
    return response.json();
  },

  async deleteAsset(id) {
    const response = await fetch(`${API_URL}/assets/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete asset');
    return response.json();
  },

  // Asset Categories
  async getAssetCategories() {
    const response = await fetch(`${API_URL}/asset-categories`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch asset categories');
    return response.json();
  },

  async createAssetCategory(data) {
    const response = await fetch(`${API_URL}/asset-categories`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create asset category');
    return response.json();
  },

  // Stats
  async getStats() {
    const response = await fetch(`${API_URL}/stats`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  }
};
