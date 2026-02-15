import { useEffect, useState } from 'react';

interface AnimatedChartProps {
  value: number;
  maxValue: number;
  color: string;
  label: string;
}

export function AnimatedChart({ value, maxValue, color, label }: AnimatedChartProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="text-white font-semibold">{value.toFixed(0)} ₽</span>
      </div>
      <div className="relative h-3 bg-slate-700/30 rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out ${color}`}
          style={{ width: `${animatedValue}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
}

interface MiniChartProps {
  data: { value: number; label: string }[];
  color: string;
}

export function MiniChart({ data, color }: MiniChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((item, index) => {
        const height = (item.value / maxValue) * 100;
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full relative">
              <div
                className={`w-full ${color} rounded-t-lg transition-all duration-700 ease-out`}
                style={{ 
                  height: `${height}%`,
                  minHeight: item.value > 0 ? '4px' : '0px',
                  transitionDelay: `${index * 50}ms`
                }}
              ></div>
            </div>
            <span className="text-[8px] text-slate-400">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
