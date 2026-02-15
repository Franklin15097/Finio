import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import IconPicker, { getIconComponent } from '../components/IconPicker';
import { Plus, Wallet, Edit2, Trash2, TrendingUp, PiggyBank } from 'lucide-react';
import { isTelegramWebApp } from '../utils/telegram';
import TelegramAccounts from './telegram/TelegramAccounts';

export default function Accounts() {
  // Use Telegram version if in Telegram Mini App
  if (isTelegramWebApp()) {
    return <TelegramAccounts />;
  }
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
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Счета
            </h1>
            <p className="text-white/60 text-sm">Управление счетами</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600/90 to-fuchsia-600/90 rounded-xl text-white font-semibold text-sm flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Добавить
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Total Percentage */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-3 border border-purple-500/20">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-2">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <p className="text-white/60 text-[10px] mb-1">Распределено</p>
          <p className="text-lg font-bold text-white">{totalPercentage.toFixed(1)}%</p>
        </div>

        {/* Total Planned */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-3 border border-purple-500/20">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-2">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <p className="text-white/60 text-[10px] mb-1">План</p>
          <p className="text-lg font-bold text-white">{totalPlanned.toFixed(0)} ₽</p>
        </div>

        {/* Total Actual */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-3 border border-purple-500/20">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-2">
            <PiggyBank className="w-4 h-4 text-white" />
          </div>
          <p className="text-white/60 text-[10px] mb-1">Факт</p>
          <p className="text-lg font-bold text-white">{totalActual.toFixed(0)} ₽</p>
        </div>
      </div>

      {/* Accounts List */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-white">Мои счета ({accounts.length})</h2>
        {accounts.length > 0 ? (
          <div className="space-y-2">
            {accounts.map((account) => {
              const IconComponent = getIconComponent(account.icon);
              const difference = parseFloat(account.actual_balance) - parseFloat(account.planned_balance);
              const isPositive = difference >= 0;
              
              return (
                <div
                  key={account.id}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{account.name}</h3>
                        <p className="text-xs text-gray-400">{account.percentage}%</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(account)}
                        className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">План</span>
                      <span className="text-green-400 font-semibold">
                        {parseFloat(account.planned_balance).toFixed(0)} ₽
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Факт</span>
                      <span className="text-purple-400 font-semibold">
                        {parseFloat(account.actual_balance).toFixed(0)} ₽
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/10 my-2"></div>

                    {/* Difference */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500">Разница</span>
                      <span className={`text-base font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{difference.toFixed(0)} ₽
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 opacity-50">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-400 text-sm">Нет счетов</p>
            <p className="text-gray-500 text-xs mt-1">Создайте первый счёт</p>
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
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Название</label>
            <input
              type="text"
              required
              value={accountForm.name}
              onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500"
              placeholder="Например: Основной счёт"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Иконка</label>
            <IconPicker
              selectedIcon={accountForm.icon}
              onSelectIcon={(icon) => setAccountForm({ ...accountForm, icon })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Процент от дохода (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              required
              value={accountForm.percentage}
              onChange={(e) => setAccountForm({ ...accountForm, percentage: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500"
              placeholder="0.0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Фактический баланс (₽)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={accountForm.actual_balance}
              onChange={(e) => setAccountForm({ ...accountForm, actual_balance: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500"
              placeholder="0.00"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold text-sm"
          >
            {editingAccount ? 'Сохранить' : 'Создать счёт'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
