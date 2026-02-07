import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { api } from '../utils/api';
import '../styles/dark-premium.css';

export function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category_id: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });
  const [recurringFormData, setRecurringFormData] = useState({
    title: '',
    amount: ''
  });

  useEffect(() => {
    loadExpenses();
    loadRecurringExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const transactions = await api.getTransactions();
      const expenseTransactions = transactions.filter(t => t.type === 'expense');
      setExpenses(expenseTransactions);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const loadRecurringExpenses = async () => {
    try {
      const recurring = await api.getRecurringExpenses();
      setRecurringExpenses(recurring);
    } catch (error) {
      console.error('Error loading recurring expenses:', error);
    }
  };

  const chartData = {
    labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл'],
    datasets: [{
      label: 'Расходы',
      data: [0, 0, 0, 0, 0, 0, 0],
      borderColor: '#EF4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointRadius: 6,
      pointBackgroundColor: '#EF4444',
      pointBorderColor: '#1E1E2E',
      pointBorderWidth: 2,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1E1E2E',
        titleColor: '#F9FAFB',
        bodyColor: '#9CA3AF',
        borderColor: 'rgba(139, 92, 246, 0.2)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.parsed.y.toLocaleString('ru-RU')} ₽`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
        ticks: {
          color: '#6B7280',
          callback: (value) => `${value.toLocaleString('ru-RU')} ₽`
        }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#6B7280' }
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalRecurring = recurringExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Создаем новый расход через API
      await api.createTransaction({
        title: formData.title,
        amount: parseFloat(formData.amount),
        type: 'expense',
        category_id: formData.category_id || null,
        transaction_date: formData.transaction_date
      });
      
      // Обновляем список
      await loadExpenses();
      
      // Закрываем модалку и очищаем форму
      setShowModal(false);
      setFormData({ title: '', amount: '', category_id: '', transaction_date: new Date().toISOString().split('T')[0] });
    } catch (error) {
      console.error('Error creating expense:', error);
      alert('Ошибка при создании расхода');
    }
  };

  const handleRecurringSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Создаем новый обязательный платеж через API
      await api.createRecurringExpense({
        title: recurringFormData.title,
        amount: parseFloat(recurringFormData.amount),
        category_id: null
      });
      
      // Обновляем список
      await loadRecurringExpenses();
      
      // Закрываем модалку и очищаем форму
      setShowRecurringModal(false);
      setRecurringFormData({ title: '', amount: '' });
    } catch (error) {
      console.error('Error creating recurring expense:', error);
      alert('Ошибка при создании обязательного платежа');
    }
  };

  const handleDeleteRecurring = async (id) => {
    if (confirm('Удалить обязательный платеж?')) {
      try {
        await api.deleteRecurringExpense(id);
        await loadRecurringExpenses();
      } catch (error) {
        console.error('Error deleting recurring expense:', error);
        alert('Ошибка при удалении');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Расходы</h1>
          <p className="page-subtitle">Управление расходами и обязательными платежами</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Добавить расход
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: 'var(--space-8)' }}>
        <div className="stat-card danger">
          <div className="stat-card-header">
            <div className="stat-card-title">Всего расходов</div>
            <div className="stat-card-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value">{formatCurrency(totalExpenses)}</div>
          <div className="stat-card-change negative">За текущий месяц</div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, transparent 100%), var(--bg-card)' }}>
          <div className="stat-card-header">
            <div className="stat-card-title">Обязательные</div>
            <div className="stat-card-icon" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B' }}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value" style={{ color: '#F59E0B' }}>{formatCurrency(totalRecurring)}</div>
          <div className="stat-card-change">В месяц</div>
        </div>

        <div className="stat-card primary">
          <div className="stat-card-header">
            <div className="stat-card-title">В год</div>
            <div className="stat-card-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value">{formatCurrency(totalRecurring * 12)}</div>
          <div className="stat-card-change">Обязательные расходы</div>
        </div>
      </div>

      {/* Chart and Recurring Expenses - Side by Side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        {/* Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Динамика расходов</h3>
            <div className="filter-tabs">
              <button className="filter-tab active">Месяц</button>
              <button className="filter-tab">Год</button>
            </div>
          </div>
          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Recurring Expenses */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Обязательные расходы</h3>
            <button className="btn btn-primary" onClick={() => setShowRecurringModal(true)}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Добавить
            </button>
          </div>
          
          {recurringExpenses.length === 0 ? (
            <div style={{ 
              padding: 'var(--space-8)', 
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <svg 
                width="48" 
                height="48" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                style={{ 
                  margin: '0 auto var(--space-3)',
                  opacity: 0.3
                }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                Нет платежей
              </p>
              <p style={{ fontSize: 'var(--text-sm)' }}>
                Добавьте регулярные платежи
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', padding: 'var(--space-2)' }}>
              {recurringExpenses.map((expense) => (
                <div key={expense.id} style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                  transition: 'var(--transition)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                    <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>{expense.title}</h4>
                    <button 
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                      onClick={() => handleDeleteRecurring(expense.id)}
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--warning)', marginBottom: 'var(--space-1)' }}>
                    {formatCurrency(expense.amount)}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    {formatCurrency(expense.yearly_amount)} в год
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">История расходов</h3>
        </div>
        
        {expenses.length === 0 ? (
          <div style={{ 
            padding: 'var(--space-12)', 
            textAlign: 'center',
            color: 'var(--text-secondary)'
          }}>
            <svg 
              width="64" 
              height="64" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              style={{ 
                margin: '0 auto var(--space-4)',
                opacity: 0.3
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
              Нет расходов
            </p>
            <p style={{ fontSize: 'var(--text-sm)' }}>
              Добавьте первый расход, нажав кнопку "Добавить расход"
            </p>
          </div>
        ) : (
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
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {new Date(expense.transaction_date).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="font-semibold">{expense.title}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{expense.category_name}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--danger)' }}>
                      -{formatCurrency(expense.amount)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-secondary" style={{ padding: 'var(--space-2) var(--space-3)', fontSize: '0.8125rem', marginRight: 'var(--space-2)' }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="btn btn-secondary" style={{ padding: 'var(--space-2) var(--space-3)', fontSize: '0.8125rem', color: 'var(--danger)' }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expense Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 'var(--space-4)'
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', animation: 'scaleIn 0.3s ease-out' }}>
            <div className="card-header">
              <h3 className="card-title">Новый расход</h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, fontSize: '0.875rem' }}>Название</label>
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: 'var(--space-4)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9375rem'
                  }}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, fontSize: '0.875rem' }}>Сумма</label>
                <input
                  type="number"
                  style={{
                    width: '100%',
                    padding: 'var(--space-4)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9375rem'
                  }}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, fontSize: '0.875rem' }}>Дата</label>
                <input
                  type="date"
                  style={{
                    width: '100%',
                    padding: 'var(--space-4)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9375rem'
                  }}
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Создать
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ flex: 1 }}
                  onClick={() => setShowModal(false)}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recurring Expense Modal */}
      {showRecurringModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 'var(--space-4)'
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', animation: 'scaleIn 0.3s ease-out' }}>
            <div className="card-header">
              <h3 className="card-title">Новый обязательный платеж</h3>
              <button 
                onClick={() => setShowRecurringModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleRecurringSubmit}>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, fontSize: '0.875rem' }}>Название</label>
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: 'var(--space-4)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9375rem'
                  }}
                  value={recurringFormData.title}
                  onChange={(e) => setRecurringFormData({ ...recurringFormData, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, fontSize: '0.875rem' }}>Сумма в месяц</label>
                <input
                  type="number"
                  style={{
                    width: '100%',
                    padding: 'var(--space-4)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9375rem'
                  }}
                  value={recurringFormData.amount}
                  onChange={(e) => setRecurringFormData({ ...recurringFormData, amount: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Создать
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ flex: 1 }}
                  onClick={() => setShowRecurringModal(false)}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
