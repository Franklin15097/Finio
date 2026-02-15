import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import IconPicker, { getIconComponent } from '../../components/IconPicker';
import { Plus, Wallet, Edit2, Trash2, TrendingUp, PiggyBank } from 'lucide-react';

export default function TelegramAccounts() {
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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--tg-theme-bg-color,#f5f5f5)] pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white p-6 pb-8 rounded-b-[32px] shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Счета</h1>
          <button
            onClick={() => setShowModal(true)}
            className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3">
            <div className="text-xs text-white/80 mb-1">Распределено</div>
            <div className="text-lg font-bold">{totalPercentage.toFixed(0)}%</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3">
            <div className="text-xs text-white/80 mb-1">План</div>
            <div className="text-lg font-bold">{totalPlanned.toFixed(0)} ₽</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3">
            <div className="text-xs text-white/80 mb-1">Факт</div>
            <div className="text-lg font-bold">{totalActual.toFixed(0)} ₽</div>
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="px-4 -mt-4">
        {accounts.length > 0 ? (
          <div className="space-y-3">
            {accounts.map((account) => {
              const IconComponent = getIconComponent(account.icon);
              const difference = parseFloat(account.actual_balance) - parseFloat(account.planned_balance);
              const isPositive = difference >= 0;
              
              return (
                <div
                  key={account.id}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-xl flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">{account.name}</div>
                        <div className="text-xs text-gray-500">{account.percentage}% от дохода</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">План:</span>
                      <span className="font-semibold text-gray-800">
                        {parseFloat(account.planned_balance).toFixed(0)} ₽
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Факт:</span>
                      <span className="font-semibold text-purple-600">
                        {parseFloat(account.actual_balance).toFixed(0)} ₽
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                      <span className="text-gray-600">Разница:</span>
                      <span className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{difference.toFixed(0)} ₽
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(account)}
                      className="flex-1 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg active:scale-95 transition-transform"
                    >
                      Изменить
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="flex-1 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg active:scale-95 transition-transform"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="text-5xl mb-3">💰</div>
            <p className="text-gray-500 text-sm mb-2">Нет счетов</p>
            <p className="text-gray-400 text-xs">Создайте первый счёт</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Название</label>
            <input
              type="text"
              required
              value={accountForm.name}
              onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Например: Основной счёт"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Иконка</label>
            <IconPicker
              selectedIcon={accountForm.icon}
              onSelectIcon={(icon) => setAccountForm({ ...accountForm, icon })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Процент от дохода (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              required
              value={accountForm.percentage}
              onChange={(e) => setAccountForm({ ...accountForm, percentage: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0.0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Фактический баланс (₽)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={accountForm.actual_balance}
              onChange={(e) => setAccountForm({ ...accountForm, actual_balance: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white rounded-xl font-semibold active:scale-95 transition-transform"
          >
            {editingAccount ? 'Сохранить' : 'Создать счёт'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
