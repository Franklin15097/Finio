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
    type: 'checking',
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
      setAccountForm({ name: '', type: 'checking', icon: 'Wallet', percentage: '', actual_balance: '' });
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
      type: account.type || 'checking',
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
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Счета</h1>
            <p className="text-muted-foreground text-sm">Управление счетами</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600/90 to-fuchsia-600/90 rounded-xl text-white font-semibold text-sm flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" />
          Добавить
        </button>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-xs mb-1">Распределено</p>
              <p className="text-2xl font-bold text-foreground">{totalPercentage.toFixed(1)}%</p>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(100, totalPercentage)}%` }}
            />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-xs mb-1">План</p>
              <p className="text-2xl font-bold text-foreground">{totalPlanned.toFixed(0)} ₽</p>
            </div>
          </div>
          <p className="text-muted-foreground text-xs">Плановый баланс</p>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-xs mb-1">Факт</p>
              <p className="text-2xl font-bold text-foreground">{totalActual.toFixed(0)} ₽</p>
            </div>
          </div>
          <p className="text-muted-foreground text-xs">Фактический баланс</p>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Мои счета ({accounts.length})</h2>
        {accounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => {
              const IconComponent = getIconComponent(account.icon);
              const difference = parseFloat(account.actual_balance) - parseFloat(account.planned_balance);
              const isPositive = difference >= 0;
              const progress = (parseFloat(account.actual_balance || 0) / parseFloat(account.planned_balance || 1)) * 100;
              
              return (
                <div
                  key={account.id}
                  className="glass-card rounded-2xl p-5 hover:scale-105 transition-all group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <IconComponent className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-foreground">{account.name}</h3>
                        <p className="text-xs text-muted-foreground">{account.percentage}% от дохода</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(account)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">План</span>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {parseFloat(account.planned_balance).toFixed(0)} ₽
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Факт</span>
                      <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                        {parseFloat(account.actual_balance).toFixed(0)} ₽
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>

                    {/* Difference */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">Разница</span>
                      <span className={`text-lg font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {isPositive ? '+' : ''}{difference.toFixed(0)} ₽
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 glass-card rounded-2xl">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <p className="text-muted-foreground text-lg mb-2">Нет счетов</p>
            <p className="text-muted-foreground text-sm mb-4">Создайте первый счёт для управления финансами</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform"
            >
              Создать счёт
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => {
          setShowModal(false);
          setEditingAccount(null);
          setAccountForm({ name: '', type: 'checking', icon: 'Wallet', percentage: '', actual_balance: '' });
        }} 
        title={editingAccount ? 'Редактировать счёт' : 'Новый счёт'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Название</label>
            <input
              type="text"
              required
              value={accountForm.name}
              onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
              className="w-full px-4 py-3 text-sm glass-card rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary"
              placeholder="Например: Основной счёт"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Иконка</label>
            <IconPicker
              selectedIcon={accountForm.icon}
              onSelectIcon={(icon) => setAccountForm({ ...accountForm, icon })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Процент от дохода (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              required
              value={accountForm.percentage}
              onChange={(e) => setAccountForm({ ...accountForm, percentage: e.target.value })}
              className="w-full px-4 py-3 text-sm glass-card rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary"
              placeholder="0.0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Фактический баланс (₽)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={accountForm.actual_balance}
              onChange={(e) => setAccountForm({ ...accountForm, actual_balance: e.target.value })}
              className="w-full px-4 py-3 text-sm glass-card rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary"
              placeholder="0.00"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold text-sm hover:scale-105 transition-transform"
          >
            {editingAccount ? 'Сохранить' : 'Создать счёт'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
