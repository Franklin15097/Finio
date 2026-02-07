import { useState, useEffect } from 'react';

export function TransactionModal({ transaction, categories, onSave, onClose }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    title: '',
    category_id: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: Math.abs(transaction.amount).toString(),
        title: transaction.title,
        category_id: transaction.category_id || '',
        transaction_date: transaction.transaction_date
      });
    }
  }, [transaction]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      id: transaction?.id
    };

    onSave(transactionData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content card animate-scale-in">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{transaction ? 'Редактировать транзакцию' : 'Новая транзакция'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Тип</label>
            <div className="flex gap-4">
              <label>
                <input 
                  type="radio" 
                  name="type" 
                  value="expense" 
                  checked={formData.type === 'expense'}
                  onChange={handleChange}
                /> Расход
              </label>
              <label>
                <input 
                  type="radio" 
                  name="type" 
                  value="income" 
                  checked={formData.type === 'income'}
                  onChange={handleChange}
                /> Доход
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="amount" className="form-label">Сумма</label>
            <input 
              type="number" 
              id="amount" 
              name="amount" 
              className="form-input" 
              step="0.01" 
              required
              value={formData.amount}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="title" className="form-label">Название</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              className="form-input" 
              required
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category_id" className="form-label">Категория</label>
            <select 
              id="category_id" 
              name="category_id" 
              className="form-input"
              value={formData.category_id}
              onChange={handleChange}
            >
              <option value="">Без категории</option>
              {filteredCategories.map(category => (
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
              required
              value={formData.transaction_date}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Сохранить
          </button>
        </form>
      </div>
    </div>
  );
}