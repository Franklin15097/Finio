import { useState } from 'react';
import { User, Percent, LogOut, Save, Shield } from 'lucide-react';
import { useFinance } from '@/lib/financeContext';
import { userProfile } from '@/lib/mockData';
import { DynamicIcon } from '@/components/DynamicIcon';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

export default function Settings() {
  const { accounts, updateAccount } = useFinance();
  const { theme } = useTheme();
  const [tab, setTab] = useState<'distribution' | 'profile'>('distribution');
  const [percentages, setPercentages] = useState<Record<string, number>>(
    Object.fromEntries(accounts.map(a => [a.id, a.percentage]))
  );
  const [profile, setProfile] = useState({ name: userProfile.name, email: userProfile.email, password: '' });

  const totalPercent = Object.values(percentages).reduce((s, v) => s + v, 0);

  const saveDistribution = () => {
    accounts.forEach(acc => {
      updateAccount({ ...acc, percentage: percentages[acc.id] || 0 });
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Настройки</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Управление профилем и распределением</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-2xl p-1.5">
        <button
          onClick={() => setTab('distribution')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all',
            tab === 'distribution' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Percent size={16} /> Распределение
        </button>
        <button
          onClick={() => setTab('profile')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all',
            tab === 'profile' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <User size={16} /> Профиль
        </button>
      </div>

      {tab === 'distribution' && (
        <div className="space-y-4">
          {/* Total indicator */}
          <div className={cn(
            'glass-card rounded-2xl p-5 flex items-center justify-between',
            totalPercent === 100 ? 'border-income/30' : 'border-expense/30'
          )}>
            <div>
              <p className="text-sm font-semibold">Общее распределение</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalPercent === 100 ? 'Идеально! Все 100% распределены' : `Осталось ${100 - totalPercent}% для распределения`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn('text-2xl font-extrabold', totalPercent === 100 ? 'text-income' : 'text-expense')}>
                {totalPercent}%
              </span>
              <button onClick={saveDistribution} className="gradient-primary text-primary-foreground px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-primary/25 transition-all">
                <Save size={14} /> Сохранить
              </button>
            </div>
          </div>

          {/* Account distribution */}
          <div className="glass-card rounded-2xl divide-y divide-border/60">
            {accounts.map(acc => (
              <div key={acc.id} className="flex items-center gap-4 p-5">
                <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
                  <DynamicIcon name={acc.icon} size={18} className="text-primary-foreground" />
                </div>
                <span className="text-sm font-semibold flex-1">{acc.name}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={percentages[acc.id] || 0}
                    onChange={e => setPercentages(p => ({ ...p, [acc.id]: +e.target.value }))}
                    className="w-20 px-3 py-2.5 rounded-xl bg-secondary text-sm text-center font-semibold outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-muted-foreground font-medium">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'profile' && (
        <div className="space-y-4">
          {/* Profile card */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-extrabold shadow-lg shadow-primary/25">
                {profile.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-lg">{profile.name}</h3>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                {userProfile.telegramId && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Shield size={12} className="text-info" />
                    <span className="text-xs text-info font-medium">{userProfile.telegramId}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-semibold mb-1.5 block">Имя</label>
                <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-semibold mb-1.5 block">Email</label>
                <input value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-semibold mb-1.5 block">Новый пароль</label>
                <input type="password" value={profile.password} onChange={e => setProfile(p => ({ ...p, password: e.target.value }))} placeholder="Оставьте пустым" className="w-full px-4 py-3 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground" />
              </div>
              <button className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold hover:shadow-lg hover:shadow-primary/25 transition-all">
                Сохранить изменения
              </button>
            </div>
          </div>

          {/* Logout */}
          <button className="w-full glass-card rounded-2xl p-5 flex items-center gap-3 text-destructive hover:bg-destructive/5 transition-colors group">
            <div className="w-11 h-11 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
              <LogOut size={20} />
            </div>
            <div className="text-left">
              <p className="font-semibold">Выйти из аккаунта</p>
              <p className="text-xs text-muted-foreground">Вы сможете войти снова</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
