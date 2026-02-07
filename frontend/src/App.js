import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:8000/api';

function App() {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [tg, setTg] = useState(null);

  useEffect(() => {
    // Инициализация Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
      const webapp = window.Telegram.WebApp;
      setTg(webapp);
      
      // Настройка внешнего вида
      webapp.ready();
      webapp.expand();
      webapp.setHeaderColor('#2481cc');
      webapp.setBackgroundColor('#ffffff');
      
      // Получение данных пользователя из Telegram
      if (webapp.initDataUnsafe && webapp.initDataUnsafe.user) {
        setUser(webapp.initDataUnsafe.user);
      }
      
      // Настройка главной кнопки
      webapp.MainButton.setText('Обновить данные');
      webapp.MainButton.onClick(() => loadData());
      webapp.MainButton.show();
    }
    
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Получаем ID пользователя из Telegram
      let currentUserId = 1; // Fallback для демо
      
      if (user && user.id) {
        // Аутентификация через Telegram
        try {
          const authResponse = await axios.post(`${API_BASE}/auth/telegram`, {
            telegram_id: user.id.toString(),
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            init_data: tg ? tg.initData : ''
          });
          currentUserId = authResponse.data.user_id;
        } catch (authError) {
          console.error('Ошибка аутентификации:', authError);
          // Продолжаем с демо данными
        }
      }

      // Инициализируем демо данные только если пользователь не из Telegram
      if (!user) {
        await axios.post(`${API_BASE}/init-demo-data`);
      }

      // Загружаем статистику и транзакции
      const [statsResponse, transactionsResponse] = await Promise.all([
        axios.get(`${API_BASE}/users/${currentUserId}/stats`),
        axios.get(`${API_BASE}/users/${currentUserId}/transactions`)
      ]);

      setStats(statsResponse.data);
      setTransactions(transactionsResponse.data);
      
      // Обновляем главную кнопку
      if (tg && tg.MainButton) {
        tg.MainButton.setText('✅ Данные обновлены');
        setTimeout(() => {
          tg.MainButton.setText('Обновить данные');
        }, 2000);
      }
      
    } catch (err) {
      setError('Ошибка загрузки данных: ' + err.message);
      
      // Показываем ошибку через Telegram
      if (tg && tg.showAlert) {
        tg.showAlert('Ошибка загрузки данных: ' + err.message);
      }
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
        <h1>💰 Crypto Bot</h1>
        {user && (
          <p>Привет, {user.first_name}! 👋</p>
        )}
      </div>

      {stats && (
        <div className="stats">
          <div className="stat-card">
            <h3>💰 Доходы</h3>
            <div className="value income">
              {formatAmount(stats.total_income)}
            </div>
          </div>
          <div className="stat-card">
            <h3>💸 Расходы</h3>
            <div className="value expense">
              {formatAmount(stats.total_expense)}
            </div>
          </div>
          <div className="stat-card">
            <h3>💳 Баланс</h3>
            <div className={`value ${stats.balance >= 0 ? 'income' : 'expense'}`}>
              {formatAmount(stats.balance)}
            </div>
          </div>
          <div className="stat-card">
            <h3>📊 Операций</h3>
            <div className="value balance">
              {stats.transactions_count}
            </div>
          </div>
        </div>
      )}

      <div className="transactions">
        <div className="transactions-header">
          <h2>📈 Последние операции</h2>
        </div>
        {transactions.length === 0 ? (
          <div className="loading">Нет операций</div>
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
    </div>
  );
}

export default App;