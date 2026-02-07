import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { toast } from '../utils/toast';

export function Dashboard() {
  const [stats, setStats] = useState({ balance: 0, income: 0, expense: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [statsData, transData] = await Promise.all([
        api.get('/statistics/dashboard'),
        api.get('/transactions?limit=5')
      ]);
      setStats(statsData);
      setTransactions(transData);
    } catch (error) {
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Баланс</div>
          <div className="value">₽ {stats.balance.toLocaleString()}</div>
        </div>
        
        <div className="stat-card success">
          <div className="label">Доходы</div>
          <div className="value">↑ ₽ {stats.income.toLocaleString()}</div>
        </div>
        
        <div className="stat-card danger">
          <div className="label">Расходы</div>
          <div className="value">↓ ₽ {stats.expense.toLocaleString()}</div>
        </div>
        
        <div className="stat-card">
          <div className="label">Экономия</div>
          <div className="value">₽ {(stats.income - stats.expense).toLocaleString()}</div>
        </div>
      </div>

      <div className="section">
        <h3>Последние операции</h3>
        <div className="transactions-list">
          {transactions.map(t => (
            <div key={t.id} className="transaction-item">
              <div>
                <div className="title">{t.title}</div>
                <div className="date">{new Date(t.transaction_date).toLocaleDateString('ru')}</div>
              </div>
              <div className={`amount ${t.type}`}>
                {t.type === 'income' ? '+' : '-'} ₽ {Math.abs(t.amount).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
