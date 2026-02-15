import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import IconPicker, { getIconComponent } from '../../components/IconPicker';
import { AnimatedChart } from '../../components/AnimatedChart';
import { Plus, TrendingDown, Search, Edit2, Trash2, X, Tag, Calendar, ArrowUpDown } from 'lucide-react';

export default function TelegramExpenses() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month'>('all');
  
  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    description: '',
    category_id: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: 'ShoppingCart'
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSortTransactions();
  }, [transactions, searchQuery, sortBy, sortOrder, selectedCategory, dateRange]);

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

  const filterAndSortTransactions = () => {
    let filtered = [...transactions];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category_id === parseInt(selectedCategory));
    }
    
    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      today.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.transaction_date);
        transactionDate.setHours(0, 0, 0, 0);
        
        if (dateRange === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          weekAgo.setHours(0, 0, 0, 0);
          return transactionDate >= weekAgo && transactionDate <= today;
        } else if (dateRange === 'month') {
          const monthAgo = new Date(today);
          monthAgo.setDate(monthAgo.getDate() - 30);
          monthAgo.setHours(0, 0, 0, 0);
          return transactionDate >= monthAgo && transactionDate <= today;
        }
        return true;
      });
    }
    
    // Search
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.transaction_date).getTime();
        const dateB = new Date(b.transaction_date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'amount') {
        const amountA = parseFloat(a.amount);
        const amountB = parseFloat(b.amount);
        return sortOrder === 'asc' ? amountA - amountB : amountB - amountA;
      } else {
        const catA = a.category_name.toLowerCase();
        const catB = b.category_name.toLowerCase();
        return sortOrder === 'asc' ? catA.localeCompare(catB) : catB.localeCompare(catA);
      }
    });
    
    setFilteredTransactions(filtered);
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTransaction) {
        await api.updateTransaction(editingTransaction.id, {
          ...transactionForm,
          amount: parseFloat(transactionForm.amount),
          category_id: transactionForm.category_id || null
        });
      } else {
        await api.createTransaction({
          ...transactionForm,
          amount: parseFloat(transactionForm.amount),
          category_id: transactionForm.category_id || null
        });
      }
      setShowTransactionModal(false);
      setEditingTransaction(null);
      setTransactionForm({
        amount: '',
        description: '',
        category_id: '',
        transaction_date: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (error) {
      console.error('Failed to save transaction:', error);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory && editingCategory.id) {
        await api.updateCategory(editingCategory.id, {
          ...categoryForm,
          color: '#ef4444'
        });
      } else {
        await api.createCategory({
          ...categoryForm,
          type: 'expense',
          color: '#ef4444'
        });
      }
      setShowCategoryModal(false);
      setCategoryForm({ name: '', icon: 'ShoppingCart' });
      setEditingCategory(null);
      loadData();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (confirm('Удалить транзакцию?')) {
      try {
        await api.deleteTransaction(id);
        loadData();
      } catch (error) {
        console.error('Failed to delete transaction:', error);
      }
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm('Удалить категорию?')) {
      try {
        await api.deleteCategory(id);
        loadData();
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const openEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setTransactionForm({
      amount: transaction.amount,
      description: transaction.description,
      category_id: transaction.category_id || '',
      transaction_date: transaction.transaction_date.split('T')[0]
    });
    setShowTransactionModal(true);
  };

  const openEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name, icon: category.icon });
    setShowCategoryModal(true);
  };

  const totalExpense = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const maxExpense = Math.max(...filteredTransactions.map(t => parseFloat(t.amount)), 1);

  // Calculate category totals for chart
  const categoryTotals = categories.map(cat => {
    const total = filteredTransactions
      .filter(t => t.category_id === cat.id)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    return { ...cat, total };
  }).sort((a, b) => b.total - a.total).slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin animation-delay-150" style={{ animationDirection: 'reverse' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pb-24">
      {/* Header with Animated Gradient */}
      <div className="relative p-6 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-pink-500/20 to-purple-500/20 animate-gradient"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">Расходы</h1>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setShowCategoryModal(true);
                }}
                className="w-11 h-11 bg-slate-700/50 backdrop-blur-sm rounded-2xl flex items-center justify-center active:scale-95 transition-all border border-slate-600/50 btn-gradient-hover"
              >
                <Tag className="w-5 h-5 text-slate-300" />
              </button>
              <button
                onClick={() => setShowTransactionModal(true)}
                className="w-11 h-11 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-red-500/50 btn-gradient-hover animate-pulse-subtle"
              >
                <Plus className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
          
          {/* Total Card with Animation */}
          <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/90 text-sm font-medium">Всего расходов</span>
              <TrendingDown className="w-5 h-5 text-white/80" />
            </div>
            <div className="text-4xl font-bold text-white mb-4">
              {totalExpense.toFixed(2)} ₽
            </div>
            
            {/* Period Filters */}
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'Всё' },
                { value: 'week', label: 'Неделя' },
                { value: 'month', label: 'Месяц' }
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => setDateRange(period.value as any)}
                  className={`flex-1 py-2 text-sm rounded-xl transition-all ${
                    dateRange === period.value
                      ? 'bg-white/30 text-white font-semibold shadow-lg'
                      : 'bg-white/10 text-white/70'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Categories Chart */}
      {categoryTotals.length > 0 && (
        <div className="px-6 mb-4 animate-slide-up">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Топ категорий</h3>
            <div className="space-y-3">
              {categoryTotals.map((cat, index) => (
                <AnimatedChart
                  key={cat.id}
                  value={cat.total}
                  maxValue={categoryTotals[0].total}
                  color="bg-gradient-to-r from-red-500 to-pink-600"
                  label={cat.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="px-6 mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-3 border border-slate-700/50">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 px-3 py-2.5 text-sm bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            >
              <option value="all">Все категории</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            
            <button
              onClick={() => {
                if (sortBy === 'date') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy('date');
                  setSortOrder('desc');
                }
              }}
              className={`px-4 py-2.5 text-sm rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                sortBy === 'date'
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg'
                  : 'bg-slate-700/50 text-slate-300 border border-slate-600/50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              {sortBy === 'date' && (
                <span className={`transition-transform duration-300 ${sortOrder === 'desc' ? 'rotate-180' : ''}`}>↑</span>
              )}
            </button>
            
            <button
              onClick={() => {
                if (sortBy === 'amount') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy('amount');
                  setSortOrder('desc');
                }
              }}
              className={`px-4 py-2.5 text-sm rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                sortBy === 'amount'
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg'
                  : 'bg-slate-700/50 text-slate-300 border border-slate-600/50'
              }`}
            >
              💰
              {sortBy === 'amount' && (
                <span className={`transition-transform duration-300 ${sortOrder === 'desc' ? 'rotate-180' : ''}`}>↑</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-400">
            История ({filteredTransactions.length})
          </h2>
          {(searchQuery || selectedCategory !== 'all' || dateRange !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setDateRange('all');
              }}
              className="text-xs text-red-400 font-medium flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Сбросить
            </button>
          )}
        </div>
        
        {filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((transaction, index) => {
              const IconComponent = getIconComponent(transaction.category_icon);
              return (
                <div
                  key={transaction.id}
                  className="stagger-item bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl blur-md opacity-50"></div>
                        <div className="relative w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm truncate">
                          {transaction.category_name}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {transaction.description}
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="font-bold text-red-400">
                        -{parseFloat(transaction.amount).toFixed(0)} ₽
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(transaction.transaction_date).toLocaleDateString('ru-RU', { 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditTransaction(transaction)}
                      className="flex-1 py-2 text-xs font-medium text-blue-400 bg-blue-500/10 rounded-lg active:scale-95 transition-all border border-blue-500/20"
                    >
                      Изменить
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="flex-1 py-2 text-xs font-medium text-red-400 bg-red-500/10 rounded-lg active:scale-95 transition-all border border-red-500/20"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-slate-700/50 animate-scale-in">
            <div className="text-6xl mb-3 animate-bounce-subtle">💸</div>
            <p className="text-slate-400 text-sm">Нет расходов</p>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      <Modal 
        isOpen={showTransactionModal} 
        onClose={() => {
          setShowTransactionModal(false);
          setEditingTransaction(null);
          setTransactionForm({
            amount: '',
            description: '',
            category_id: '',
            transaction_date: new Date().toISOString().split('T')[0]
          });
        }} 
        title={editingTransaction ? 'Редактировать расход' : 'Новый расход'}
      >
        <form onSubmit={handleTransactionSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Сумма (₽)</label>
            <input
              type="number"
              step="0.01"
              required
              value={transactionForm.amount}
              onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Категория</label>
            <select
              value={transactionForm.category_id}
              onChange={(e) => setTransactionForm({ ...transactionForm, category_id: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            >
              <option value="">Без категории</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Описание</label>
            <input
              type="text"
              required
              value={transactionForm.description}
              onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              placeholder="Например: Продукты"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Дата</label>
            <input
              type="date"
              required
              value={transactionForm.transaction_date}
              onChange={(e) => setTransactionForm({ ...transactionForm, transaction_date: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold active:scale-95 transition-all shadow-lg btn-gradient-hover"
          >
            {editingTransaction ? 'Сохранить' : 'Добавить расход'}
          </button>
        </form>
      </Modal>

      {/* Category Modal */}
      <Modal 
        isOpen={showCategoryModal} 
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
          setCategoryForm({ name: '', icon: 'ShoppingCart' });
        }} 
        title={editingCategory?.id ? 'Редактировать категорию' : 'Управление категориями'}
      >
        {!editingCategory ? (
          <div className="space-y-4">
            {/* Categories List */}
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {categories.map((cat) => {
                const IconComponent = getIconComponent(cat.icon);
                return (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-red-400" />
                      </div>
                      <span className="text-white font-medium">{cat.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditCategory(cat)}
                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Add New Button */}
            <button
              onClick={() => setEditingCategory({ id: null })}
              className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 btn-gradient-hover"
            >
              <Plus className="w-5 h-5" />
              Создать категорию
            </button>
          </div>
        ) : (
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Название</label>
              <input
                type="text"
                required
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="Например: Продукты"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Иконка</label>
              <IconPicker
                selectedIcon={categoryForm.icon}
                onSelectIcon={(icon) => setCategoryForm({ ...categoryForm, icon })}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryForm({ name: '', icon: 'ShoppingCart' });
                }}
                className="flex-1 py-3 bg-slate-700/50 text-slate-300 rounded-xl font-semibold active:scale-95 transition-all border border-slate-600/50"
              >
                Назад
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold active:scale-95 transition-all shadow-lg btn-gradient-hover"
              >
                {editingCategory?.id ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
