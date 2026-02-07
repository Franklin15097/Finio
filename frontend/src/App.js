import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:8000/api';

function App() {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = 1; // Демо пользователь

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Инициализируем демо данные
      await axios.post(`${API_BASE}/init-demo-data`);

      // Загружаем статистику и транзакции
      const [statsResponse, transactionsResponse] = await Promise.all([
        axios.get(`${API_BASE}/users/${userId}/stats`),
        axios.get(`${API_BASE}/users/${userId}/transactions`)
      ]);

      setStats(statsResponse.data);
      setTransactions(transactionsResponse.data);
    } catch (err) {
      setError('Ошибка загрузки данных: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <button className="btn" onClick={loadData}>
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>💰 Finio</h1>
        <p>Система управления финансами</p>
      </div>

      {stats && (
        <div className="stats">
          <div className="stat-card">
            <h3>Доходы</h3>
            <div className="value income">
              {formatAmount(stats.total_income)}
            </div>
          </div>
          <div className="stat-card">
            <h3>Расходы</h3>
            <div className="value expense">
              {formatAmount(stats.total_expense)}
            </div>
          </div>
          <div className="stat-card">
            <h3>Баланс</h3>
            <div className={`value ${stats.balance >= 0 ? 'income' : 'expense'}`}>
              {formatAmount(stats.balance)}
            </div>
          </div>
          <div className="stat-card">
            <h3>Транзакций</h3>
            <div className="value balance">
              {stats.transactions_count}
            </div>
          </div>
        </div>
      )}

      <div className="transactions">
        <div className="transactions-header">
          <h2>Последние транзакции</h2>
        </div>
        {transactions.length === 0 ? (
          <div className="loading">Нет транзакций</div>
        ) : (
          transactions.map(transaction => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-info">
                <h4>{transaction.title}</h4>
                <p>{formatDate(transaction.date)}</p>
                {transaction.description && (
                  <p>{transaction.description}</p>
                )}
              </div>
              <div className={`transaction-amount ${transaction.type}`}>
                {transaction.type === 'income' ? '+' : '-'}
                {formatAmount(transaction.amount)}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button className="btn btn-success" onClick={loadData}>
          Обновить данные
        </button>
      </div>
    </div>
  );
}

export default App;