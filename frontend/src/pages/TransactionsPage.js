import React, { useState, useEffect } from 'react';
import { transactionsAPI } from '../api/transactions';
import { categoriesAPI } from '../api/categories';
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    transaction_type: '',
    date_from: '',
    date_to: ''
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transactionsData, categoriesData] = await Promise.all([
        transactionsAPI.getTransactions(filters),
        categoriesAPI.getCategories()
      ]);
      
      setTransactions(transactionsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
      try {
        await transactionsAPI.deleteTransaction(id);
        toast.success('Транзакция удалена');
        loadData();
      } catch (error) {
        toast.error('Ошибка при удалении транзакции');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Транзакции</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить транзакцию
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Поиск..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filters.category_id}
            onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все категории</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={filters.transaction_type}
            onChange={(e) => setFilters({ ...filters, transaction_type: e.target.value })}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все типы</option>
            <option value="income">Доходы</option>
            <option value="expense">Расходы</option>
          </select>

          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Дата</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Название</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Категория</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Тип</th>
                  <th className="text-right py-3 px-4 text-gray-300 font-medium">Сумма</th>
                  <th className="text-center py-3 px-4 text-gray-300 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="py-3 px-4 text-gray-300">
                        {formatDate(transaction.transaction_date)}
                      </td>
                      <td className="py-3 px-4 text-white">{transaction.title}</td>
                      <td className="py-3 px-4 text-gray-300">
                        {transaction.category_name || 'Без категории'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'income' 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-red-900 text-red-300'
                        }`}>
                          {transaction.type === 'income' ? 'Доход' : 'Расход'}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-medium ${
                        transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingTransaction(transaction);
                              setShowModal(true);
                            }}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-400">
                      Нет транзакций
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;