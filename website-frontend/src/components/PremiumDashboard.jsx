import { useState, useEffect } from 'react';
import '../styles/premium.css';

export function PremiumDashboard({ user, onLogout }) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [stats, setStats] = useState({ balance: 0, income: 0, expense: 0 });
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Mock data
    setStats({
      balance: 125000,
      income: 85000,
      expense: 42000
    });

    setTransactions([
      { id: 1, title: 'Зарплата', amount: 85000, type: 'income', category: 'Работа', date: '2026-02-07' },
      { id: 2, title: 'Продукты', amount: -3500, type: 'expense', category: 'Еда', date: '2026-02-06' },
      { id: 3, title: 'Бензин', amount: -2800, type: 'expense', category: 'Транспорт', date: '2026-02-05' },
      { id: 4, title: 'Кафе', amount: -1200, type: 'expense', category: 'Развлечения', date: '2026-02-04' },
      { id: 5, title: 'Фриланс', amount: 15000, type: 'income', category: 'Работа', date: '2026-02-03' }
    ]);
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
        <div className="stats-grid fade-in">
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
            <div className="stat-card-change">↗ +10% за месяц</div>
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
            <div className="stat-card-change">↗ +5% за месяц</div>
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
            <div className="stat-card-change">↘ -2% за месяц</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid-2 fade-in">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Динамика расходов</h3>
            </div>
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              График в разработке...
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Категории</h3>
            </div>
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              Диаграмма в разработке...
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="card fade-in">
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

        <div className="sidebar-footer">
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
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}
