import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Calendar, TrendingUp, TrendingDown, Clock, Zap } from 'lucide-react';

interface HeatmapData {
  day_of_week: number;
  hour_of_day: number;
  transaction_count: number;
  total_amount: number;
}

interface HeatmapChartProps {
  startDate?: string;
  endDate?: string;
  height?: number;
  width?: number;
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({
  startDate,
  endDate,
  height = 300,
  width = 600
}) => {
  const [data, setData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState<{ day: number; hour: number } | null>(null);
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalTransactions: 0,
    peakHour: { hour: 0, amount: 0 },
    peakDay: { day: 0, amount: 0 }
  });

  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  useEffect(() => {
    loadHeatmapData();
  }, [startDate, endDate]);

  const loadHeatmapData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const heatmapData = await api.getHeatmapData(params);
      setData(heatmapData);
      calculateStats(heatmapData);
    } catch (error) {
      console.error('Failed to load heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (heatmapData: HeatmapData[]) => {
    let totalAmount = 0;
    let totalTransactions = 0;
    const hourTotals = new Array(24).fill(0);
    const dayTotals = new Array(7).fill(0);

    heatmapData.forEach(item => {
      totalAmount += item.total_amount;
      totalTransactions += item.transaction_count;
      
      // Adjust day index (MySQL returns 1-7, we need 0-6)
      const dayIndex = item.day_of_week - 1;
      if (dayIndex >= 0 && dayIndex < 7) {
        dayTotals[dayIndex] += item.total_amount;
      }
      
      if (item.hour_of_day >= 0 && item.hour_of_day < 24) {
        hourTotals[item.hour_of_day] += item.total_amount;
      }
    });

    const peakHour = hourTotals.reduce((max, amount, hour) => 
      amount > max.amount ? { hour, amount } : max, 
      { hour: 0, amount: 0 }
    );

    const peakDay = dayTotals.reduce((max, amount, day) => 
      amount > max.amount ? { day, amount } : max, 
      { day: 0, amount: 0 }
    );

    setStats({
      totalAmount,
      totalTransactions,
      peakHour,
      peakDay
    });
  };

  const getCellData = (dayIndex: number, hour: number) => {
    return data.find(
      item => item.day_of_week === dayIndex + 1 && item.hour_of_day === hour
    );
  };

  const getCellColor = (amount: number) => {
    if (amount === 0) return 'bg-gray-800/50';
    
    const maxAmount = Math.max(...data.map(d => d.total_amount), 1);
    const intensity = Math.min(amount / maxAmount, 1);
    
    // Градиент от зелёного к красному через жёлтый
    if (intensity < 0.3) {
      return `bg-red-500/20`;
    } else if (intensity < 0.6) {
      return `bg-yellow-500/40`;
    } else {
      return `bg-red-500/60`;
    }
  };

  const getCellTooltip = (dayIndex: number, hour: number) => {
    const cellData = getCellData(dayIndex, hour);
    if (!cellData) return null;

    return (
      <div className="absolute z-10 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl min-w-48 transform -translate-x-1/2 -translate-y-full -top-2 left-1/2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">
              {daysOfWeek[dayIndex]}, {hour}:00-{hour + 1}:00
            </span>
            <Zap className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Сумма расходов:</span>
              <span className="text-sm font-bold text-red-400">
                {cellData.total_amount.toFixed(0)} ₽
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Количество транзакций:</span>
              <span className="text-sm font-medium text-gray-300">
                {cellData.transaction_count}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Средний чек:</span>
              <span className="text-sm font-medium text-gray-300">
                {(cellData.total_amount / cellData.transaction_count || 0).toFixed(0)} ₽
              </span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900 border-r border-b border-gray-700" />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 animate-pulse">
        <div className="h-6 w-48 bg-gray-700 rounded mb-4" />
        <div className="h-64 bg-gray-700 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Тепловая карта расходов
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Визуализация расходов по дням недели и времени суток
          </p>
        </div>
        <button
          onClick={loadHeatmapData}
          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
        >
          Обновить
        </button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-xs text-gray-400">Всего расходов</span>
          </div>
          <p className="text-xl font-bold text-white">
            {stats.totalAmount.toFixed(0)} ₽
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Транзакций</span>
          </div>
          <p className="text-xl font-bold text-white">
            {stats.totalTransactions}
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Пиковый час</span>
          </div>
          <p className="text-xl font-bold text-white">
            {stats.peakHour.hour}:00
          </p>
          <p className="text-xs text-gray-400">
            {stats.peakHour.amount.toFixed(0)} ₽
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Пиковый день</span>
          </div>
          <p className="text-xl font-bold text-white">
            {daysOfWeek[stats.peakDay.day]}
          </p>
          <p className="text-xs text-gray-400">
            {stats.peakDay.amount.toFixed(0)} ₽
          </p>
        </div>
      </div>

      {/* Легенда */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Интенсивность:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-500/20 rounded" />
            <div className="w-4 h-4 bg-yellow-500/40 rounded" />
            <div className="w-4 h-4 bg-red-500/60 rounded" />
          </div>
          <span className="text-xs text-gray-400 ml-2">Меньше → Больше</span>
        </div>
        <div className="text-xs text-gray-400">
          Наведите на ячейку для деталей
        </div>
      </div>

      {/* Тепловая карта */}
      <div className="relative" style={{ width: '100%', height: `${height}px` }}>
        {/* Часы по вертикали */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col items-end pr-2">
          {hours.map(hour => (
            <div
              key={hour}
              className="flex-1 flex items-center justify-end"
              style={{ height: `${100 / 24}%` }}
            >
              <span className="text-xs text-gray-500">{hour}:00</span>
            </div>
          ))}
        </div>

        {/* Дни недели по горизонтали */}
        <div className="absolute left-12 right-0 bottom-0 h-6 flex">
          {daysOfWeek.map((day, dayIndex) => (
            <div
              key={day}
              className="flex-1 flex items-center justify-center"
            >
              <span className="text-xs text-gray-500">{day}</span>
            </div>
          ))}
        </div>

        {/* Сетка ячеек */}
        <div 
          className="absolute left-12 right-0 top-0"
          style={{ height: `calc(100% - 24px)` }}
        >
          <div className="grid grid-cols-7 h-full gap-1">
            {daysOfWeek.map((_, dayIndex) => (
              <div key={dayIndex} className="flex flex-col gap-1">
                {hours.map(hour => {
                  const cellData = getCellData(dayIndex, hour);
                  const amount = cellData?.total_amount || 0;
                  const isHovered = hoveredCell?.day === dayIndex && hoveredCell?.hour === hour;
                  
                  return (
                    <div
                      key={`${dayIndex}-${hour}`}
                      className={`relative flex-1 rounded transition-all duration-200 ${
                        getCellColor(amount)
                      } ${isHovered ? 'ring-2 ring-yellow-500/50 scale-105' : 'hover:ring-1 hover:ring-yellow-500/30'}`}
                      onMouseEnter={() => setHoveredCell({ day: dayIndex, hour })}
                      onMouseLeave={() => setHoveredCell(null)}
                      title={`${daysOfWeek[dayIndex]}, ${hour}:00-${hour + 1}:00: ${amount.toFixed(0)} ₽`}
                    >
                      {isHovered && getCellTooltip(dayIndex, hour)}
                      
                      {/* Количество транзакций в ячейке */}
                      {cellData && cellData.transaction_count > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-medium text-white/80">
                            {cellData.transaction_count}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Подсказки */}
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-400" />
              Что показывает карта?
            </h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Цвет показывает сумму расходов в это время</li>
              <li>• Число в ячейке — количество транзакций</li>
              <li>• Тёмные ячейки — мало расходов</li>
              <li>• Яркие ячейки — много расходов</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Как использовать?
            </h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Найдите пиковые часы расходов</li>
              <li>• Определите самые затратные дни</li>
              <li>• Планируйте бюджет на основе паттернов</li>
              <li>• Оптимизируйте время покупок</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapChart;