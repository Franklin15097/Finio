const API_URL = '/api';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
});

export const api = {
  // Auth - Telegram only
  loginWithTelegram: async (initData: string) => {
    const res = await fetch(`${API_URL}/auth/telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    });
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_URL}/auth/me`, { headers: headers() });
    return res.json();
  },

  // Dashboard
  getDashboardStats: async () => {
    const res = await fetch(`${API_URL}/dashboard/stats`, { headers: headers() });
    return res.json();
  },

  // Accounts
  getAccounts: async () => {
    const res = await fetch(`${API_URL}/accounts`, { headers: headers() });
    return res.json();
  },

  createAccount: async (data: any) => {
    const res = await fetch(`${API_URL}/accounts`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateAccount: async (id: number, data: any) => {
    const res = await fetch(`${API_URL}/accounts/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteAccount: async (id: number) => {
    const res = await fetch(`${API_URL}/accounts/${id}`, {
      method: 'DELETE',
      headers: headers(),
    });
    return res.json();
  },

  // Categories
  getCategories: async () => {
    const res = await fetch(`${API_URL}/categories`, { headers: headers() });
    return res.json();
  },

  createCategory: async (data: any) => {
    const res = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateCategory: async (id: number, data: any) => {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteCategory: async (id: number) => {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: headers(),
    });
    return res.json();
  },

  // Transactions
  getTransactions: async () => {
    const res = await fetch(`${API_URL}/transactions`, { headers: headers() });
    return res.json();
  },

  createTransaction: async (data: any) => {
    const res = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateTransaction: async (id: number, data: any) => {
    const res = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteTransaction: async (id: number) => {
    const res = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: headers(),
    });
    return res.json();
  },

  // Budgets
  getBudgets: async () => {
    const res = await fetch(`${API_URL}/budgets`, { headers: headers() });
    return res.json();
  },

  createBudget: async (data: any) => {
    const res = await fetch(`${API_URL}/budgets`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
