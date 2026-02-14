import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import IconPicker, { getIconComponent } from '../components/IconPicker';
import { Plus, TrendingDown, Search, SortAsc, Edit2, Trash2, Tag, CreditCard } from 'lucide-react';

export default function Expenses() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  
  // Search & Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Forms
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
  }, [transactions, searchQuery, sortBy, sortOrder]);

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
      if (editingCategory) {
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
    if (confirm('Удалить категорию? Все связанные транзакции останутся без категории.')) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const totalExpense = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            Расходы
          </h1>
          <p className="text-gray-400">Управление расходами и категориями</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all font-semibold flex items-center gap-2"
          >
            <Tag className="w-5 h-5" />
            Категории
          </button>
          <button
            onClick={() => setShowTransactionModal(true)}
            className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <div className="relative flex items-center gap-2 text-white font-semibold">
              <Plus className="w-5 h-5" />
              Добавить
            </div>
          </button>
        </div>
      </div>

      {/* Total Card */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
        <div className="relative glass-card rounded-3xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl blur-lg opacity-75"></div>
                <div className="relative w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center">
                  <TrendingDown className="w-10 h-10 text-white" />
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Всего расходов</p>
                <p className="text-5xl font-bold text-white">{totalExpense.toFixed(2)} ₽</p>
              </div>
            </div>
            <div className="text-red-400 text-6xl opacity-10">
              <CreditCard className="w-24 h-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по описанию или категории..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-red-500 transition-all"
            >
              <option value="date" className="bg-slate-800">По дате</option>
              <option value="amount" className="bg-slate-800">По сумме</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
            >
              <SortAsc className={`w-5 h-5 text-white transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="glass-card rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">История ({filteredTransactions.length})</h2>
        {filteredTransactions.length > 0 ? (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => {
              const IconComponent = getIconComponent(transaction.category_icon);
              return (
                <div
                  key={transaction.id}
                  className="group relative overflow-hidden bg-white/5 hover:bg-white/10 rounded-2xl p-6 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-lg">{transaction.category_name}</p>
                        <p className="text-gray-400 text-sm">{transaction.description}</p>
                        <p className="text-gray-500 text-xs mt-1">{formatDate(transaction.transaction_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <p className="text-red-400 font-bold text-2xl">+{parseFloat(transaction.amount).toFixed(2)} ₽</p>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditTransaction(transaction)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
              <TrendingDown className="w-12 h-12 text-white" />
            </div>
            <p className="text-gray-400 text-lg">Нет транзакций</p>
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Сумма (₽)</label>
            <input
              type="number"
              step="0.01"
              required
              value={transactionForm.amount}
              onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Категория</label>
            <select
              value={transactionForm.category_id}
              onChange={(e) => setTransactionForm({ ...transactionForm, category_id: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            >
              <option value="" className="bg-slate-800">Без категории</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-slate-800">{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Описание</label>
            <input
              type="text"
              required
              value={transactionForm.description}
              onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              placeholder="Например: Зарплата"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Дата</label>
            <input
              type="date"
              required
              value={transactionForm.transaction_date}
              onChange={(e) => setTransactionForm({ ...transactionForm, transaction_date: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform duration-300"
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
        title={editingCategory ? 'Редактировать категорию' : 'Управление категориями'}
      >
        {!editingCategory ? (
          <div className="space-y-4">
            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
              {categories.map((cat) => {
                const IconComponent = getIconComponent(cat.icon);
                return (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-white font-medium">{cat.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditCategory(cat)}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setEditingCategory({})}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform duration-300"
            >
              + Создать категорию
            </button>
          </div>
        ) : (
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Название</label>
              <input
                type="text"
                required
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="Например: Продукты"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Иконка</label>
              <IconPicker
                selectedIcon={categoryForm.icon}
                onSelectIcon={(icon) => setCategoryForm({ ...categoryForm, icon })}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform duration-300"
              >
                {editingCategory.id ? 'Сохранить' : 'Создать'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryForm({ name: '', icon: 'ShoppingCart' });
                }}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-semibold transition-all"
              >
                Назад
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
