import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import IconPicker, { getIconComponent } from '../../components/IconPicker';
import { Plus, Search, Edit2, Trash2, Tag, Calendar, X, ChevronDown } from 'lucide-react';

export default function TelegramIncome() {
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
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    description: '',
    category_id: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: 'DollarSign'
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
      
      const incomeTransactions = txData.filter((t: any) => t.transaction_type === 'income');
      setTransactions(incomeTransactions);
      setCategories(catData.filter((c: any) => c.type === 'income'));
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
          color: '#10b981'
        });
      } else {
        await api.createCategory({
          ...categoryForm,
          type: 'income',
          color: '#10b981'
        });
      }
      setShowCategoryModal(false);
      setCategoryForm({ name: '', icon: 'DollarSign' });
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

  const totalIncome = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const selectedCategoryName = selectedCategory === 'all' ? 'Все категории' : 
    selectedCategory === 'none' ? 'Без категории' :
    categories.find(c => c.id === parseInt(selectedCategory))?.name || 'Категория';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 pb-24">
      {/* Search */}
      <div className="relative mt-2">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Поиск..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 text-sm bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Category Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          className="w-full flex items-center justify-between px-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white"
        >
          <span className="text-sm">{selectedCategoryName}</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
        </button>
        
        {showCategoryDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/20 rounded-2xl overflow-hidden z-50 shadow-2xl">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setShowCategoryDropdown(false);
              }}
              className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10 transition-colors"
            >
              Все категории
            </button>
            <button
              onClick={() => {
                setSelectedCategory('none');
                setShowCategoryDropdown(false);
              }}
              className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10 transition-colors border-t border-white/10"
            >
              Без категории
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id.toString());
                  setShowCategoryDropdown(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10 transition-colors border-t border-white/10"
              >
                {cat.name}
              </button>
            ))}
            <button
              onClick={() => {
                setShowCategoryModal(true);
                setShowCategoryDropdown(false);
              }}
              className="w-full px-4 py-3 text-left text-sm text-green-400 hover:bg-white/10 transition-colors border-t border-white/10 flex items-center gap-2"
            >
              <Tag className="w-4 h-4" />
              Управление категориями
            </button>
          </div>
        )}
      </div>

      {/* Period Filters */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: 'Всё' },
          { value: 'week', label: 'Неделя' },
          { value: 'month', label: 'Месяц' },
          { value: 'year', label: 'Год' }
        ].map((period) => (
          <button
            key={period.value}
            onClick={() => setDateRange(period.value as any)}
            className={`flex-1 px-3 py-2.5 text-xs font-medium rounded-2xl transition-all ${
              dateRange === period.value
                ? 'bg-green-500 text-white'
                : 'bg-white/10 text-gray-300'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Sort Buttons */}
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
          className={`flex-1 px-4 py-2.5 text-xs font-medium rounded-2xl transition-all flex items-center justify-center gap-2 ${
            sortBy === 'date'
              ? 'bg-green-500 text-white'
              : 'bg-white/10 text-gray-300'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Дата
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
          className={`flex-1 px-4 py-2.5 text-xs font-medium rounded-2xl transition-all flex items-center justify-center gap-2 ${
            sortBy === 'amount'
              ? 'bg-green-500 text-white'
              : 'bg-white/10 text-gray-300'
          }`}
        >
          💰 Сумма
          {sortBy === 'amount' && (
            <span className={`transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`}>↑</span>
          )}
        </button>
      </div>

      {/* Total */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 backdrop-blur-xl rounded-2xl p-4 border border-green-500/30">
        <p className="text-white/60 text-xs mb-1">Всего доходов</p>
        <p className="text-3xl font-bold text-white">{totalIncome.toFixed(0)} ₽</p>
        <p className="text-green-400 text-xs mt-1">{filteredTransactions.length} транзакций</p>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length > 0 ? (
        <div className="space-y-2">
          {filteredTransactions.map((transaction) => {
            const IconComponent = getIconComponent(transaction.category_icon);
            return (
              <div
                key={transaction.id}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{transaction.category_name}</p>
                      <p className="text-gray-400 text-xs truncate">{transaction.description}</p>
                    </div>
                  </div>
                  <p className="text-green-400 font-bold text-lg ml-2">+{parseFloat(transaction.amount).toFixed(0)} ₽</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(transaction.transaction_date).toLocaleDateString('ru-RU')}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditTransaction(transaction)}
                      className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 opacity-50">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-400 text-sm">Нет транзакций</p>
        </div>
      )}

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
        title={editingTransaction ? 'Редактировать доход' : 'Новый доход'}
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
              className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Категория</label>
            <select
              value={transactionForm.category_id}
              onChange={(e) => setTransactionForm({ ...transactionForm, category_id: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-green-500"
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
              className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500"
              placeholder="Например: Зарплата"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Дата</label>
            <input
              type="date"
              required
              value={transactionForm.transaction_date}
              onChange={(e) => setTransactionForm({ ...transactionForm, transaction_date: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-sm"
          >
            {editingTransaction ? 'Сохранить' : 'Добавить доход'}
          </button>
        </form>
      </Modal>

      {/* Category Modal */}
      <Modal 
        isOpen={showCategoryModal} 
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
          setCategoryForm({ name: '', icon: 'DollarSign' });
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
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
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
              className="w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
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
                className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500"
                placeholder="Например: Зарплата"
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
                  setCategoryForm({ name: '', icon: 'DollarSign' });
                }}
                className="flex-1 px-4 py-2.5 bg-white/10 text-white rounded-xl font-semibold text-sm"
              >
                Назад
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-sm"
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
        className="fixed right-4 bottom-24 w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl z-40 hover:scale-110 transition-transform"
      >
        <Plus className="w-7 h-7 text-white" />
      </button>
    </div>
  );
}
