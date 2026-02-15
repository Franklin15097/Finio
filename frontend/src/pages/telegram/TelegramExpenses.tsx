import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import IconPicker, { getIconComponent } from '../../components/IconPicker';
import DatePicker from '../../components/DatePicker';
import { Plus, TrendingDown, Search, Edit2, Trash2, Tag, Calendar, X } from 'lucide-react';

export default function TelegramExpenses() {
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
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'year'>('all');
  
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Total Card */}
      <div className="bg-gradient-to-r from-red-500/20 to-pink-600/20 backdrop-blur-xl rounded-2xl p-4 border border-red-500/30 mt-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs mb-1">Всего расходов</p>
            <p className="text-3xl font-bold text-white">{totalExpense.toFixed(0)} ₽</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-red-500"
          >
            <option value="all" className="bg-slate-800">Все категории</option>
            <option value="none" className="bg-slate-800">Без категории</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-slate-800">{cat.name}</option>
            ))}
          </select>
          
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
          >
            <Tag className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2">
          {['all', 'week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setDateRange(period as any)}
              className={`flex-1 px-3 py-2 text-xs rounded-xl transition-all ${
                dateRange === period
                  ? 'bg-red-500 text-white'
                  : 'bg-white/10 text-gray-300'
              }`}
            >
              {period === 'all' && 'Всё'}
              {period === 'week' && 'Неделя'}
              {period === 'month' && 'Месяц'}
              {period === 'year' && 'Год'}
            </button>
          ))}
        </div>

        {/* Sort buttons */}
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
            className={`flex-1 px-3 py-2 text-xs rounded-xl transition-all flex items-center justify-center gap-1 ${
              sortBy === 'date'
                ? 'bg-red-500 text-white'
                : 'bg-white/10 text-gray-300'
            }`}
          >
            📅 Дата
            {sortBy === 'date' && (
              <span className={`transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`}>↑</span>
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
            className={`flex-1 px-3 py-2 text-xs rounded-xl transition-all flex items-center justify-center gap-1 ${
              sortBy === 'amount'
                ? 'bg-red-500 text-white'
                : 'bg-white/10 text-gray-300'
            }`}
          >
            💰 Сумма
            {sortBy === 'amount' && (
              <span className={`transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`}>↑</span>
            )}
          </button>
        </div>
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
                  className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-purple-500/20"
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
        className="fixed right-4 bottom-24 w-14 h-14 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl z-40 hover:scale-110 transition-transform"
      >
        <Plus className="w-7 h-7 text-white" />
      </button>
    </div>
  );
}
