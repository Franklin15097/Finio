import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export function TransactionsList({ onBack }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, income, expense

  useEffect(() => {
    loadTransactions();
  }, [filter]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      // Mock data - заменить на реальный API вызов
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
          amount: -3500,
          type: 'expense',
          category_name: 'Еда',
          transaction_date: '2026-02-06'
        },
        {
          id: 3,
          title: 'Бензин',
          amount: -2800,
          type: 'expense',
          category_name: 'Транспорт',
          transaction_date: '2026-02-05'
        },
        {
          id: 4,
          title: 'Фриланс',
          amount: 15000,
          type: 'income',
          category_name: 'Подработка',
          transaction_date: '2026-02-04'
        }
      ];

      let filtered = mockTransactions;
      if (filter !== 'all') {
        filtered = mockTransactions.filter(t => t.type === filter);
      }

      setTransactions(filtered);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

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
    return (
      <div className="page">
        <div className="page-header">
          <button className="back-btn" onClick={onBack}>←</button>
          <h2>Операции</h2>
        </div>
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h2>Операции</h2>
      </div>

      <div className="filter-tabs">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          Все
        </button>
        <button 
          className={filter === 'income' ? 'active' : ''} 
          onClick={() => setFilter('income')}
        >
          Доходы
        </button>
        <button 
          className={filter === 'expense' ? 'active' : ''} 
          onClick={() => setFilter('expense')}
        >
          Расходы
        </button>
      </div>

      <div className="transactions-list">
        {transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <p>Нет операций</p>
          </div>
        ) : (
          transactions.map(transaction => {
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
          })
        )}
      </div>
    </div>
  );
}