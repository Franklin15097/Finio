import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Percent, Save } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('distribution');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'distribution', label: 'Распределение', icon: Percent },
    { id: 'profile', label: 'Профиль', icon: User },
  ];

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

  const handlePercentageChange = (id: number, value: string) => {
    setAccounts(accounts.map(acc => 
      acc.id === id ? { ...acc, percentage: value } : acc
    ));
  };

  const saveDistribution = async () => {
    setSaving(true);
    try {
      // Validate total is 100%
      const total = accounts.reduce((sum, acc) => sum + parseFloat(acc.percentage || 0), 0);
      if (Math.abs(total - 100) > 0.01) {
        alert(`Сумма процентов должна быть 100%. Сейчас: ${total.toFixed(2)}%`);
        setSaving(false);
        return;
      }

      // Save each account
      for (const account of accounts) {
        await api.updateAccount(account.id, {
          percentage: parseFloat(account.percentage)
        });
      }

      alert('Распределение сохранено!');
      loadAccounts();
    } catch (error) {
      console.error('Failed to save distribution:', error);
      alert('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const totalPercentage = accounts.reduce((sum, acc) => sum + parseFloat(acc.percentage || 0), 0);

  if (loading) {
    return <div className="text-gray-400">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Настройки</h1>
        <p className="text-gray-500 mt-1">Управление аккаунтом и распределением</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                      activeTab === tab.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'distribution' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Распределение доходов</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Укажите процент от доходов для каждого счёта
                  </p>
                </div>
                <button
                  onClick={saveDistribution}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-xl transition font-medium"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>

              {/* Total Percentage Indicator */}
              <div className={`mb-6 p-4 rounded-xl ${
                Math.abs(totalPercentage - 100) < 0.01 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Общая сумма процентов:</span>
                  <span className={`text-2xl font-bold ${
                    Math.abs(totalPercentage - 100) < 0.01 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {totalPercentage.toFixed(2)}%
                  </span>
                </div>
                {Math.abs(totalPercentage - 100) >= 0.01 && (
                  <p className="text-sm text-red-600 mt-2">
                    Сумма должна быть 100%. Осталось: {(100 - totalPercentage).toFixed(2)}%
                  </p>
                )}
              </div>

              {/* Accounts List */}
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl">
                          {account.icon === 'wallet' && '💳'}
                          {account.icon === 'card' && '💳'}
                          {account.icon === 'bank' && '🏦'}
                          {account.icon === 'savings' && '🐷'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{account.name}</p>
                          <p className="text-sm text-gray-500 capitalize">{account.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={account.percentage}
                          onChange={(e) => handlePercentageChange(account.id, e.target.value)}
                          className="w-24 px-4 py-2 text-right border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-bold text-lg"
                        />
                        <span className="text-gray-500 font-medium">%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {accounts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Нет счетов для настройки</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Создайте счета на странице "Баланс"
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Информация профиля</h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-indigo-600" />
                  </div>
                  <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition font-medium">
                    Изменить аватар
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Имя</label>
                  <input
                    type="text"
                    defaultValue={user?.name}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Новый пароль</label>
                  <input
                    type="password"
                    placeholder="Оставьте пустым, чтобы не менять"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition font-medium">
                  Сохранить изменения
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
