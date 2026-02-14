import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, TrendingUp, Calendar, Edit2, Save, X, Trash2, DollarSign } from 'lucide-react';

export default function Income() {
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
      
      const incomeTransactions = txData.filter((t: any) => t.transaction_type === 'income');
      setTransactions(incomeTransactions);
      setCategories(catData.filter((c: any) => c.type === 'income'));
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

  const totalIncome = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Доходы
          </h1>
          <p className="text-gray-400">Отслеживайте источники дохода</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/50"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <div className="relative flex items-center gap-2 text-white font-semibold">
            <Plus className="w-5 h-5" />
            Добавить доход
          </div>
        </button>
      </div>

      {/* Total Income Card */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
        <div className="relative glass-card rounded-3xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur-lg opacity-75"></div>
                <div className="relative w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Всего доходов</p>
                <p className="text-5xl font-bold text-white">${totalIncome.toFixed(2)}</p>
              </div>
            </div>
            <div className="text-green-400 text-6xl opacity-10">
              <DollarSign className="w-24 h-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Add Income Form */}
      {showForm && (
        <div className="glass-card rounded-3xl p-8 animate-slide-down">
          <h2 className="text-2xl font-bold text-white mb-6">Новый доход</h2>
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
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Категория</label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Введите описание"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform duration-300"
              >
                Добавить доход
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
        <h2 className="text-2xl font-bold text-white mb-6">История доходов</h2>
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
                      <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-2xl">
                        {transaction.category_icon}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-lg">{transaction.category_name}</p>
                        <p className="text-gray-400 text-sm">{transaction.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-green-400 font-bold text-2xl">+${parseFloat(transaction.amount).toFixed(2)}</p>
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
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
              <TrendingUp className="w-12 h-12 text-white" />
            </div>
            <p className="text-gray-400 text-lg">Нет транзакций</p>
            <p className="text-gray-500 text-sm mt-2">Добавьте свой первый доход</p>
          </div>
        )}
      </div>
    </div>
  );
}
