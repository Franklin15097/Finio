import { useState } from 'react';
import { Landmark, Plus, Trash2, Pencil, ChevronRight } from 'lucide-react';
import { useFinance } from '@/lib/financeContext';
import { formatMoney } from '@/lib/mockData';
import { DynamicIcon, availableIcons } from '@/components/DynamicIcon';
import { cn } from '@/lib/utils';

export default function Accounts() {
  const { accounts, addAccount, deleteAccount, updateAccount } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', icon: 'Wallet', percentage: 0, actualBalance: 0 });

  const totalDistributed = accounts.reduce((s, a) => s + a.percentage, 0);
  const totalPlan = accounts.reduce((s, a) => s + a.plannedBalance, 0);
  const totalActual = accounts.reduce((s, a) => s + a.actualBalance, 0);

  const openAdd = () => {
    setEditId(null);
    setForm({ name: '', icon: 'Wallet', percentage: 0, actualBalance: 0 });
    setShowModal(true);
  };

  const openEdit = (id: string) => {
    const acc = accounts.find(a => a.id === id);
    if (!acc) return;
    setEditId(id);
    setForm({ name: acc.name, icon: acc.icon, percentage: acc.percentage, actualBalance: acc.actualBalance });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name) return;
    if (editId) {
      const acc = accounts.find(a => a.id === editId)!;
      updateAccount({ ...acc, ...form });
    } else {
      addAccount({ ...form, plannedBalance: 0 });
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Счета</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{accounts.length} активных счетов</p>
        </div>
        <button onClick={openAdd} className="gradient-primary text-primary-foreground h-11 px-5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-primary/25 transition-all">
          <Plus size={18} /> Добавить
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 text-center">
          <p className="text-xs text-muted-foreground font-medium mb-1">Распределено</p>
          <p className={cn('text-3xl font-extrabold', totalDistributed === 100 ? 'text-income' : 'text-expense')}>{totalDistributed}%</p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center">
          <p className="text-xs text-muted-foreground font-medium mb-1">По плану</p>
          <p className="text-3xl font-extrabold">{formatMoney(totalPlan)}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center">
          <p className="text-xs text-muted-foreground font-medium mb-1">Фактически</p>
          <p className="text-3xl font-extrabold">{formatMoney(totalActual)}</p>
        </div>
      </div>

      {/* Account cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map(acc => {
          const diff = acc.actualBalance - acc.plannedBalance;
          const progress = acc.plannedBalance > 0 ? Math.min((acc.actualBalance / acc.plannedBalance) * 100, 150) : 0;
          return (
            <div key={acc.id} className="glass-card rounded-2xl p-6 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-primary/20">
                    <DynamicIcon name={acc.icon} size={22} className="text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{acc.name}</h3>
                    <span className="text-xs text-muted-foreground">{acc.percentage}% от дохода</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(acc.id)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteAccount(acc.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">План</p>
                  <p className="text-lg font-bold">{formatMoney(acc.plannedBalance)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">Факт</p>
                  <p className="text-lg font-bold">{formatMoney(acc.actualBalance)}</p>
                </div>
              </div>

              <div className="h-2 rounded-full bg-secondary overflow-hidden mb-2">
                <div 
                  className={cn('h-full rounded-full transition-all duration-700', diff >= 0 ? 'gradient-income' : 'gradient-expense')} 
                  style={{ width: `${Math.min(progress, 100)}%` }} 
                />
              </div>
              <p className={cn('text-xs font-semibold', diff >= 0 ? 'text-income' : 'text-expense')}>
                {diff >= 0 ? '+' : ''}{formatMoney(diff)} от плана
              </p>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="glass-card rounded-3xl p-6 w-full max-w-md space-y-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold">{editId ? 'Редактировать счёт' : 'Новый счёт'}</h2>
            <div>
              <label className="text-xs text-muted-foreground font-semibold mb-1.5 block">Название</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-semibold mb-1.5 block">Иконка</label>
              <div className="grid grid-cols-7 gap-1.5 max-h-28 overflow-y-auto">
                {availableIcons.map(icon => (
                  <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))} className={cn('p-2.5 rounded-xl transition-all', form.icon === icon ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-secondary text-muted-foreground hover:text-foreground')}>
                    <DynamicIcon name={icon} size={18} />
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground font-semibold mb-1.5 block">Процент</label>
                <input type="number" min={0} max={100} value={form.percentage} onChange={e => setForm(f => ({ ...f, percentage: +e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-semibold mb-1.5 block">Баланс (₽)</label>
                <input type="number" value={form.actualBalance} onChange={e => setForm(f => ({ ...f, actualBalance: +e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <button onClick={handleSave} className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold hover:shadow-lg hover:shadow-primary/25 transition-all">
              {editId ? 'Сохранить' : 'Создать счёт'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
