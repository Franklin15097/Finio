import { DynamicIcon } from './DynamicIcon';
import { Transaction, Category } from '@/lib/types';
import { formatMoney } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { Calendar, Trash2 } from 'lucide-react';

interface TransactionItemProps {
  transaction: Transaction;
  category: Category | undefined;
  onDelete?: (id: string) => void;
}

export function TransactionItem({ transaction, category, onDelete }: TransactionItemProps) {
  const isIncome = transaction.type === 'income';
  const date = new Date(transaction.date);
  const formattedDate = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

  return (
    <div className="glass-card rounded-xl p-3 flex items-center gap-3 group hover:scale-[1.01] transition-all duration-200">
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
        isIncome ? 'gradient-income' : 'gradient-expense'
      )}>
        <DynamicIcon name={category?.icon || 'CircleDot'} size={18} className="text-primary-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{category?.name || 'Без категории'}</p>
        <p className="text-xs text-muted-foreground truncate">{transaction.description}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={cn('text-sm font-bold', isIncome ? 'text-income' : 'text-expense')}>
          {isIncome ? '+' : '−'}{formatMoney(transaction.amount)}
        </p>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground justify-end">
          <Calendar size={10} />
          {formattedDate}
        </div>
      </div>
      {onDelete && (
        <button
          onClick={() => onDelete(transaction.id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-all"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
