import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, TrendingDown, Calendar, Edit2, Save, X, Trash2, CreditCard } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

export default function Expenses() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category_id: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [txData, catData] = await Promise.all([
        api.getTransactions(),
        api.getCategories()
      ]);
      
      const expenseTransactions = txData.filter((t: any) => t.transaction_type === 'expense');
      setTransactions(expenseTransactions);
      setCategories(catData.filter((c: any) => c.type === 'expense'));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTransaction({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setShowForm(false);
      setFormData({
        amount: '',
        description: '',
        category_id: '',
        transaction_date: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  const startEdit = (transaction: any) => {
    setEditingId(transaction.id);
    setEditData({
      amount: transaction.amount,
      description: transaction.description,
      category_id: transaction.category_id,
      transaction_date: transaction.transaction_date
    });
  };

  const saveEdit = async (id: number) => {
    try {
      await api.updateTransaction(id, {
        ...editData,
        amount: parseFloat(editData.amount)
      });
      setEditingId(null);
      loadData();
    } catch (error) {
      console.error('Failed to update transaction:', error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (id: number) => {
    if (confirm('Удалить эту транзакцию?')) {
      try {
        await api.deleteTransaction(id);
        loadData();
      } catch (error) {
        console.error('Failed to delete transaction:', error);
      }
    }
  };

  const totalExpenses = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const categoryData = categories.map(cat => {
    const total = transactions
      .filter(t => t.category_id === cat.id)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    return {
      name: cat.name,
      value: total
    };
  }).filter(d => d.value > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            Расходы
          </h1>
          <p className="text-gray-400">Отслеживайте и управляйте расходами</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/50"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <div className="relative flex items-center gap-2 text-white font-semibold">
            <Plus className="w-5 h-5" />
            Добавить расход
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Expenses Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
          <div className="relative glass-card rounded-3xl p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl blur-lg opacity-75"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center">
                    <TrendingDown className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Всего расходов</p>
                  <p className="text-5xl font-bold text-white">${totalExpenses.toFixed(2)}</p>
                </div>
              </div>
              <div className="text-pink-400 text-6xl opacity-10">
                <CreditCard className="w-24 h-24" />
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glass-card rounded-3xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">По категориям</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: '#fff' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">Нет данных</p>
          )}
        </div>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <div className="glass-card rounded-3xl p-8 animate-slide-down">
          <h2 className="text-2xl font-bold text-white mb-6">Новый расход</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Сумма</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Дата</label>
                <input
                  type="date"
                  required
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Категория</label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              >
                <option value="" className="bg-slate-800">Выберите категорию</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-slate-800">{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Описание</label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                placeholder="Введите описание"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform duration-300"
              >
                Добавить расход
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-semibold transition-all"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transactions List */}
      <div className="glass-card rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">История расходов</h2>
        {transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className="group relative overflow-hidden bg-white/5 hover:bg-white/10 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {editingId === transaction.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <input
                        type="number"
                        step="0.01"
                        value={editData.amount}
                        onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                        placeholder="Сумма"
                      />
                      <input
                        type="date"
                        value={editData.transaction_date}
                        onChange={(e) => setEditData({ ...editData, transaction_date: e.target.value })}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                      />
                      <select
                        value={editData.category_id}
                        onChange={(e) => setEditData({ ...editData, category_id: e.target.value })}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id} className="bg-slate-800">{cat.icon} {cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                      placeholder="Описание"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => saveEdit(transaction.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Сохранить
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center text-2xl">
                        {transaction.category_icon}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-lg">{transaction.category_name}</p>
                        <p className="text-gray-400 text-sm">{transaction.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-red-400 font-bold text-2xl">-${parseFloat(transaction.amount).toFixed(2)}</p>
                        <p className="text-gray-400 text-sm flex items-center gap-1 justify-end">
                          <Calendar className="w-3 h-3" />
                          {transaction.transaction_date}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                        <button
                          onClick={() => startEdit(transaction)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
              <TrendingDown className="w-12 h-12 text-white" />
            </div>
            <p className="text-gray-400 text-lg">Нет транзакций</p>
            <p className="text-gray-500 text-sm mt-2">Добавьте свой первый расход</p>
          </div>
        )}
      </div>
    </div>
  );
}
