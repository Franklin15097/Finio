import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  BarChart3, 
  Download, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function TelegramAnalytics() {
  const [loading, setLoading] = useState(true);
  const [topExpenses, setTopExpenses] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [comparison, setComparison] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const now = new Date();
      const startDate = new Date(now);
      
      if (selectedPeriod === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (selectedPeriod === 'month') {
        startDate.setDate(now.getDate() - 30);
      } else {
        startDate.setDate(now.getDate() - 365);
      }
      
      const params = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0]
      };

      const [expensesData, forecastData, trendsData] = await Promise.all([
        api.getTopExpenses({ ...params, limit: 5 }),
        api.getForecast(30),
        api.getTrends(selectedPeriod === 'week' ? 'day' : selectedPeriod === 'month' ? 'week' : 'month')
      ]);

      setTopExpenses(expensesData);
      setForecast(forecastData);
      setTrends(trendsData);

      // Сравнение с предыдущим периодом
      const prevStartDate = new Date(startDate);
      const prevEndDate = new Date(startDate);
      prevEndDate.setDate(prevEndDate.getDate() - 1);
      
      if (selectedPeriod === 'week') {
        prevStartDate.setDate(prevStartDate.getDate() - 7);
      } else if (selectedPeriod === 'month') {
        prevStartDate.setDate(prevStartDate.getDate() - 30);
      } else {
        prevStartDate.setDate(prevStartDate.getDate() - 365);
      }

      const comparisonData = await api.comparePeriods(
        params.startDate,
        params.endDate,
        prevStartDate.toISOString().split('T')[0],
        prevEndDate.toISOString().split('T')[0]
      );

      setComparison(comparisonData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - 90); // Последние 3 месяца
      
      await api.exportCSV({
        startDate: startDate.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Failed to export:', error);
      alert('Ошибка при экспорте данных');
    }
  };

  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const currentPeriod = comparison?.[0];
  const previousPeriod = comparison?.[1];
  
  const incomeChange = currentPeriod && previousPeriod 
    ? ((parseFloat(currentPeriod.total_income) - parseFloat(previousPeriod.total_income)) / parseFloat(previousPeriod.total_income || 1)) * 100
    : 0;
    
  const expenseChange = currentPeriod && previousPeriod
    ? ((parseFloat(currentPeriod.total_expense) - parseFloat(previousPeriod.total_expense)) / parseFloat(previousPeriod.total_expense || 1)) * 100
    : 0;

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold text-white">Аналитика</h1>
          <p className="text-white/60 text-sm">Детальный анализ финансов</p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-fuchsia-600 rounded-xl text-white font-semibold text-sm flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Экспорт
        </button>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {(['week', 'month', 'year'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedPeriod === period
                ? 'bg-purple-500 text-white'
                : 'glass-card text-gray-300'
            }`}
          >
            {period === 'week' && '7 дней'}
            {period === 'month' && '30 дней'}
            {period === 'year' && 'Год'}
          </button>
        ))}
      </div>

      {/* Comparison Cards */}
      {comparison && (
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-2xl p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-white/60 text-xs mb-1">Доходы</p>
            <p className="text-xl font-bold text-white mb-1">
              {parseFloat(currentPeriod?.total_income || 0).toFixed(0)} ₽
            </p>
            <div className={`flex items-center gap-1 text-xs ${incomeChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {incomeChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(incomeChange).toFixed(1)}% к пред. периоду
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-white/60 text-xs mb-1">Расходы</p>
            <p className="text-xl font-bold text-white mb-1">
              {parseFloat(currentPeriod?.total_expense || 0).toFixed(0)} ₽
            </p>
            <div className={`flex items-center gap-1 text-xs ${expenseChange <= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {expenseChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(expenseChange).toFixed(1)}% к пред. периоду
            </div>
          </div>
        </div>
      )}

      {/* Forecast */}
      {forecast && (
        <div className="glass-card rounded-2xl p-4 border border-border/30">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-sm font-bold text-white">Прогноз на 30 дней</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Текущий баланс</span>
              <span className="text-lg font-bold text-white">
                {forecast.current_balance.toFixed(0)} ₽
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Средн. изменение/день</span>
              <span className={`text-sm font-semibold ${forecast.avg_daily_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {forecast.avg_daily_change >= 0 ? '+' : ''}{forecast.avg_daily_change.toFixed(0)} ₽
              </span>
            </div>
            <div className="border-t border-white/10 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Прогноз через 30 дней</span>
                <span className={`text-xl font-bold ${forecast.forecast[29].predicted_balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {forecast.forecast[29].predicted_balance.toFixed(0)} ₽
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Уверенность: {forecast.forecast[29].confidence.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Expenses Pie Chart */}
      {topExpenses.length > 0 && (
        <div className="glass-card rounded-2xl p-4 border border-border/30">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="w-5 h-5 text-purple-400" />
            <h2 className="text-sm font-bold text-white">Топ категорий расходов</h2>
          </div>
          
          <ResponsiveContainer width="100%" height={200}>
            <RechartsPie>
              <Pie
                data={topExpenses}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="total_amount"
                nameKey="name"
              >
                {topExpenses.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => `${parseFloat(value).toFixed(0)} ₽`}
              />
            </RechartsPie>
          </ResponsiveContainer>

          <div className="space-y-2 mt-4">
            {topExpenses.map((expense, index) => (
              <div key={expense.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs text-white">{expense.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-white">
                    {parseFloat(expense.total_amount).toFixed(0)} ₽
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {parseFloat(expense.percentage).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trends Chart */}
      {trends.length > 0 && (
        <div className="glass-card rounded-2xl p-4 border border-border/30">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h2 className="text-sm font-bold text-white">Динамика</h2>
          </div>
          
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="period" 
                stroke="#94a3b8" 
                style={{ fontSize: '10px' }}
              />
              <YAxis 
                stroke="#94a3b8" 
                style={{ fontSize: '10px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: any) => `${parseFloat(value).toFixed(0)} ₽`}
              />
              <Bar dataKey="income" fill="#10b981" name="Доходы" />
              <Bar dataKey="expense" fill="#ef4444" name="Расходы" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Insights */}
      <div className="glass-card rounded-2xl p-4 border border-border/30">
        <h2 className="text-sm font-bold text-white mb-3">💡 Рекомендации</h2>
        <div className="space-y-2">
          {forecast?.avg_daily_change < 0 && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-xs text-red-400">
                Ваши расходы превышают доходы. Рекомендуем пересмотреть бюджет.
              </p>
            </div>
          )}
          
          {topExpenses[0] && parseFloat(topExpenses[0].percentage) > 40 && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <p className="text-xs text-yellow-400">
                Категория "{topExpenses[0].name}" занимает {parseFloat(topExpenses[0].percentage).toFixed(0)}% расходов. 
                Возможно, стоит оптимизировать траты в этой области.
              </p>
            </div>
          )}
          
          {forecast?.avg_daily_change > 0 && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
              <p className="text-xs text-green-400">
                Отличная работа! Ваш баланс растёт в среднем на {forecast.avg_daily_change.toFixed(0)} ₽ в день.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
