import { useState } from 'react';
import { X } from 'lucide-react';
import { useFinance } from '@/lib/financeContext';
import { cn } from '@/lib/utils';
import { DynamicIcon } from './DynamicIcon';

interface AddTransactionModalProps {
  type: 'income' | 'expense';
  onClose: () => void;
}

export function AddTransactionModal({ type, onClose }: AddTransactionModalProps) {
  const { categories, addTransaction } = useFinance();
  const filtered = categories.filter(c => c.type === type);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(filtered[0]?.id || '');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const isIncome = type === 'income';

  const handleSubmit = () => {
    if (!amount || !categoryId) return;
    addTransaction({ type, amount: Number(amount), categoryId, description, date });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-t-3xl sm:rounded-3xl p-6 w-full sm:max-w-md space-y-5 shadow-2xl border border-border/60" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{isIncome ? 'Новый доход' : 'Новый расход'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary transition-colors">
            <X size={18} />
          </button>
        </div>

        <div>
          <label className="text-xs text-muted-foreground font-semibold mb-1.5 block">Сумма (₽)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            className="w-full px-4 py-3.5 rounded-xl bg-secondary text-2xl font-extrabold outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground font-semibold mb-1.5 block">Категория</label>
          <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
            {filtered.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-xl text-xs font-semibold transition-all',
                  categoryId === cat.id
                    ? (isIncome ? 'bg-income text-income-foreground' : 'bg-expense text-expense-foreground')
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                )}
              >
                <DynamicIcon name={cat.icon} size={16} />
                <span className="truncate">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground font-semibold mb-1.5 block">Описание</label>
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Комментарий" className="w-full px-4 py-3 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground" />
        </div>

        <div>
          <label className="text-xs text-muted-foreground font-semibold mb-1.5 block">Дата</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <button
          onClick={handleSubmit}
          className={cn(
            'w-full py-3.5 rounded-xl text-primary-foreground font-bold hover:shadow-lg transition-all',
            isIncome ? 'gradient-income hover:shadow-income/25' : 'gradient-expense hover:shadow-expense/25'
          )}
        >
          {isIncome ? 'Добавить доход' : 'Добавить расход'}
        </button>
      </div>
    </div>
  );
}
