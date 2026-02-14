import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, Wallet, Edit2, Save, X, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';

export default function Balance() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'checking',
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
        percentage: 0
      });
      setShowForm(false);
      setFormData({
        name: '',
        type: 'checking',
        icon: 'wallet'
      });
      loadAccounts();
    } catch (error) {
      console.error('Failed to create account:', error);
    }
  };

  const startEdit = (account: any) => {
    setEditingId(account.id);
    setEditValue(account.actual_balance || '0');
  };

  const saveEdit = async (id: number) => {
    try {
      await api.updateAccount(id, {
        actual_balance: parseFloat(editValue)
      });
      setEditingId(null);
      loadAccounts();
    } catch (error) {
      console.error('Failed to update account:', error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const totalPlanned = accounts.reduce((sum, acc) => sum + parseFloat(acc.planned_balance || 0), 0);
  const totalActual = accounts.reduce((sum, acc) => sum + parseFloat(acc.actual_balance || 0), 0);
  const difference = totalActual - totalPlanned;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Баланс
          </h1>
          <p className="text-gray-400">Управление счетами и распределение средств</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <div className="relative flex items-center gap-2 text-white font-semibold">
            <Plus className="w-5 h-5" />
            Добавить счёт
          </div>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <div className="relative glass-card rounded-3xl p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-400 text-sm">Должно быть</p>
            </div>
            <p className="text-4xl font-bold text-white">${totalPlanned.toFixed(2)}</p>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <div className="relative glass-card rounded-3xl p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-400 text-sm">Фактически</p>
            </div>
            <p className="text-4xl font-bold text-white">${totalActual.toFixed(2)}</p>
          </div>
        </div>

        <div className="relative group">
          <div className={`absolute inset-0 ${difference >= 0 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-pink-600'} rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>
          <div className="relative glass-card rounded-3xl p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className={`w-12 h-12 ${difference >= 0 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-pink-600'} rounded-xl flex items-center justify-center`}>
                {difference >= 0 ? <TrendingUp className="w-6 h-6 text-white" /> : <TrendingDown className="w-6 h-6 text-white" />}
              </div>
              <p className="text-gray-400 text-sm">Разница</p>
            </div>
            <p className={`text-4xl font-bold ${difference >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {difference >= 0 ? '+' : ''}${difference.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Add Account Form */}
      {showForm && (
        <div className="glass-card rounded-3xl p-8 animate-slide-down">
          <h2 className="text-2xl font-bold text-white mb-6">Новый счёт</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Название счёта</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Например: Основной счёт"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Тип</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="checking" className="bg-slate-800">Текущий</option>
                  <option value="savings" className="bg-slate-800">Накопительный</option>
                  <option value="emergency" className="bg-slate-800">Подушка безопасности</option>
                  <option value="cash" className="bg-slate-800">Наличные</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Иконка</label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="wallet" className="bg-slate-800">💳 Кошелёк</option>
                  <option value="card" className="bg-slate-800">💳 Карта</option>
                  <option value="bank" className="bg-slate-800">🏦 Банк</option>
                  <option value="savings" className="bg-slate-800">🐷 Копилка</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform duration-300"
              >
                Создать счёт
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

      {/* Accounts List */}
      <div className="glass-card rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Счета</h2>
        {accounts.length > 0 ? (
          <div className="space-y-6">
            {accounts.map((account, index) => (
              <div
                key={account.id}
                className="relative group bg-white/5 hover:bg-white/10 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl">
                    {account.icon === 'wallet' && '💳'}
                    {account.icon === 'card' && '💳'}
                    {account.icon === 'bank' && '🏦'}
                    {account.icon === 'savings' && '🐷'}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{account.name}</p>
                    <p className="text-sm text-gray-400 capitalize">{account.type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-gray-400 mb-2">Должно быть</p>
                    <p className="text-3xl font-bold text-white">
                      ${parseFloat(account.planned_balance || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-500/20 to-indigo-600/20 rounded-xl p-4 border border-blue-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-300">Фактически</p>
                      {editingId === account.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(account.id)}
                            className="p-1 text-green-400 hover:bg-green-500/20 rounded-lg transition-all"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(account)}
                          className="p-1 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {editingId === account.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full text-3xl font-bold text-white bg-white/10 border border-blue-400/50 rounded-xl px-3 py-2"
                        autoFocus
                      />
                    ) : (
                      <p className="text-3xl font-bold text-white">
                        ${parseFloat(account.actual_balance || 0).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
              <Wallet className="w-12 h-12 text-white" />
            </div>
            <p className="text-gray-400 text-lg mb-4">Нет счетов</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform duration-300"
            >
              Создать первый счёт
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
