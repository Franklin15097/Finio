import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { toast } from '../utils/toast';

export function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({ balance: 0, income: 0, expense: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Mock data - заменить на реальные API вызовы
      const mockStats = {
        balance: 125000,
        income: 85000,
        expense: 42000
      };

      const mockTransactions = [
        {
          id: 1,
          title: 'Зарплата',
          amount: 85000,
          type: 'income',
          category_name: 'Работа',
          transaction_date: '2026-02-07'
        },
        {
          id: 2,
          title: 'Продукты',
          amount: 3500,
          type: 'expense',
          category_name: 'Еда',
          transaction_date: '2026-02-06'
        },
        {
          id: 3,
          title: 'Бензин',
          amount: 2800,
          type: 'expense',
          category_name: 'Транспорт',
          transaction_date: '2026-02-05'
        }
      ];

      setStats(mockStats);
      setTransactions(mockTransactions.slice(0, 5));
    } catch (error) {
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    });
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="dashboard">
      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card balance">
          <div className="stat-label">Баланс</div>
          <div className="stat-value">{formatCurrency(stats.balance)}</div>
        </div>
        <div className="stat-card income">
          <div className="stat-label">Доходы</div>
          <div className="stat-value success">+{formatCurrency(stats.income)}</div>
        </div>
        <div className="stat-card expense">
          <div className="stat-label">Расходы</div>
          <div className="stat-value danger">-{formatCurrency(stats.expense)}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <button 
          className="action-card"
          onClick={() => onNavigate('add')}
          style={{
            background: 'var(--surface-base)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            cursor: 'pointer',
            transition: 'all var(--transition-base)',
            textAlign: 'center',
            color: 'var(--text-primary)'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>➕</div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Добавить</div>
        </button>
        
        <button 
          className="action-card"
          onClick={() => onNavigate('transactions')}
          style={{
            background: 'var(--surface-base)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            cursor: 'pointer',
            transition: 'all var(--transition-base)',
            textAlign: 'center',
            color: 'var(--text-primary)'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Операции</div>
        </button>
      </div>

      {/* Recent Transactions */}
      <div className="recent-transactions">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1rem' 
        }}>
          <h3>Последние операции</h3>
          <button 
            onClick={() => onNavigate('transactions')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--brand-primary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            Все →
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <p>Нет операций</p>
            <button 
              className="btn-primary" 
              onClick={() => onNavigate('add')}
              style={{ marginTop: '1rem' }}
            >
              Добавить первую операцию
            </button>
          </div>
        ) : (
          <div className="transactions-list">
            {transactions.map(transaction => {
              const isIncome = transaction.type === 'income';
              return (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-info">
                    <div className="transaction-title">{transaction.title}</div>
                    <div className="transaction-meta">
                      {transaction.category_name} • {formatDate(transaction.transaction_date)}
                    </div>
                  </div>
                  <div className={`transaction-amount ${isIncome ? 'income' : 'expense'}`}>
                    {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assets Quick View */}
      <div style={{ 
        background: 'var(--surface-base)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1rem' 
        }}>
          <h3>Счета</h3>
          <button 
            onClick={() => onNavigate('assets')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--brand-primary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            Управление →
          </button>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '1rem',
          background: 'var(--surface-overlay)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              Общий баланс
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
              {formatCurrency(stats.balance)}
            </div>
          </div>
          <div style={{ fontSize: '2rem' }}>💳</div>
        </div>
      </div>
    </div>
  );
}
