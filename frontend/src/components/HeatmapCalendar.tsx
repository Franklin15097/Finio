import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import GlassCard from './GlassCard';

interface HeatmapData {
  date: string;
  amount: number;
}

interface HeatmapCalendarProps {
  data: HeatmapData[];
  title?: string;
  type?: 'expense' | 'income';
}

export default function HeatmapCalendar({ data, title = 'Активность', type = 'expense' }: HeatmapCalendarProps) {
  const { theme } = useTheme();

  const { weeks, maxAmount, minAmount } = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 90); // 3 месяца назад

    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      currentWeek.push(new Date(d));
      
      if (d.getDay() === 6 || d.getTime() === today.getTime()) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    }

    const amounts = data.map(d => d.amount);
    const maxAmount = Math.max(...amounts, 1);
    const minAmount = Math.min(...amounts, 0);

    return { weeks, maxAmount, minAmount };
  }, [data]);

  const getIntensity = (date: Date): number => {
    const dateStr = date.toISOString().split('T')[0];
    const dayData = data.find(d => d.date === dateStr);
    
    if (!dayData || dayData.amount === 0) return 0;
    
    return (dayData.amount / maxAmount) * 100;
  };

  const getColor = (intensity: number): string => {
    if (intensity === 0) return `${theme.colors.surfaceGlass}`;
    
    const baseColor = type === 'expense' ? theme.colors.expense : theme.colors.income;
    const opacity = Math.max(0.2, intensity / 100);
    
    return `${baseColor}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
  };

  const getDayName = (dayIndex: number): string => {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    return days[dayIndex];
  };

  const getMonthName = (date: Date): string => {
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    return months[date.getMonth()];
  };

  return (
    <GlassCard className="p-6">
      <h3 
        className="text-lg font-bold mb-4"
        style={{ color: theme.colors.text }}
      >
        {title}
      </h3>

      <div className="overflow-x-auto">
        <div className="inline-flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((date, dayIndex) => {
                const intensity = getIntensity(date);
                const dateStr = date.toISOString().split('T')[0];
                const dayData = data.find(d => d.date === dateStr);
                
                return (
                  <div
                    key={dayIndex}
                    className="group relative w-3 h-3 rounded-sm transition-all hover:scale-150 hover:z-10"
                    style={{
                      background: getColor(intensity),
                      border: `1px solid ${theme.colors.surfaceGlass}`,
                    }}
                    title={`${dateStr}: ${dayData?.amount || 0} ₽`}
                  >
                    {/* Tooltip */}
                    <div
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20"
                      style={{
                        background: theme.colors.surface,
                        border: `1px solid ${theme.colors.primary}`,
                        color: theme.colors.text,
                      }}
                    >
                      {date.getDate()} {getMonthName(date)}: {dayData?.amount || 0} ₽
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 text-xs" style={{ color: theme.colors.textSecondary }}>
        <span>Меньше</span>
        <div className="flex gap-1">
          {[0, 25, 50, 75, 100].map((intensity) => (
            <div
              key={intensity}
              className="w-3 h-3 rounded-sm"
              style={{ background: getColor(intensity) }}
            />
          ))}
        </div>
        <span>Больше</span>
      </div>
    </GlassCard>
  );
}
