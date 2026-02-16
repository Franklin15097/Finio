import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Modal from '../components/Modal';
import IconPicker, { getIconComponent } from '../components/IconPicker';
import DatePicker from '../components/DatePicker';
import TransactionFilter, { TransactionFilters } from '../components/TransactionFilter';
import { 
  filterTransactions, 
  sortTransactionsByDate, 
  groupTransactionsByDate,
  calculateTransactionStats,
  formatTransactionDate,
  formatTransactionAmount,
  exportToCSV,
  getUniqueCategories
} from '../utils/filterTransactions';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { Plus, TrendingDown, TrendingUp, Download, FileText, FileSpreadsheet, File, Calendar, Edit2, Trash2, Tag, Search, Filter, ChevronRight, ChevronDown, X, BarChart3, PieChart, TrendingUp as TrendingUpIcon } from 'lucide-react';
import { isTelegramWebApp } from '../utils/telegram';
import TelegramExpenses from './telegram/TelegramExpenses';

export default function Transactions() {
  if (isTelegramWebApp()) {
    return <TelegramExpenses />;
  }

  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [groupedTransactions, setGroupedTransactions] = useState<Record<string, any[]>>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    startDate: null,
    endDate: null,
    categoryIds: [],
    type: 'all',
    minAmount: null,
    maxAmount: null
  });
  
  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    description: '',
    category_id: '',
    transaction_date: new Date().toISOString().split('T')[0],
    type: 'expense'
  });
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: 'ShoppingCart',
    type: 'expense'
  });

  // Real-time синхронизация
  useRealtimeSync({
    onTransactionCreated: () => loadData(),
    onTransactionUpdated: () => loadData(),
    onTransactionDeleted: () => loadData(),
    onCategoryCreated: () => loadData(),
    onCategoryUpdated: () => loadData(),
    onCategoryDeleted: () => loadData()
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Применяем фильтры
    const filtered = filterTransactions(transactions, filters);
    const sorted = sortTransactionsByDate(filtered, 'desc');
    const grouped = groupTransactionsByDate(sorted);
    
    setFilteredTransactions(sorted);
    setGroupedTransactions(grouped);
    
    // Вычисляем статистику
    const transactionStats = calculateTransactionStats(filtered);
    setStats(transactionStats);
  }, [transactions, filters]);

  const loadData = async () => {
    try {
      const [txData, catData] = await Promise.all([
        api.getTransactions(),
        api.getCategories()
      ]);
      
      setTransactions(txData);
      setCategories(catData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
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
        transaction_date: new Date().toISOString().split('T')[0],
        type: 'expense'
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
          color: categoryForm.type === 'income' ? '#10b981' : '#ef4444'
        });
      } else {
        await api.createCategory({
          ...categoryForm,
          color: categoryForm.type === 'income' ? '#10b981' : '#ef4444'
        });
      }
      setShowCategoryModal(false);
      setCategoryForm({ name: '', icon: 'ShoppingCart', type: 'expense' });
      setEditingCategory(null);
      loadData();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm('Удалить категорию? Все транзакции в этой категории останутся без категории.')) {
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
    setCategoryForm({ 
      name: category.name, 
      icon: category.icon,
      type: category.type
    });
    setShowCategoryModal(true);
  };

  const openEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setTransactionForm({
      amount: Math.abs(transaction.amount).toString(),
      description: transaction.description,
      category_id: transaction.category_id || '',
      transaction_date: transaction.transaction_date.split('T')[0],
      type: transaction.transaction_type || (transaction.amount > 0 ? 'income' : 'expense')
    });
    setShowTransactionModal(true);
  };

  const handleExportCSV = () => {
    exportToCSV(filteredTransactions, 'transactions');
  };

  const handleExportExcel = async () => {
    try {
      const params: any = {};
      if (filters.startDate) params.startDate = filters.startDate.toISOString().split('T')[0];
      if (filters.endDate) params.endDate = filters.endDate.toISOString().split('T')[0];
      
      await api.exportExcel(params);
    } catch (error) {
      console.error('Failed to export Excel:', error);
      alert('Ошибка при экспорте в Excel');
    }
  };

  const handleExportPDF = async () => {
    try {
      const params: any = {};
      if (filters.startDate) params.startDate = filters.startDate.toISOString().split('T')[0];
      if (filters.endDate) params.endDate = filters.endDate.toISOString().split('T')[0];
      
      await api.exportPDF(params);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Ошибка при экспорте в PDF');
    }
  };

  const getCategoryColor = (category: any) => {
    return category?.color || (category?.type === 'income' ? '#10b981' : '#ef4444');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Все транзакции</h1>
            <p className="text-white/60 text-sm">Полная история доходов и расходов</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm flex items-center gap-2"
          >
            <Tag className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowTransactionModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white font-semibold text-sm flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Добавить
          </button>
        </div>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 backdrop-blur-xl rounded-2xl p-4 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs mb-1">Доходы</p>
                <p className="text-2xl font-bold text-white">+{stats.totalIncome.toFixed(0)} ₽</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-white/60 text-xs mt-2">
              {stats.incomeCount} транзакций • Средняя: {stats.averageIncome.toFixed(0)} ₽
            </p>
          </div>

          <div className="bg-gradient-to-r from-red-500/20 to-pink-600/20 backdrop-blur-xl rounded-2xl p-4 border border-red-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs mb-1">Расходы</p>
                <p className="text-2xl font-bold text-white">-{stats.totalExpense.toFixed(0)} ₽</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-white/60 text-xs mt-2">
              {stats.expenseCount} транзакций • Средняя: {stats.averageExpense.toFixed(0)} ₽
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-600/20 backdrop-blur-xl rounded-2xl p-4 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs mb-1">Баланс</p>
                <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.balance >= 0 ? '+' : ''}{stats.balance.toFixed(0)} ₽
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <TrendingUpIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-white/60 text-xs mt-2">
              Всего: {stats.transactionCount} транзакций
            </p>
          </div>

          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-600/20 backdrop-blur-xl rounded-2xl p-4 border border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs mb-1">Экспорт</p>
                <p className="text-2xl font-bold text-white">Данные</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex gap-1 mt-2">
              <button
                onClick={handleExportCSV}
                className="flex-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white flex items-center justify-center gap-1"
                title="Экспорт в CSV"
              >
                <FileText className="w-3 h-3" />
              </button>
              <button
                onClick={handleExportExcel}
                className="flex-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white flex items-center justify-center gap-1"
                title="Экспорт в Excel"
              >
                <FileSpreadsheet className="w-3 h-3" />
              </button>
              <button
                onClick={handleExportPDF}
                className="flex-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white flex items-center justify-center gap-1"
                title="Экспорт в PDF"
              >
                <File className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Фильтры */}
      <TransactionFilter
        categories={categories}
        onFilterChange={setFilters}
        initialFilters={filters}
      />

      {/* Список транзакций */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Транзакции ({filteredTransactions.length})
          </h2>
          {filteredTransactions.length > 0 && (
            <button
              onClick={() => navigate('/analytics')}
              className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <PieChart className="w-4 h-4" />
              Аналитика
            </button>
          )}
        </div>
        
        {filteredTransactions.length > 0 ? (
          <div className="space-y-4">
            {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
              <div key={date} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-300">
                    {formatTransactionDate(date)}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {dayTransactions.length} транзакций
                  </span>
                </div>
                
                <div className="space-y-2">
                  {dayTransactions.map((transaction) => {
                    const IconComponent = getIconComponent(transaction.category_icon || 'DollarSign');
                    const categoryColor = getCategoryColor({
                      color: transaction.category_color,
                      type: transaction.transaction_type
                    });
                    const isIncome = transaction.transaction_type === 'income' || transaction.amount > 0;
                    
                    return (
                      <div
                        key={transaction.id}
                        className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 hover:border-purple-500/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{ 
                                background: `linear-gradient(135deg, ${categoryColor}40, ${categoryColor}80)`,
                                border: `1px solid ${categoryColor}60`
                              }}
                            >
                              <IconComponent className="w-5 h-5" style={{ color: categoryColor }} />
                            </div>
                            <div>
                              <p className="text-white text-sm font-semibold">
                                {transaction.category_name || 'Без категории'}
                              </p>
                              <p className="text-gray-400 text-xs mt-0.5">
                                {transaction.description}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  isIncome 
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}>
                                  {isIncome ? 'Доход' : 'Расход'}
                                </span>
                                <span className="text-gray-500 text-[10px] flex items-center gap-1">
                                  <Calendar className="w-2.5 h-2.5" />
                                  {new Date(transaction.transaction_date).toLocaleDateString('ru-RU')}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <p className={`text-sm font-bold ${isIncome ? 'text-green-400' : 'text-red-400'}`}>
                              {formatTransactionAmount(transaction.amount, transaction.transaction_type)}
                            </p>
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => openEditTransaction(transaction)}
                                className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                title="Редактировать"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTransaction(transaction.id)}
                                className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                title="Удалить"
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
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 opacity-50">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-400 text-sm mb-2">Нет транзакций</p>
            <p className="text-gray-500 text-xs">
              {Object.keys(filters).some(key => 
                key !== 'type' && filters[key as keyof TransactionFilters] !== null && 
                filters[key as keyof TransactionFilters] !== '' && 
                !(Array.isArray(filters[key as keyof TransactionFilters]) && 
                  (filters[key as keyof TransactionFilters] as any[]).length === 0)
              ) 
                ? 'Попробуйте изменить фильтры' 
                : 'Добавьте первую транзакцию'}
            </p>
          </div>
        )}
      </div>

      {/* Модальное окно транзакции */}
      <Modal 
        isOpen={showTransactionModal} 
        onClose={() => {
          setShowTransactionModal(false);
          setEditingTransaction(null);
          setTransactionForm({
            amount: '',
            description: '',
            category_id: '',
            transaction_date: new Date().toISOString().split('T')[0],
            type: 'expense'
          });
        }} 
        title={editingTransaction ? 'Редактировать транзакцию' : 'Новая транзакция'}
      >
        <form onSubmit={handleTransactionSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Тип</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTransactionForm({ ...transactionForm, type: 'income' })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    transactionForm.type === 'income'
                      ? 'bg-green-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  Доход
                </button>
                <button
                  type="button"
                  onClick={() => setTransactionForm({ ...transactionForm, type: 'expense' })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    transactionForm.type === 'expense'
                      ? 'bg-red-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  Расход
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Сумма (₽)</label>
              <input
                type="number"
                step="0.01"
                required
                value={transactionForm.amount}
                onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Категория</label>
            <select
              value={transactionForm.category_id}
              onChange={(e) => setTransactionForm({ ...transactionForm, category_id: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="" className="bg-slate-800">Без категории</option>
              {categories
                .filter(cat => cat.type === transactionForm.type)
                .map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-slate-800">
                    {cat.name}
                  </option>
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
              className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Например: Зарплата или Продукты"
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
            className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            {editingTransaction ? 'Сохранить' : 'Добавить транзакцию'}
          </button>
        </form>
      </Modal>

      {/* Модальное окно категорий */}
      <Modal 
        isOpen={showCategoryModal} 
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
          setCategoryForm({ name: '', icon: 'ShoppingCart', type: 'expense' });
        }} 
        title={!editingCategory ? 'Управление категориями' : editingCategory.id ? 'Редактировать категорию' : 'Создать категорию'}
      >
        {!editingCategory ? (
          <div className="space-y-4">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categories.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-4">Нет категорий</p>
              ) : (
                categories.map((cat) => {
                  const IconComponent = getIconComponent(cat.icon);
                  const categoryColor = getCategoryColor(cat);
                  
                  return (
                    <div key={cat.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ 
                            background: `linear-gradient(135deg, ${categoryColor}40, ${categoryColor}80)`,
                            border: `1px solid ${categoryColor}60`
                          }}
                        >
                          <IconComponent className="w-4 h-4" style={{ color: categoryColor }} />
                        </div>
                        <div>
                          <span className="text-white text-sm font-medium">{cat.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${
                            cat.type === 'income'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {cat.type === 'income' ? 'Доход' : 'Расход'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditCategory(cat)}
                          className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Редактировать"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <button
              onClick={() => setEditingCategory({})}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Создать категорию
            </button>
          </div>
        ) : (
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Тип</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCategoryForm({ ...categoryForm, type: 'income' })}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      categoryForm.type === 'income'
                        ? 'bg-green-600 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    Доход
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryForm({ ...categoryForm, type: 'expense' })}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      categoryForm.type === 'expense'
                        ? 'bg-red-600 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    Расход
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Иконка</label>
                <IconPicker
                  selectedIcon={categoryForm.icon}
                  onSelectIcon={(icon) => setCategoryForm({ ...categoryForm, icon })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Название</label>
              <input
                type="text"
                required
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Например: Зарплата или Продукты"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryForm({ name: '', icon: 'ShoppingCart', type: 'expense' });
                }}
                className="flex-1 px-4 py-2.5 bg-white/10 text-white rounded-xl font-semibold text-sm hover:bg-white/20 transition-colors"
              >
                Назад
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                {editingCategory.id ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}