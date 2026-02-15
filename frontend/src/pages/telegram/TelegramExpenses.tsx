import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import IconPicker, { getIconComponent } from '../../components/IconPicker';
import DatePicker from '../../components/DatePicker';
import SparklineChart from '../../components/charts/SparklineChart';
import { Plus, TrendingDown, Search, Edit2, Trash2, Tag, Calendar, X, ChevronDown, ChevronRight } from 'lucide-react';

export default function TelegramExpenses() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'year'>('month');
  const [showFilters, setShowFilters] = useState(false);
  
  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    description: '',
    category_id: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('ShoppingCart');
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: 'ShoppingCart'
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery, selectedCategory, dateRange, sortBy, sortOrder]);

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

  const filterTransactions = () => {
    let filtered = [...transactions];
    
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'none') {
        filtered = filtered.filter(t => !t.category_id);
      } else {
        filtered = filtered.filter(t => t.category_id === parseInt(selectedCategory));
      }
    }
    
    if (dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      today.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.transaction_date);
        transactionDate.setHours(0, 0, 0, 0);
        
        switch (dateRange) {
          case 'week':
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            weekAgo.setHours(0, 0, 0, 0);
            return transactionDate >= weekAgo && transactionDate <= today;
          case 'month':
            const monthAgo = new Date(now);
            monthAgo.setDate(monthAgo.getDate() - 30);
            monthAgo.setHours(0, 0, 0, 0);
            return transactionDate >= monthAgo && transactionDate <= today;
          case 'year':
            const yearAgo = new Date(now);
            yearAgo.setDate(yearAgo.getDate() - 365);
            yearAgo.setHours(0, 0, 0, 0);
            return transactionDate >= yearAgo && transactionDate <= today;
          default:
            return true;
        }
      });
    }
    
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
      } else {
        const amountA = parseFloat(a.amount);
        const amountB = parseFloat(b.amount);
        return sortOrder === 'asc' ? amountA - amountB : amountB - amountA;
      }
    });
    
    setFilteredTransactions(filtered);
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const transactionData = {
        ...transactionForm,
        amount: parseFloat(transactionForm.amount),
        category_id: transactionForm.category_id ? parseInt(transactionForm.category_id) : null
      };
      
      console.log('Submitting transaction:', transactionData);
      
      if (editingTransaction) {
        await api.updateTransaction(editingTransaction.id, transactionData);
      } else {
        const result = await api.createTransaction(transactionData);
        console.log('Transaction created:', result);
      }
      setShowTransactionModal(false);
      setEditingTransaction(null);
      setTransactionForm({
        amount: '',
        description: '',
        category_id: '',
        transaction_date: new Date().toISOString().split('T')[0]
      });
      setShowNewCategoryForm(false);
      setNewCategoryName('');
      setNewCategoryIcon('ShoppingCart');
      loadData();
    } catch (error) {
      console.error('Failed to save transaction:', error);
      alert('Ошибка при сохранении транзакции');
    }
  };

  const handleCreateQuickCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Введите название категории');
      return;
    }
    
    try {
      const result = await api.createCategory({
        name: newCategoryName,
        type: 'expense',
        icon: newCategoryIcon,
        color: '#ef4444'
      });
      
      // Reload categories
      const catData = await api.getCategories();
      setCategories(catData.filter((c: any) => c.type === 'expense'));
      
      // Select the new category
      setTransactionForm({ ...transactionForm, category_id: result.id.toString() });
      
      // Reset form
      setShowNewCategoryForm(false);
      setNewCategoryName('');
      setNewCategoryIcon('ShoppingCart');
    } catch (error) {
      console.error('Failed to create category:', error);
      alert('Ошибка при создании категории');
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

  const openEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name, icon: category.icon });
    setShowCategoryModal(true);
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

  const totalExpense = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Prepare chart data (last 30 days)
  const getChartData = () => {
    const days = 30;
    const data = new Array(days).fill(0);
    const now = new Date();
    
    filteredTransactions.forEach(t => {
      const transactionDate = new Date(t.transaction_date);
      const diffTime = now.getTime() - transactionDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays < days) {
        data[days - 1 - diffDays] += parseFloat(t.amount);
      }
    });
    
    return data;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 pb-24">
      {/* Total Card with Chart */}
      <div className="glass-card rounded-2xl p-4 border border-border/30 mt-2">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-white/60 text-xs mb-1">Расходы за период</p>
            <p className="text-3xl font-bold text-white">{totalExpense.toFixed(0)} ₽</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-white" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <SparklineChart 
              data={getChartData()} 
              color="#ef4444" 
              width={180} 
              height={40}
            />
          </div>
          <button
            onClick={() => navigate('/telegram/balance')}
            className="ml-3 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white flex items-center gap-1 transition-colors"
          >
            Подробнее
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Compact Filters */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm glass-card rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-xl text-white transition-all ${
              showFilters ? 'bg-red-500' : 'glass-card'
            }`}
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="space-y-2 animate-slide-up">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm glass-card rounded-xl text-white focus:ring-2 focus:ring-red-500"
            >
              <option value="all" className="bg-slate-800">Все категории</option>
              <option value="none" className="bg-slate-800">Без категории</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-slate-800">{cat.name}</option>
              ))}
            </select>

            <div className="flex gap-2">
              {['all', 'week', 'month', 'year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setDateRange(period as any)}
                  className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${
                    dateRange === period
                      ? 'bg-red-500 text-white'
                      : 'glass-card text-gray-300'
                  }`}
                >
                  {period === 'all' && 'Всё'}
                  {period === 'week' && '7д'}
                  {period === 'month' && '30д'}
                  {period === 'year' && 'Год'}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (sortBy === 'date') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('date');
                    setSortOrder('desc');
                  }
                }}
                className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all flex items-center justify-center gap-1 ${
                  sortBy === 'date'
                    ? 'bg-red-500 text-white'
                    : 'glass-card text-gray-300'
                }`}
              >
                Дата {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
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
                className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all flex items-center justify-center gap-1 ${
                  sortBy === 'amount'
                    ? 'bg-red-500 text-white'
                    : 'glass-card text-gray-300'
                }`}
              >
                Сумма {sortBy === 'amount' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">История ({filteredTransactions.length})</h2>
          {(selectedCategory !== 'all' || dateRange !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setDateRange('all');
                setSearchQuery('');
              }}
              className="text-xs text-gray-400 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Сбросить
            </button>
          )}
        </div>
        
        {filteredTransactions.length > 0 ? (
          <div className="space-y-2">
            {filteredTransactions.map((transaction) => {
              const IconComponent = getIconComponent(transaction.category_icon);
              return (
                <div
                  key={transaction.id}
                  className="glass-card rounded-xl p-3 border border-border/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{transaction.category_name}</p>
                        <p className="text-gray-400 text-xs">{transaction.description}</p>
                        <p className="text-gray-500 text-[10px] mt-0.5 flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {new Date(transaction.transaction_date).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-red-400 font-bold text-sm">-{parseFloat(transaction.amount).toFixed(0)} ₽</p>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => openEditTransaction(transaction)}
                          className="p-1 text-blue-400 hover:bg-blue-500/20 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="p-1 text-red-400 hover:bg-red-500/20 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 opacity-50">
              <TrendingDown className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-400 text-sm">Нет транзакций</p>
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
          setShowNewCategoryForm(false);
          setNewCategoryName('');
          setNewCategoryIcon('ShoppingCart');
        }} 
        title={editingTransaction ? 'Редактировать расход' : 'Новый расход'}
      >
        <form onSubmit={handleTransactionSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Сумма (₽)</label>
            <input
              type="number"
              step="0.01"
              required
              value={transactionForm.amount}
              onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Категория</label>
            {!showNewCategoryForm ? (
              <div className="space-y-2">
                <select
                  value={transactionForm.category_id}
                  onChange={(e) => setTransactionForm({ ...transactionForm, category_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-red-500"
                >
                  <option value="" className="bg-slate-800">Без категории</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-slate-800">{cat.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewCategoryForm(true)}
                  className="w-full px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Создать новую категорию
                </button>
              </div>
            ) : (
              <div className="space-y-2 p-3 bg-white/5 rounded-xl border border-red-500/20">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Название категории"
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500"
                />
                <IconPicker
                  selectedIcon={newCategoryIcon}
                  onSelectIcon={setNewCategoryIcon}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCategoryForm(false);
                      setNewCategoryName('');
                      setNewCategoryIcon('ShoppingCart');
                    }}
                    className="flex-1 px-3 py-2 bg-white/10 text-white rounded-xl text-xs font-medium"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateQuickCategory}
                    className="flex-1 px-3 py-2 bg-red-500 text-white rounded-xl text-xs font-medium"
                  >
                    Создать
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Описание</label>
            <input
              type="text"
              required
              value={transactionForm.description}
              onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500"
              placeholder="Например: Продукты"
            />
          </div>
          <div>
            <DatePicker
              label="Дата"
              value={transactionForm.transaction_date}
              onChange={(date) => setTransactionForm({ ...transactionForm, transaction_date: date })}
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold text-sm"
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
        title={!editingCategory ? 'Управление категориями' : editingCategory.id ? 'Редактировать категорию' : 'Создать категорию'}
      >
        {!editingCategory ? (
          <div className="space-y-3">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categories.map((cat) => {
                const IconComponent = getIconComponent(cat.icon);
                return (
                  <div key={cat.id} className="flex items-center justify-between p-2 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white text-sm font-medium">{cat.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditCategory(cat)}
                        className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setEditingCategory({})}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Создать категорию
            </button>
          </div>
        ) : (
          <form onSubmit={handleCategorySubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Название</label>
              <input
                type="text"
                required
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500"
                placeholder="Например: Продукты"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Иконка</label>
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
                className="flex-1 px-4 py-2.5 bg-white/10 text-white rounded-xl font-semibold text-sm"
              >
                Назад
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold text-sm"
              >
                {editingCategory.id ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowTransactionModal(true)}
        className="fixed right-4 bottom-32 w-14 h-14 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl z-30 hover:scale-110 transition-transform"
      >
        <Plus className="w-7 h-7 text-white" />
      </button>
    </div>
  );
}
