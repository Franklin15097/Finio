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

  loginWithTelegramWidget: async (userData: any) => {
    const res = await fetch(`${API_URL}/auth/telegram-widget`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  exchangeAuthToken: async (authToken: string) => {
    console.log('Exchanging auth token:', authToken.substring(0, 10) + '...');
    const res = await fetch(`${API_URL}/auth/exchange-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authToken }),
    });
    
    const data = await res.json();
    console.log('Exchange token response status:', res.status);
    console.log('Exchange token response data:', data);
    
    if (!res.ok) {
      throw new Error(data.error || 'Token exchange failed');
    }
    
    return data;
  },

  getMe: async () => {
    console.log('api.getMe() called');
    console.log('Token:', getToken());
    console.log('Headers:', headers());
    
    const res = await fetch(`${API_URL}/auth/me`, { headers: headers() });
    console.log('Response status:', res.status);
    
    const data = await res.json();
    console.log('Response data:', data);
    
    return data;
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

  // Analytics
  getCategoryAnalytics: async (params?: { startDate?: string; endDate?: string; type?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_URL}/analytics/categories?${query}`, { headers: headers() });
    return res.json();
  },

  getHeatmapData: async (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_URL}/analytics/heatmap?${query}`, { headers: headers() });
    return res.json();
  },

  comparePeriods: async (period1Start: string, period1End: string, period2Start: string, period2End: string) => {
    const query = new URLSearchParams({ period1Start, period1End, period2Start, period2End }).toString();
    const res = await fetch(`${API_URL}/analytics/compare-periods?${query}`, { headers: headers() });
    return res.json();
  },

  getForecast: async (days: number = 30) => {
    const res = await fetch(`${API_URL}/analytics/forecast?days=${days}`, { headers: headers() });
    return res.json();
  },

  getTopExpenses: async (params?: { limit?: number; startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_URL}/analytics/top-expenses?${query}`, { headers: headers() });
    return res.json();
  },

  getTrends: async (period: 'day' | 'week' | 'month' = 'month') => {
    const res = await fetch(`${API_URL}/analytics/trends?period=${period}`, { headers: headers() });
    return res.json();
  },

  exportCSV: async (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_URL}/analytics/export/csv?${query}`, { headers: headers() });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  exportExcel: async (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_URL}/analytics/export/excel?${query}`, { headers: headers() });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${Date.now()}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  exportPDF: async (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_URL}/analytics/export/pdf?${query}`, { headers: headers() });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};
