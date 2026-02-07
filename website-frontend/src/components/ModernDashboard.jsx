import { useState, useEffect } from 'react';
import '../styles/modern.css';

export function ModernDashboard({ user, onLogout }) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [stats, setStats] = useState({ balance: 0, income: 0, expense: 0 });
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Mock data
    setStats({
      balance: 125000,
      income: 85000,
      expense: 42000
    });

    setTransactions([
      {
        id: 1,
        title: 'Зарплата',
        amount: 85000,
        type: 'income',
        category: 'Работа',
        date: '2026-02-07'
      },
      {
        id: 2,
        title: 'Продукты',
        amount: -3500,
        type: 'expense',
        category: 'Еда',
        date: '2026-02-06'
      },
      {
        id: 3,
        title: 'Бензин',
        amount: -2800,
        type: 'expense',
        category: 'Транспорт',
        date: '2026-02-05'
      }
    ]);
  }, []);

  const menuItems = [
    {
      id: 'dashboard',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
        </svg>
      ),
      label: 'Дашборд'
    },
    {
      id: 'income',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
        </svg>
      ),
      label: 'Доходы'
    },
    {
      id: 'expenses',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
        </svg>
      ),
      label: 'Расходы'
    },
    {
      id: 'assets',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      label: 'Счета'
    },
    {
      id: 'settings',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: 'Настройки'
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'income':
        return (
          <div>
            <div className="modern-header">
              <h1>Доходы</h1>
            </div>
            <div className="modern-card">
              <p>Раздел доходов в разработке...</p>
            </div>
          </div>
        );
      case 'expenses':
        return (
          <div>
            <div className="modern-header">
              <h1>Расходы</h1>
            </div>
            <div className="modern-card">
              <p>Раздел расходов в разработке...</p>
            </div>
          </div>
        );
      case 'assets':
        return (
          <div>
            <div className="modern-header">
              <h1>Счета</h1>
            </div>
            <div className="modern-card">
              <p>Раздел счетов в разработке...</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div>
            <div className="modern-header">
              <h1>Настройки</h1>
            </div>
            <div className="modern-card">
              <p>Настройки в разработке...</p>
            </div>
          </div>
        );
      default:
        return (
          <>
            <div className="modern-header">
              <h1>Обзор</h1>
              <div className="modern-date">
                {new Date().toLocaleDateString('ru-RU', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="modern-stats">
              <div className="modern-stat-card balance">
                <div className="modern-stat-header">
                  <div className="modern-stat-title">Текущий баланс</div>
                  <svg className="modern-stat-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="modern-stat-value">{formatCurrency(stats.balance)}</div>
                <div className="modern-stat-change">+10% за месяц</div>
              </div>

              <div className="modern-stat-card income">
                <div className="modern-stat-header">
                  <div className="modern-stat-title">Доходы</div>
                  <svg className="modern-stat-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
                <div className="modern-stat-value">{formatCurrency(stats.income)}</div>
                <div className="modern-stat-change">+5% за месяц</div>
              </div>

              <div className="modern-stat-card expense">
                <div className="modern-stat-header">
                  <div className="modern-stat-title">Расходы</div>
                  <svg className="modern-stat-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                </div>
                <div className="modern-stat-value">{formatCurrency(stats.expense)}</div>
                <div className="modern-stat-change">-2% за месяц</div>
              </div>
            </div>

            {/* Charts and Transactions */}
            <div className="modern-grid-2">
              <div className="modern-card">
                <div className="modern-card-header">
                  <h3 className="modern-card-title">Динамика расходов</h3>
                </div>
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  График в разработке...
                </div>
              </div>

              <div className="modern-card">
                <div className="modern-card-header">
                  <h3 className="modern-card-title">Категории</h3>
                </div>
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  Диаграмма в разработке...
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="modern-card">
              <div className="modern-card-header">
                <h3 className="modern-card-title">Последние операции</h3>
                <button className="modern-btn modern-btn-primary">
                  + Добавить
                </button>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <th style={{ padding: 'var(--space-3)', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Дата</th>
                      <th style={{ padding: 'var(--space-3)', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Название</th>
                      <th style={{ padding: 'var(--space-3)', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Категория</th>
                      <th style={{ padding: 'var(--space-3)', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 600 }}>Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>
                          {new Date(transaction.date).toLocaleDateString('ru-RU')}
                        </td>
                        <td style={{ padding: 'var(--space-3)', fontWeight: 600 }}>
                          {transaction.title}
                        </td>
                        <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>
                          {transaction.category}
                        </td>
                        <td style={{ 
                          padding: 'var(--space-3)', 
                          textAlign: 'right', 
                          fontWeight: 700,
                          color: transaction.type === 'income' ? 'var(--success)' : 'var(--danger)'
                        }}>
                          {formatCurrency(Math.abs(transaction.amount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="modern-layout">
      {/* Sidebar */}
      <aside className="modern-sidebar">
        <div className="modern-logo">Finio</div>
        
        <nav className="modern-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`modern-nav-item ${currentView === item.id ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              background: 'var(--gradient-primary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white', 
              fontWeight: 700 
            }}>
              {user?.name?.[0] || 'U'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                {user?.name || 'Пользователь'}
              </div>
              <button 
                onClick={onLogout}
                style={{ 
                  fontSize: 'var(--text-xs)', 
                  color: 'var(--text-secondary)', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="modern-main">
        {renderContent()}
      </main>
    </div>
  );
}