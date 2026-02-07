import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { toast } from '../utils/toast';

export function TransactionForm({ onSuccess, onBack }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    title: '',
    category_id: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [formData.type]);

  async function loadCategories() {
    try {
      // Mock categories - заменить на реальный API вызов
      const mockCategories = [
        { id: 1, name: 'Еда', type: 'expense' },
        { id: 2, name: 'Транспорт', type: 'expense' },
        { id: 3, name: 'Развлечения', type: 'expense' },
        { id: 4, name: 'Работа', type: 'income' },
        { id: 5, name: 'Подработка', type: 'income' }
      ];
      
      const filtered = mockCategories.filter(cat => cat.type === formData.type);
      setCategories(filtered);
    } catch (error) {
      console.error('Load categories error:', error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock save - заменить на реальный API вызов
      console.log('Saving transaction:', formData);
      
      // Симуляция задержки API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Операция добавлена');
      setFormData({
        type: 'expense',
        amount: '',
        title: '',
        category_id: '',
        transaction_date: new Date().toISOString().split('T')[0]
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-container">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h2>Новая операция</h2>
        <div></div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Тип операции</label>
            <div className="radio-group">
              <div className="radio-option">
                <input
                  type="radio"
                  id="expense"
                  name="type"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                />
                <label htmlFor="expense">Расход</label>
              </div>
              <div className="radio-option">
                <input
                  type="radio"
                  id="income"
                  name="type"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                />
                <label htmlFor="income">Доход</label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="amount" className="form-label">Сумма (₽)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              className="form-input"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="title" className="form-label">Название</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Например: Продукты"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category_id" className="form-label">Категория</label>
            <select
              id="category_id"
              name="category_id"
              className="form-select"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            >
              <option value="">Без категории</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="transaction_date" className="form-label">Дата</label>
            <input
              type="date"
              id="transaction_date"
              name="transaction_date"
              className="form-input"
              value={formData.transaction_date}
              onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  );
}
