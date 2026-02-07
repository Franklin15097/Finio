import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import '../styles/dark-premium.css';

export function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    balance: '',
    actual_balance: '',
    currency: 'RUB',
    savings_percentage: '',
    category_id: ''
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: ''
  });

  useEffect(() => {
    loadAssets();
    loadCategories();
  }, []);

  const loadAssets = async () => {
    try {
      const data = await api.getAssets();
      setAssets(data.assets || []);
    } catch (error) {
      console.error('Error loading assets:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await api.getAssetCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const formatCurrency = (amount, currency) => {
    if (currency === 'USDT') {
      return `${amount.toLocaleString('ru-RU')} USDT`;
    }
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totalRUB = assets.filter(a => a.currency === 'RUB').reduce((sum, a) => sum + a.balance, 0);
  const totalUSDT = assets.filter(a => a.currency === 'USDT').reduce((sum, a) => sum + a.balance, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await api.createAsset({
        name: formData.name,
        balance: parseFloat(formData.balance),
        actual_balance: parseFloat(formData.actual_balance),
        currency: formData.currency,
        savings_percentage: parseFloat(formData.savings_percentage),
        category_id: formData.category_id || null
      });
      
      await loadAssets();
      setShowModal(false);
      setFormData({ name: '', balance: '', actual_balance: '', currency: 'RUB', savings_percentage: '', category_id: '' });
    } catch (error) {
      console.error('Error creating asset:', error);
      alert('Ошибка при создании счета');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    try {
      await api.createAssetCategory({ name: categoryFormData.name });
      await loadCategories();
      setShowCategoryModal(false);
      setCategoryFormData({ name: '' });
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Ошибка при создании категории');
    }
  };

  const handleDeleteAsset = async (id) => {
    if (confirm('Удалить счет?')) {
      try {
        await api.deleteAsset(id);
        await loadAssets();
      } catch (error) {
        console.error('Error deleting asset:', error);
        alert('Ошибка при удалении');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Счета</h1>
          <p className="page-subtitle">Управление счетами и накоплениями</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-secondary" onClick={() => setShowCategoryModal(true)}>
            Категории
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Добавить счет
          </button>
        </div>
      </div>

      {/* Total Balance */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginBottom: 'var(--space-8)' }}>
        <div className="stat-card primary">
          <div className="stat-card-header">
            <div className="stat-card-title">Общий баланс RUB</div>
            <div className="stat-card-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value">{formatCurrency(totalRUB, 'RUB')}</div>
          <div className="stat-card-change">Все счета в рублях</div>
        </div>

        <div className="stat-card success">
          <div className="stat-card-header">
            <div className="stat-card-title">Общий баланс USDT</div>
            <div className="stat-card-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value">{formatCurrency(totalUSDT, 'USDT')}</div>
          <div className="stat-card-change">Все счета в USDT</div>
        </div>
      </div>

      {/* Assets Grid */}
      {assets.length === 0 ? (
        <div className="card">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <p style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
              Нет счетов
            </p>
            <p style={{ fontSize: 'var(--text-sm)' }}>
              Добавьте первый счет, нажав кнопку "Добавить счет"
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
          {assets.map((asset) => (
          <div key={asset.id} className="card" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                  {asset.name}
                </h3>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  {asset.category_name}
                </div>
              </div>
              <div style={{ 
                padding: 'var(--space-2) var(--space-4)', 
                background: asset.currency === 'USDT' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                borderRadius: 'var(--radius)',
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                color: asset.currency === 'USDT' ? 'var(--success)' : 'var(--primary)'
              }}>
                {asset.currency}
              </div>
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                Расчетный баланс
              </div>
              <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--primary-light)' }}>
                {formatCurrency(asset.balance, asset.currency)}
              </div>
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                Фактический баланс
              </div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>
                {formatCurrency(asset.actual_balance, asset.currency)}
              </div>
            </div>

            <div style={{ 
              padding: 'var(--space-4)', 
              background: 'var(--bg-secondary)', 
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)'
            }}>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                Правило накопления
              </div>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--success)' }}>
                {asset.savings_percentage}% от доходов
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }}>
                Редактировать
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ color: 'var(--danger)' }}
                onClick={() => handleDeleteAsset(asset.id)}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Asset Modal */}
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
              <h3 className="card-title">Новый счет</h3>
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, fontSize: '0.875rem' }}>Валюта</label>
                <select
                  style={{
                    width: '100%',
                    padding: 'var(--space-4)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9375rem'
                  }}
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                >
                  <option value="RUB">RUB</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, fontSize: '0.875rem' }}>Расчетный баланс</label>
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
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, fontSize: '0.875rem' }}>Фактический баланс</label>
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
                  value={formData.actual_balance}
                  onChange={(e) => setFormData({ ...formData, actual_balance: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, fontSize: '0.875rem' }}>Процент накопления</label>
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
                  value={formData.savings_percentage}
                  onChange={(e) => setFormData({ ...formData, savings_percentage: e.target.value })}
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

      {/* Category Modal */}
      {showCategoryModal && (
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
              <h3 className="card-title">Категории счетов</h3>
              <button 
                onClick={() => setShowCategoryModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCategorySubmit} style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <input
                  type="text"
                  placeholder="Новая категория"
                  style={{
                    flex: 1,
                    padding: 'var(--space-4)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9375rem'
                  }}
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ name: e.target.value })}
                  required
                />
                <button type="submit" className="btn btn-primary">
                  Добавить
                </button>
              </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {categories.map((category) => (
                <div key={category.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-4)',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)'
                }}>
                  <span style={{ fontWeight: 600 }}>{category.name}</span>
                  <button style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--danger)',
                    cursor: 'pointer',
                    padding: 'var(--space-2)'
                  }}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
