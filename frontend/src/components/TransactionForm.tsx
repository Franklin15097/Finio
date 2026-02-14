import { useState, useEffect } from 'react';

interface Category {
  id: number;
  name: string;
}

interface Props {
  onTransactionAdded: () => void;
}

export default function TransactionForm({ onTransactionAdded }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          category_id: parseInt(formData.category_id),
          amount: parseFloat(formData.amount),
        }),
      });
      setFormData({
        category_id: '',
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
      });
      onTransactionAdded();
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      <h2>Add Transaction</h2>
      <select name="category_id" value={formData.category_id} onChange={handleChange} required>
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        name="amount"
        placeholder="Amount"
        value={formData.amount}
        onChange={handleChange}
        step="0.01"
        required
      />
      <input
        type="text"
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
      />
      <input
        type="date"
        name="transaction_date"
        value={formData.transaction_date}
        onChange={handleChange}
        required
      />
      <button type="submit">Add Transaction</button>
    </form>
  );
}
