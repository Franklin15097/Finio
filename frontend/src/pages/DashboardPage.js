import React, { useState, useEffect } from 'react';
import { transactionsAPI } from '../api/transactions';
import { categoriesAPI } from '../api/categories';
import { TrendingUp, TrendingDown, Wallet, Plus } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, transactionsData, categoriesData] = await Promise.all([
        transactionsAPI.getStats(),
        transactionsAPI.getTransactions({ limit: 10 }),
        categoriesAPI.getCategories()
      ]);
      
      setStats(statsData);
      setTransactions(transactionsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
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

  // Chart data
  const lineChartData = {
    labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
    datasets: [
      {
        label: 'Доходы',
        data: [12000, 15000, 13000, 18000, 16000, 20000],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Расходы',
        data: [8000, 12000, 10000, 14000, 11000, 15000],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const doughnutChartData = {
    labels: categories.filter(c => c.type === 'expense').slice(0, 5).map(c => c.name),
    datasets: [
      {
        data: [30, 25, 20, 15, 10],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#CBD5E1',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#CBD5E1',
        },
        grid: {
          color: '#374151',
        },
      },
      y: {
        ticks: {
          color: '#CBD5E1',
        },
        grid: {
          color: '#374151',
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Текущий баланс</p>
              <p className="text-2xl font-bold text-white">
                {stats ? formatCurrency(stats.balance) : '₽0.00'}
              </p>
            </div>
            <div className="bg-blue-600 p-3 rounded-full">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-400">
            <span className="text-green-400">●</span> Активно
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Доходы</p>
              <p className="text-2xl font-bold text-green-400">
                {stats ? formatCurrency(stats.total_income) : '₽0.00'}
              </p>
            </div>
            <div className="bg-green-600 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 text-sm text-green-400">
            +0% за месяц
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Расходы</p>
              <p className="text-2xl font-bold text-red-400">
                {stats ? formatCurrency(stats.total_expense) : '₽0.00'}
              </p>
            </div>
            <div className="bg-red-600 p-3 rounded-full">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 text-sm text-red-400">
            +0% за месяц
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Динамика расходов</h3>
          <div className="h-64">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Категории расходов</h3>
          <div className="h-64">
            <Doughnut data={doughnutChartData} options={{ ...chartOptions, scales: undefined }} />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Последние операции</h3>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Добавить
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Дата</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Название</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Категория</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Сумма</th>
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
                    <td className={`py-3 px-4 text-right font-medium ${
                      transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-400">
                    Нет транзакций
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;