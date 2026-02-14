import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, Wallet, Edit2, Save, X } from 'lucide-react';

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
    return <div className="text-gray-400">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Баланс</h1>
          <p className="text-gray-500 mt-1">Управление счетами и распределение средств</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition font-medium"
        >
          <Plus className="w-5 h-5" />
          Добавить счёт
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm mb-1">Должно быть на счетах</p>
          <p className="text-3xl font-bold text-gray-900">${totalPlanned.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm mb-1">Фактически на счетах</p>
          <p className="text-3xl font-bold text-gray-900">${totalActual.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm mb-1">Разница</p>
          <p className={`text-3xl font-bold ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {difference >= 0 ? '+' : ''}${difference.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Add Account Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Новый счёт</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Название счёта</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Например: Основной счёт"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Тип</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="checking">Текущий</option>
                  <option value="savings">Накопительный</option>
                  <option value="emergency">Подушка безопасности</option>
                  <option value="cash">Наличные</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Иконка</label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="wallet">💳 Кошелёк</option>
                  <option value="card">💳 Карта</option>
                  <option value="bank">🏦 Банк</option>
                  <option value="savings">🐷 Копилка</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition font-medium"
              >
                Создать счёт
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition font-medium"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Accounts List */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Счета</h2>
        {accounts.length > 0 ? (
          <div className="space-y-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="p-6 border border-gray-200 rounded-xl hover:border-indigo-300 transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl">
                      {account.icon === 'wallet' && '💳'}
                      {account.icon === 'card' && '💳'}
                      {account.icon === 'bank' && '🏦'}
                      {account.icon === 'savings' && '🐷'}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{account.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{account.type}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Должно быть</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${parseFloat(account.planned_balance || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="p-4 bg-indigo-50 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-gray-500">Фактически</p>
                      {editingId === account.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(account.id)}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(account)}
                          className="p-1 text-indigo-600 hover:bg-indigo-100 rounded"
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
                        className="w-full text-2xl font-bold text-gray-900 bg-white border border-indigo-300 rounded px-2 py-1"
                        autoFocus
                      />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">
                        ${parseFloat(account.actual_balance || 0).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Нет счетов</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition font-medium"
            >
              Создать первый счёт
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
