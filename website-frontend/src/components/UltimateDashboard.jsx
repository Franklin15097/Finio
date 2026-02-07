import { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { IncomePage } from './IncomePage';
import { ExpensesPage } from './ExpensesPage';
import { AssetsPage } from './AssetsPage';
import '../styles/dark-premium.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function UltimateDashboard({ user, onLogout }) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [periodFilter, setPeriodFilter] = useState('month');
  const [typeFilter, setTypeFilter] = useState('expense');
  const [stats, setStats] = useState({ balance: 0, income: 0, expense: 0 });
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);

  useEffect(() => {
    loadData();
  }, [periodFilter, typeFilter]);

  const loadData = () => {
    // Пустые данные - будут заполняться через API
    setStats({
      balance: 0,
      income: 0,
      expense: 0
    });

    setTransactions([]);

    // Line chart data
    setChartData({
      labels: ['1 фев', '2 фев', '3 фев', '4 фев', '5 фев', '6 фев', '7 фев'],
      datasets: [
        {
          label: typeFilter === 'expense' ? 'Расходы' : 'Доходы',
          data: [0, 0, 0, 0, 0, 0, 0],
          borderColor: typeFilter === 'expense' ? '#EF4444' : '#10B981',
          backgroundColor: typeFilter === 'expense' 
            ? 'rgba(239, 68, 68, 0.1)' 
            : 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: typeFilter === 'expense' ? '#EF4444' : '#10B981',
          pointBorderColor: '#1A2142',
          pointBorderWidth: 2,
        }
      ]
    });

    // Doughnut chart data
    setCategoryData({
      labels: ['Нет данных'],
      datasets: [
        {
          data: [1],
          backgroundColor: ['#374151'],
          borderColor: '#1A2142',
          borderWidth: 3,
          hoverOffset: 20
        }
      ]
    });
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1F2749',
        titleColor: '#F9FAFB',
        bodyColor: '#9CA3AF',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => {
            return `${context.parsed.y.toLocaleString('ru-RU')} ₽`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          callback: (value) => `${value.toLocaleString('ru-RU')} ₽`
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6B7280'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#9CA3AF',
          padding: 20,
          font: {
            size: 13,
            weight: 600
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: '#1F2749',
        titleColor: '#F9FAFB',
        bodyColor: '#9CA3AF',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed.toLocaleString('ru-RU')} ₽ (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%'
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    });
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Дашборд',
      icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    },
    {
      id: 'income',
      label: 'Доходы',
      icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
    },
    {
      id: 'expenses',
      label: 'Расходы',
      icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
    },
    {
      id: 'assets',
      label: 'Счета',
      icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
    },
    {
      id: 'settings',
      label: 'Настройки',
      icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    }
  ];

  const renderContent = () => {
    if (currentView === 'income') {
      return <IncomePage />;
    }
    
    if (currentView === 'expenses') {
      return <ExpensesPage />;
    }
    
    if (currentView === 'assets') {
      return <AssetsPage />;
    }
    
    if (currentView !== 'dashboard') {
      return (
        <div>
          <div className="page-header">
            <div>
              <h1 className="page-title">{menuItems.find(i => i.id === currentView)?.label}</h1>
              <p className="page-subtitle">Раздел в разработке</p>
            </div>
          </div>
          <div className="card">
            <p style={{ color: 'var(--text-secondary)' }}>Этот раздел скоро будет доступен...</p>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="page-header">
          <div>
            <h1 className="page-title">Обзор</h1>
            <p className="page-subtitle">
              {new Date().toLocaleDateString('ru-RU', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-card-header">
              <div className="stat-card-title">Текущий баланс</div>
              <div className="stat-card-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="stat-card-value">{formatCurrency(stats.balance)}</div>
            <div className="stat-card-change positive">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              +10% за месяц
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-card-header">
              <div className="stat-card-title">Доходы</div>
              <div className="stat-card-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="stat-card-value">{formatCurrency(stats.income)}</div>
            <div className="stat-card-change positive">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              +5% за месяц
            </div>
          </div>

          <div className="stat-card danger">
            <div className="stat-card-header">
              <div className="stat-card-title">Расходы</div>
              <div className="stat-card-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
            </div>
            <div className="stat-card-value">{formatCurrency(stats.expense)}</div>
            <div className="stat-card-change negative">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
              -2% за месяц
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Динамика {typeFilter === 'expense' ? 'расходов' : 'доходов'}</h3>
              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                <div className="filter-tabs">
                  <button 
                    className={`filter-tab ${typeFilter === 'expense' ? 'active' : ''}`}
                    onClick={() => setTypeFilter('expense')}
                  >
                    Расходы
                  </button>
                  <button 
                    className={`filter-tab ${typeFilter === 'income' ? 'active' : ''}`}
                    onClick={() => setTypeFilter('income')}
                  >
                    Доходы
                  </button>
                </div>
                <div className="filter-tabs">
                  <button 
                    className={`filter-tab ${periodFilter === 'month' ? 'active' : ''}`}
                    onClick={() => setPeriodFilter('month')}
                  >
                    Месяц
                  </button>
                  <button 
                    className={`filter-tab ${periodFilter === 'year' ? 'active' : ''}`}
                    onClick={() => setPeriodFilter('year')}
                  >
                    Год
                  </button>
                  <button 
                    className={`filter-tab ${periodFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setPeriodFilter('all')}
                  >
                    Всё время
                  </button>
                </div>
              </div>
            </div>
            <div className="chart-container">
              {chartData && <Line data={chartData} options={chartOptions} />}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Категории</h3>
            </div>
            <div className="chart-container">
              {categoryData && <Doughnut data={categoryData} options={doughnutOptions} />}
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Последние операции</h3>
            <button className="btn btn-primary">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Добавить
            </button>
          </div>
          
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Название</th>
                  <th>Категория</th>
                  <th style={{ textAlign: 'right' }}>Сумма</th>
                  <th style={{ textAlign: 'right' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {formatDate(transaction.date)}
                    </td>
                    <td className="font-semibold">
                      {transaction.title}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {transaction.category}
                    </td>
                    <td style={{ 
                      textAlign: 'right',
                      fontWeight: 700,
                      color: transaction.type === 'income' ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-secondary" style={{ padding: 'var(--space-2) var(--space-3)', fontSize: '0.8125rem' }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">💎</div>
          <div className="sidebar-logo-text">Finio</div>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="user-profile">
          <div className="user-avatar">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'Пользователь'}</div>
            <button className="user-action" onClick={onLogout}>
              Выйти
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}
