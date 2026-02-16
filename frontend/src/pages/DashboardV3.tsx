import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import ParticlesBackground from '../components/ParticlesBackground';
import GlassCard from '../components/GlassCard';
import StatCard from '../components/StatCard';
import CircularProgress from '../components/CircularProgress';
import Timeline, { TimelineDay, TimelineItem } from '../components/Timeline';
import HeatmapCalendar from '../components/HeatmapCalendar';
import Button from '../components/Button';
import SuccessModal from '../components/SuccessModal';
import PullToRefresh from '../components/PullToRefresh';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  PieChart,
} from 'lucide-react';

export default function DashboardV3() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const loadData = async () => {
    try {
      const [statsRes, transactionsRes, budgetsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getTransactions({ limit: 10 }),
        api.getBudgets(),
      ]);

      setStats(statsRes);
      setTransactions(transactionsRes);
      setBudgets(budgetsRes);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useRealtimeSync({
    onTransactionCreated: () => {
      loadData();
      setShowSuccess(true);
    },
    onTransactionUpdated: loadData,
    onTransactionDeleted: loadData,
  });

  const handleRefresh = async () => {
    await loadData();
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: theme.colors.backgroundGradient }}
      >
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent"
          style={{ borderColor: theme.colors.primary }}
        />
      </div>
    );
  }

  const totalBalance = stats?.total_balance || 0;
  const monthIncome = stats?.month_income || 0;
  const monthExpense = stats?.month_expense || 0;
  const balanceChange = monthIncome - monthExpense;
  const balanceChangePercent = stats?.balance_change_percent || 0;

  // Группировка транзакций по датам
  const groupedTransactions = transactions.reduce((acc: any, transaction: any) => {
    const date = new Date(transaction.transaction_date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {});

  // Данные для heatmap
  const heatmapData = transactions.map(t => ({
    date: t.transaction_date,
    amount: Math.abs(t.amount),
  }));

  return (
    <div 
      className="min-h-screen pb-24"
      style={{ background: theme.colors.backgroundGradient }}
    >
      <ParticlesBackground />

      <PullToRefresh onRefresh={handleRefresh}>
        <div className="relative z-10 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 
                className="text-3xl font-bold mb-1"
                style={{ color: theme.colors.text }}
              >
                Привет! 👋
              </h1>
              <p style={{ color: theme.colors.textSecondary }}>
                {new Date().toLocaleDateString('ru-RU', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </p>
            </div>
            
            <Button
              variant="icon"
              icon={<Plus size={24} />}
              onClick={() => navigate('/expenses')}
            />
          </div>

          {/* Balance Card */}
          <GlassCard className="p-8 text-center">
            <p 
              className="text-sm mb-2"
              style={{ color: theme.colors.textSecondary }}
            >
              Общий баланс
            </p>
            <h2 
              className="text-5xl font-bold mb-4 gradient-text"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {totalBalance.toLocaleString('ru-RU')} ₽
            </h2>
            
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                background: balanceChange >= 0 
                  ? `${theme.colors.success}20` 
                  : `${theme.colors.error}20`,
                color: balanceChange >= 0 ? theme.colors.success : theme.colors.error,
              }}
            >
              {balanceChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {balanceChange >= 0 ? '+' : ''}{balanceChange.toLocaleString('ru-RU')} ₽ за месяц
            </div>
          </GlassCard>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Доходы"
              value={`${monthIncome.toLocaleString('ru-RU')} ₽`}
              icon={<ArrowUpRight />}
              gradient
              onClick={() => navigate('/income')}
            />
            
            <StatCard
              title="Расходы"
              value={`${monthExpense.toLocaleString('ru-RU')} ₽`}
              icon={<ArrowDownRight />}
              gradient
              onClick={() => navigate('/expenses')}
            />
          </div>

          {/* Budget Progress */}
          {budgets.length > 0 && (
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 
                  className="text-lg font-bold"
                  style={{ color: theme.colors.text }}
                >
                  Бюджеты
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/analytics')}
                >
                  Все
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {budgets.slice(0, 4).map((budget: any) => (
                  <div key={budget.id} className="flex flex-col items-center">
                    <CircularProgress
                      value={budget.spent || 0}
                      max={budget.amount}
                      size={100}
                      label={budget.category_name}
                      animated
                      gradient
                    />
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Heatmap */}
          <HeatmapCalendar
            data={heatmapData}
            title="Активность расходов"
            type="expense"
          />

          {/* Recent Transactions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 
                className="text-xl font-bold"
                style={{ color: theme.colors.text }}
              >
                Последние операции
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/transactions')}
              >
                Все
              </Button>
            </div>

            <Timeline>
              {Object.entries(groupedTransactions).map(([date, dayTransactions]: [string, any]) => (
                <TimelineDay key={date} date={date}>
                  {dayTransactions.map((transaction: any) => (
                    <TimelineItem
                      key={transaction.id}
                      icon={transaction.category_icon || '💰'}
                      title={transaction.description}
                      amount={`${Math.abs(transaction.amount).toLocaleString('ru-RU')} ₽`}
                      time={new Date(transaction.created_at).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      category={transaction.category_name}
                      type={transaction.amount > 0 ? 'income' : 'expense'}
                      onClick={() => navigate(`/transactions/${transaction.id}`)}
                    />
                  ))}
                </TimelineDay>
              ))}
            </Timeline>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4">
            <GlassCard 
              className="p-4 text-center"
              hover
              onClick={() => navigate('/analytics')}
            >
              <PieChart 
                size={32} 
                className="mx-auto mb-2"
                style={{ color: theme.colors.primary }}
              />
              <p 
                className="text-xs font-medium"
                style={{ color: theme.colors.text }}
              >
                Аналитика
              </p>
            </GlassCard>

            <GlassCard 
              className="p-4 text-center"
              hover
              onClick={() => navigate('/accounts')}
            >
              <Wallet 
                size={32} 
                className="mx-auto mb-2"
                style={{ color: theme.colors.primary }}
              />
              <p 
                className="text-xs font-medium"
                style={{ color: theme.colors.text }}
              >
                Счета
              </p>
            </GlassCard>

            <GlassCard 
              className="p-4 text-center"
              hover
              onClick={() => navigate('/settings')}
            >
              <Target 
                size={32} 
                className="mx-auto mb-2"
                style={{ color: theme.colors.primary }}
              />
              <p 
                className="text-xs font-medium"
                style={{ color: theme.colors.text }}
              >
                Цели
              </p>
            </GlassCard>
          </div>
        </div>
      </PullToRefresh>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        type="success"
        title="Транзакция добавлена!"
        message="Данные обновлены в реальном времени"
        showConfetti
      />
    </div>
  );
}
