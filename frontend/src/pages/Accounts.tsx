import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, Wallet, CreditCard, Landmark, PiggyBank } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const ACCOUNT_ICONS: any = {
  wallet: Wallet,
  card: CreditCard,
  bank: Landmark,
  savings: PiggyBank
};

export default function Accounts() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'checking',
    balance: '',
    currency: 'USD',
    icon: 'wallet'
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await api.getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAccount({
        ...formData,
        balance: parseFloat(formData.balance)
      });
      setShowForm(false);
      setFormData({
        name: '',
        type: 'checking',
        balance: '',
        currency: 'USD',
        icon: 'wallet'
      });
      loadAccounts();
    } catch (error) {
      console.error('Failed to create account:', error);
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);

  // Mock trend data for mini charts
  const generateTrendData = () => {
    return Array.from({ length: 7 }, (_, i) => ({
      value: Math.random() * 100 + 50
    }));
  };

  if (loading) {
    return <div className="text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-500 mt-1">Manage your financial accounts</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Account
        </button>
      </div>

      {/* Total Balance */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-100 rounded-xl">
            <Wallet className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Balance</p>
            <p className="text-4xl font-bold text-gray-900">${totalBalance.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Add Account Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">New Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Main Checking"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                  <option value="credit">Credit Card</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="wallet">💳 Wallet</option>
                  <option value="card">💳 Card</option>
                  <option value="bank">🏦 Bank</option>
                  <option value="savings">🐷 Savings</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Initial Balance</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="RUB">RUB</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition font-medium"
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => {
          const Icon = ACCOUNT_ICONS[account.icon] || Wallet;
          const trendData = generateTrendData();
          
          return (
            <div key={account.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-100 rounded-xl">
                    <Icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">{account.name}</p>
                    <p className="text-gray-500 text-sm capitalize">{account.type}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-3xl font-bold text-gray-900">
                  ${parseFloat(account.balance).toFixed(2)}
                </p>
                <p className="text-gray-500 text-sm">{account.currency}</p>
              </div>

              {/* Mini trend chart */}
              <div className="h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#6366f1" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      {accounts.length === 0 && !showForm && (
        <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
          <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No accounts yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition font-medium"
          >
            Create Your First Account
          </button>
        </div>
      )}
    </div>
  );
}
