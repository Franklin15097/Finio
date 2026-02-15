import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import IconPicker, { getIconComponent } from '../components/IconPicker';
import { Plus, Wallet, Edit2, Trash2, TrendingUp, PiggyBank } from 'lucide-react';

export default function Accounts() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  
  const [accountForm, setAccountForm] = useState({
    name: '',
    icon: 'Wallet',
    percentage: '',
    actual_balance: ''
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
      if (editingAccount) {
        await api.updateAccount(editingAccount.id, {
          ...accountForm,
          percentage: parseFloat(accountForm.percentage),
          actual_balance: parseFloat(accountForm.actual_balance)
        });
      } else {
        await api.createAccount({
          ...accountForm,
          percentage: parseFloat(accountForm.percentage),
          actual_balance: parseFloat(accountForm.actual_balance)
        });
      }
      setShowModal(false);
      setEditingAccount(null);
      setAccountForm({ name: '', icon: 'Wallet', percentage: '', actual_balance: '' });
      loadAccounts();
    } catch (error) {
      console.error('Failed to save account:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Удалить счёт?')) {
      try {
        await api.deleteAccount(id);
        loadAccounts();
      } catch (error) {
        console.error('Failed to delete account:', error);
      }
    }
  };

  const openEdit = (account: any) => {
    setEditingAccount(account);
    setAccountForm({
      name: account.name,
      icon: account.icon,
      percentage: account.percentage.toString(),
      actual_balance: account.actual_balance.toString()
    });
    setShowModal(true);
  };

  const totalPercentage = accounts.reduce((sum, acc) => sum + parseFloat(acc.percentage), 0);
  const totalPlanned = accounts.reduce((sum, acc) => sum + parseFloat(acc.planned_balance), 0);
  const totalActual = accounts.reduce((sum, acc) => sum + parseFloat(acc.actual_balance), 0);

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
        <div className="flex items-center gap-4">
          <img 
            src="/logo2.png" 
            alt="Accounts" 
            className="h-16 w-auto drop-shadow-lg"
          />
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Счета
            </h1>
            <p className="text-purple-200">Управление счетами и распределением доходов</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl transition-all duration-300 hover:scale-105"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <div className="relative flex items-center gap-2 text-white font-semibold">
            <Plus className="w-5 h-5" />
            Добавить счёт
          </div>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Percentage */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <div className="relative glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Распределено</p>
                <p className="text-4xl font-bold text-white">{totalPercentage.toFixed(1)}%</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Total Planned */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <div className="relative glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Планируется</p>
                <p className="text-4xl font-bold text-white">{totalPlanned.toFixed(2)} ₽</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <Wallet className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Total Actual */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <div className="relative glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">По факту</p>
                <p className="text-4xl font-bold text-white">{totalActual.toFixed(2)} ₽</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <PiggyBank className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="glass-card rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Мои счета ({accounts.length})</h2>
        {accounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => {
              const IconComponent = getIconComponent(account.icon);
              const difference = parseFloat(account.actual_balance) - parseFloat(account.planned_balance);
              const isPositive = difference >= 0;
              
              return (
                <div
                  key={account.id}
                  className="group relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-[28px] p-6 transition-all duration-300 hover:scale-[1.02] border border-white/20"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(account)}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Account Name */}
                  <h3 className="text-xl font-bold text-white mb-4">{account.name}</h3>

                  {/* Stats */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Процент</span>
                      <span className="text-sm font-semibold text-blue-400">{account.percentage}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">План</span>
                      <span className="text-sm font-semibold text-green-400">
                        {parseFloat(account.planned_balance).toFixed(2)} ₽
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Факт</span>
                      <span className="text-sm font-semibold text-purple-400">
                        {parseFloat(account.actual_balance).toFixed(2)} ₽
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/10 my-3"></div>

                    {/* Difference */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Разница</span>
                      <span className={`text-lg font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{difference.toFixed(2)} ₽
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
              <Wallet className="w-12 h-12 text-white" />
            </div>
            <p className="text-gray-400 text-lg">Нет счетов</p>
            <p className="text-gray-500 text-sm mt-2">Создайте первый счёт для управления финансами</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => {
          setShowModal(false);
          setEditingAccount(null);
          setAccountForm({ name: '', icon: 'Wallet', percentage: '', actual_balance: '' });
        }} 
        title={editingAccount ? 'Редактировать счёт' : 'Новый счёт'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Название</label>
            <input
              type="text"
              required
              value={accountForm.name}
              onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Например: Основной счёт"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Иконка</label>
            <IconPicker
              selectedIcon={accountForm.icon}
              onSelectIcon={(icon) => setAccountForm({ ...accountForm, icon })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Процент от дохода (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              required
              value={accountForm.percentage}
              onChange={(e) => setAccountForm({ ...accountForm, percentage: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="0.0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Фактический баланс (₽)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={accountForm.actual_balance}
              onChange={(e) => setAccountForm({ ...accountForm, actual_balance: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="0.00"
            />
          </div>
          <button
            type="submit"
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform duration-300"
          >
            {editingAccount ? 'Сохранить' : 'Создать счёт'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
