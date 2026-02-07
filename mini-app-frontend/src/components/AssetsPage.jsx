import { useState, useEffect } from 'react';

export function AssetsPage({ onBack }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      // Mock data - заменить на реальный API вызов
      const mockAssets = [
        {
          id: 1,
          name: 'Основная карта',
          balance: 125000,
          type: 'card'
        },
        {
          id: 2,
          name: 'Накопления',
          balance: 50000,
          type: 'deposit'
        },
        {
          id: 3,
          name: 'Наличные',
          balance: 8500,
          type: 'cash'
        }
      ];

      setAssets(mockAssets);
    } catch (error) {
      console.error('Error loading assets:', error);
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
    }).format(amount);
  };

  const getAssetIcon = (type) => {
    switch (type) {
      case 'card': return '💳';
      case 'cash': return '💵';
      case 'deposit': return '🏦';
      case 'investment': return '📈';
      default: return '💰';
    }
  };

  const getAssetTypeName = (type) => {
    switch (type) {
      case 'card': return 'Карта';
      case 'cash': return 'Наличные';
      case 'deposit': return 'Вклад';
      case 'investment': return 'Инвестиции';
      default: return 'Счет';
    }
  };

  const totalBalance = assets.reduce((sum, asset) => sum + asset.balance, 0);

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <button className="back-btn" onClick={onBack}>←</button>
          <h2>Счета</h2>
        </div>
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h2>Счета</h2>
        <button className="add-btn" onClick={() => setShowAddModal(true)}>+</button>
      </div>

      <div className="total-balance-card">
        <div className="total-label">Общий баланс</div>
        <div className="total-amount">{formatCurrency(totalBalance)}</div>
      </div>

      <div className="assets-list">
        {assets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <p>Нет счетов</p>
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              Добавить счет
            </button>
          </div>
        ) : (
          assets.map(asset => (
            <div key={asset.id} className="asset-item">
              <div className="asset-icon">{getAssetIcon(asset.type)}</div>
              <div className="asset-info">
                <div className="asset-name">{asset.name}</div>
                <div className="asset-type">{getAssetTypeName(asset.type)}</div>
              </div>
              <div className="asset-balance">{formatCurrency(asset.balance)}</div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Новый счет</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form className="modal-form">
              <div className="form-group">
                <label>Название</label>
                <input type="text" placeholder="Например: Основная карта" />
              </div>
              <div className="form-group">
                <label>Баланс</label>
                <input type="number" placeholder="0" />
              </div>
              <div className="form-group">
                <label>Тип</label>
                <select>
                  <option value="card">Карта</option>
                  <option value="cash">Наличные</option>
                  <option value="deposit">Вклад</option>
                  <option value="investment">Инвестиции</option>
                </select>
              </div>
              <button type="submit" className="btn-primary">Сохранить</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}