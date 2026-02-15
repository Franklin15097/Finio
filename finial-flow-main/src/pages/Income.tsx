import { useState, useMemo } from 'react';
import { ArrowUpRight, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { useFinance } from '@/lib/financeContext';
import { formatMoney, getCategoryById } from '@/lib/mockData';
import { DynamicIcon } from '@/components/DynamicIcon';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { cn } from '@/lib/utils';

const periodFilters = [
  { key: 'all', label: 'Всё' },
  { key: '7d', label: '7д' },
  { key: '30d', label: '30д' },
  { key: 'year', label: 'Год' },
];

export default function Income() {
  const { transactions, categories, deleteTransaction } = useFinance();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  const incomeCategories = categories.filter(c => c.type === 'income');

  const filtered = useMemo(() => {
    let list = transactions.filter(t => t.type === 'income');
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t => {
        const cat = getCategoryById(t.categoryId);
        return t.description.toLowerCase().includes(q) || cat?.name.toLowerCase().includes(q);
      });
    }
    if (categoryFilter) list = list.filter(t => t.categoryId === categoryFilter);
    if (period !== 'all') {
      const now = new Date();
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 365;
      const cutoff = new Date(now.getTime() - days * 86400000);
      list = list.filter(t => new Date(t.date) >= cutoff);
    }
    list.sort((a, b) => {
      const cmp = sortBy === 'date' ? a.date.localeCompare(b.date) : a.amount - b.amount;
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return list;
  }, [transactions, search, categoryFilter, period, sortBy, sortDir]);

  const totalIncome = filtered.reduce((s, t) => s + t.amount, 0);

  // Category summary
  const catSummary = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(t => { map[t.categoryId] = (map[t.categoryId] || 0) + t.amount; });
    return Object.entries(map)
      .map(([id, amount]) => ({ cat: getCategoryById(id), amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filtered]);

  // Group by date
  const grouped = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    filtered.forEach(t => {
      const key = new Date(t.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
      (map[key] ||= []).push(t);
    });
    return Object.entries(map);
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Доходы</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{formatMoney(totalIncome)} за период</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)} 
          className="gradient-income text-primary-foreground h-11 px-5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-income/25 transition-all"
        >
          <Plus size={18} /> Добавить
        </button>
      </div>

      {/* Category summary chips */}
      {catSummary.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {catSummary.map(({ cat, amount }) => (
            <div key={cat?.id} className="glass-card rounded-2xl p-4 min-w-[150px] shrink-0 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-income/10 text-income flex items-center justify-center">
                  <DynamicIcon name={cat?.icon || 'CircleDot'} size={16} />
                </div>
                <span className="text-xs font-semibold text-muted-foreground truncate">{cat?.name}</span>
              </div>
              <p className="text-lg font-extrabold text-income">{formatMoney(amount)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск операций..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border-0 text-sm focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className={cn(
              'p-2.5 rounded-xl transition-colors',
              showFilters ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
        {showFilters && (
          <div className="flex flex-wrap gap-2">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-secondary text-sm outline-none cursor-pointer"
            >
              <option value="">Все категории</option>
              {incomeCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="flex gap-1 bg-secondary rounded-xl p-1">
              {periodFilters.map(p => (
                <button key={p.key} onClick={() => setPeriod(p.key)} className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  period === p.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                )}>
                  {p.label}
                </button>
              ))}
            </div>
            <button onClick={() => setSortBy(s => s === 'date' ? 'amount' : 'date')} className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              По {sortBy === 'date' ? 'дате' : 'сумме'}
            </button>
            <button onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')} className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              {sortDir === 'desc' ? '↓ Новые' : '↑ Старые'}
            </button>
          </div>
        )}
      </div>

      {/* Grouped transactions */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-muted-foreground text-sm">Нет операций за этот период</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([dateLabel, txs]) => (
            <div key={dateLabel}>
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">{dateLabel}</p>
              <div className="glass-card rounded-2xl divide-y divide-border/60">
                {txs.map(tx => {
                  const cat = getCategoryById(tx.categoryId);
                  return (
                    <div key={tx.id} className="flex items-center gap-4 p-4 group hover:bg-secondary/30 transition-colors first:rounded-t-2xl last:rounded-b-2xl">
                      <div className="w-11 h-11 rounded-xl bg-income/10 text-income flex items-center justify-center shrink-0">
                        <DynamicIcon name={cat?.icon || 'CircleDot'} size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{cat?.name || 'Другое'}</p>
                        <p className="text-xs text-muted-foreground truncate">{tx.description}</p>
                      </div>
                      <p className="text-sm font-bold text-income">+{formatMoney(tx.amount)}</p>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="opacity-0 group-hover:opacity-100 text-xs text-destructive hover:bg-destructive/10 px-2 py-1 rounded-lg transition-all"
                      >
                        Удалить
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && <AddTransactionModal type="income" onClose={() => setShowAdd(false)} />}
    </div>
  );
}
