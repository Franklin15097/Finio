import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { toast } from '../utils/toast';

export function TransactionForm({ onSuccess }) {
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
      const data = await api.get(`/categories?type=${formData.type}`);
      setCategories(data);
    } catch (error) {
      console.error('Load categories error:', error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/transactions', formData);
      toast.success('Транзакция создана');
      setFormData({
        type: 'expense',
        amount: '',
        title: '',
        category_id: '',
        transaction_date: new Date().toISOString().split('T')[0]
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Ошибка создания транзакции');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <div className="form-group">
        <label>Тип</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              value="expense"
              checked={formData.type === 'expense'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            />
            Расход
          </label>
          <label>
            <input
              type="radio"
              value="income"
              checked={formData.type === 'income'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            />
            Доход
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>Сумма</label>
        <input
          type="number"
          step="0.01"
          required
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder="0.00"
        />
      </div>

      <div className="form-group">
        <label>Название</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Например: Продукты"
        />
      </div>

      <div className="form-group">
        <label>Категория</label>
        <select
          value={formData.category_id}
          onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
        >
          <option value="">Без категории</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Дата</label>
        <input
          type="date"
          required
          value={formData.transaction_date}
          onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
        />
      </div>

      <button type="submit" className="main-button" disabled={loading}>
        {loading ? 'Сохранение...' : 'Сохранить'}
      </button>
    </form>
  );
}
