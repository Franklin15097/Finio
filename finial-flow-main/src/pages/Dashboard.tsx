import { useMemo, useState } from 'react';
import { 
  ArrowUpRight, ArrowDownRight, Landmark, TrendingUp, 
  ArrowRight, Sparkles
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { useFinance } from '@/lib/financeContext';
import { formatMoney, getCategoryById, balanceHistory } from '@/lib/mockData';
import { DynamicIcon } from '@/components/DynamicIcon';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const periods = [
  { key: '7d', label: '7 дней' },
  { key: '30d', label: 'Месяц' },
  { key: 'year', label: 'Год' },
  { key: 'all', label: 'Всё' },
];

const PIE_COLORS = [
  'hsl(258, 90%, 62%)',
  'hsl(350, 89%, 60%)',
  'hsl(210, 100%, 56%)',
  'hsl(36, 100%, 57%)',
  'hsl(280, 70%, 55%)',
  'hsl(160, 84%, 39%)',
  'hsl(190, 80%, 45%)',
  'hsl(20, 90%, 55%)',
];

export default function Dashboard() {
  const { transactions, accounts, categories } = useFinance();
  const [period, setPeriod] = useState('30d');

  const totalIncome = useMemo(() => transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [transactions]);
  const balance = totalIncome - totalExpense;
  const totalAccounts = accounts.reduce((s, a) => s + a.actualBalance, 0);
  const recent = useMemo(() => [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6), [transactions]);

  const chartData = useMemo(() => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === 'year' ? 365 : balanceHistory.length;
    return balanceHistory.slice(-days).map(d => ({
      ...d,
      label: new Date(d.day).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
    }));
  }, [period]);

  // Expense by category for donut
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
    });
    return Object.entries(map)
      .map(([catId, amount]) => ({
        name: getCategoryById(catId)?.name || 'Другое',
        icon: getCategoryById(catId)?.icon || 'CircleDot',
        value: amount,
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Привет, Александр <span className="inline-block animate-bounce">👋</span>
        </h1>
        <p className="text-muted-foreground mt-1">Вот как обстоят ваши финансы</p>
      </div>

      {/* Hero Balance Card */}
      <div className="gradient-primary rounded-3xl p-6 md:p-8 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/4" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="opacity-70" />
            <span className="text-sm font-medium opacity-80">Общий баланс</span>
          </div>
          <p className="text-4xl md:text-5xl font-extrabold tracking-tight">{formatMoney(balance)}</p>
          <div className="flex gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <ArrowUpRight size={16} />
              </div>
              <div>
                <p className="text-[11px] opacity-70">Доходы</p>
                <p className="text-sm font-bold">{formatMoney(totalIncome)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <ArrowDownRight size={16} />
              </div>
              <div>
                <p className="text-[11px] opacity-70">Расходы</p>
                <p className="text-sm font-bold">{formatMoney(totalExpense)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Landmark size={16} />
              </div>
              <div>
                <p className="text-[11px] opacity-70">Счета</p>
                <p className="text-sm font-bold">{formatMoney(totalAccounts)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Area Chart */}
        <div className="lg:col-span-3 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              <h2 className="font-bold text-sm">Динамика</h2>
            </div>
            <div className="flex gap-1 bg-secondary rounded-xl p-1">
              {periods.map(p => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all',
                    period === p.key 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(258, 90%, 62%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(258, 90%, 62%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 10, fill: 'hsl(220, 10%, 50%)' }} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'hsl(220, 10%, 50%)' }} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={v => `${(v / 1000).toFixed(0)}к`} 
                width={40}
              />
              <Tooltip
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))', 
                  borderRadius: '12px', 
                  fontSize: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                }}
                formatter={(value: number) => [formatMoney(value), 'Баланс']}
              />
              <Area 
                type="monotone" 
                dataKey="balance" 
                stroke="hsl(258, 90%, 62%)" 
                strokeWidth={2.5} 
                fill="url(#balanceGrad)" 
                dot={false} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5">
          <h2 className="font-bold text-sm mb-4">Расходы по категориям</h2>
          <div className="flex items-center justify-center">
            <PieChart width={180} height={180}>
              <Pie
                data={expenseByCategory}
                cx={90}
                cy={90}
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {expenseByCategory.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </div>
          <div className="space-y-2 mt-3 max-h-[140px] overflow-y-auto">
            {expenseByCategory.map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-2.5 text-sm">
                <div 
                  className="w-3 h-3 rounded-full shrink-0" 
                  style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} 
                />
                <span className="flex-1 text-muted-foreground text-xs truncate">{cat.name}</span>
                <span className="font-semibold text-xs">{formatMoney(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accounts strip */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Счета</h2>
          <Link to="/accounts" className="text-xs text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            Все <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {accounts.map(acc => {
            const percent = acc.plannedBalance > 0 
              ? Math.min((acc.actualBalance / acc.plannedBalance) * 100, 100) 
              : 0;
            return (
              <div key={acc.id} className="glass-card rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-primary/20">
                    <DynamicIcon name={acc.icon} size={20} className="text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{acc.name}</p>
                    <p className="text-[11px] text-muted-foreground">{acc.percentage}% от дохода</p>
                  </div>
                </div>
                <p className="text-2xl font-extrabold">{formatMoney(acc.actualBalance)}</p>
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
                    <span>Прогресс</span>
                    <span>{percent.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div 
                      className="h-full rounded-full gradient-primary transition-all duration-700" 
                      style={{ width: `${percent}%` }} 
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Последние операции</h2>
          <Link to="/income" className="text-xs text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            Все <ArrowRight size={14} />
          </Link>
        </div>
        <div className="glass-card rounded-2xl divide-y divide-border/60">
          {recent.map(tx => {
            const cat = getCategoryById(tx.categoryId);
            const isIncome = tx.type === 'income';
            return (
              <div key={tx.id} className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors first:rounded-t-2xl last:rounded-b-2xl">
                <div className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
                  isIncome ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'
                )}>
                  <DynamicIcon name={cat?.icon || 'CircleDot'} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{cat?.name || 'Другое'}</p>
                  <p className="text-xs text-muted-foreground truncate">{tx.description}</p>
                </div>
                <div className="text-right">
                  <p className={cn('text-sm font-bold', isIncome ? 'text-income' : 'text-expense')}>
                    {isIncome ? '+' : '−'}{formatMoney(tx.amount)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(tx.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
