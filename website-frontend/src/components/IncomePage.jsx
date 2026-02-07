import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import '../styles/dark-premium.css';

export function IncomePage() {
  const [incomes, setIncomes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category_id: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadIncomes();
  }, []);

  const loadIncomes = async () => {
    // Mock data - замени на реальный API
    setIncomes([
      { id: 1, title: 'Зарплата', amount: 85000, category_name: 'Работа', transaction_date: '2026-02-07' },
      { id: 2, title: 'Фриланс', amount: 15000, category_name: 'Работа', transaction_date: '2026-02-03' },
      { id: 3, title: 'Дивиденды', amount: 5000, category_name: 'Инвестиции', transaction_date: '2026-02-01' },
      { id: 4, title: 'Бонус', amount: 10000, category_name: 'Работа', transaction_date: '2026-01-28' },
      { id: 5, title: 'Продажа', amount: 8000, category_name: 'Другое', transaction_date: '2026-01-25' }
    ]);
  };

  const chartData = {
    labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл'],
    datasets: [
      {
        label: 'Доходы',
        data: [95000, 115000, 105000, 125000, 110000, 130000, 120000],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#1A2142',
        pointBorderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1F2749',
        titleColor: '#F9FAFB',
        bodyColor: '#9CA3AF',
        borderColor: 'rgba(255, 255, 255, 0.1)',
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Здесь будет API запрос
    console.log('Saving income:', formData);
    setShowModal(false);
    setFormData({ title: '', amount: '', category_id: '', transaction_date: new Date().toISOString().split('T')[0] });
  };

  const handleEdit = (income) => {
    setEditingIncome(income);
    setFormData({
      title: income.title,
      amount: income.amount,
      category_id: income.category_id || '',
      transaction_date: income.transaction_date
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Удалить доход?')) {
      // API запрос на удаление
      setIncomes(incomes.filter(i => i.id !== id));
    }
  };

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Доходы</h1>
          <p className="page-subtitle">Управление источниками дохода</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Добавить доход
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: 'var(--space-8)' }}>
        <div className="stat-card success">
          <div className="stat-card-header">
            <div className="stat-card-title">Всего доходов</div>
            <div className="stat-card-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value">{formatCurrency(totalIncome)}</div>
          <div className="stat-card-change positive">За текущий месяц</div>
        </div>

        <div className="stat-card primary">
          <div className="stat-card-header">
            <div className="stat-card-title">Средний доход</div>
            <div className="stat-card-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value">{formatCurrency(totalIncome / incomes.length || 0)}</div>
          <div className="stat-card-change">На одну транзакцию</div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, transparent 100%), var(--bg-card)' }}>
          <div className="stat-card-header">
            <div className="stat-card-title">Транзакций</div>
            <div className="stat-card-icon" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B' }}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value" style={{ color: '#F59E0B' }}>{incomes.length}</div>
          <div className="stat-card-change">За текущий месяц</div>
        </div>
      </div>

      {/* Chart */}
      <div className="card" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="card-header">
          <h3 className="card-title">Динамика доходов</h3>
          <div className="filter-tabs">
            <button className="filter-tab active">Месяц</button>
            <button className="filter-tab">Год</button>
            <button className="filter-tab">Всё время</button>
          </div>
        </div>
        <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">История доходов</h3>
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
              {incomes.map((income) => (
                <tr key={income.id}>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {formatDate(income.transaction_date)}
                  </td>
                  <td className="font-semibold">{income.title}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{income.category_name}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>
                    +{formatCurrency(income.amount)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: 'var(--space-2) var(--space-3)', fontSize: '0.8125rem', marginRight: 'var(--space-2)' }}
                      onClick={() => handleEdit(income)}
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: 'var(--space-2) var(--space-3)', fontSize: '0.8125rem', color: 'var(--danger)' }}
                      onClick={() => handleDelete(income.id)}
                    >
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
      </div>

      {/* Modal */}
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
              <h3 className="card-title">{editingIncome ? 'Редактировать доход' : 'Новый доход'}</h3>
              <button 
                onClick={() => { setShowModal(false); setEditingIncome(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Название</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Сумма</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Дата</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingIncome ? 'Сохранить' : 'Создать'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ flex: 1 }}
                  onClick={() => { setShowModal(false); setEditingIncome(null); }}
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
