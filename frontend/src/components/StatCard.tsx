import { ReactNode } from 'react';
import { useTheme } from '../context/ThemeContext';
import GlassCard from './GlassCard';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  onClick?: () => void;
  gradient?: boolean;
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  onClick,
  gradient = false,
}: StatCardProps) {
  const { theme } = useTheme();

  return (
    <GlassCard hover={!!onClick} onClick={onClick} className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div 
          className="p-3 rounded-xl"
          style={{
            background: gradient 
              ? `linear-gradient(135deg, ${theme.colors.primary}40, ${theme.colors.accent}40)`
              : theme.colors.surfaceGlass,
          }}
        >
          <div className="text-2xl">{icon}</div>
        </div>
        
        {trend && (
          <div 
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold"
            style={{
              background: trend.isPositive 
                ? `${theme.colors.success}20` 
                : `${theme.colors.error}20`,
              color: trend.isPositive ? theme.colors.success : theme.colors.error,
            }}
          >
            {trend.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      <div>
        <p 
          className="text-sm mb-1"
          style={{ color: theme.colors.textSecondary }}
        >
          {title}
        </p>
        <h3 
          className="text-3xl font-bold mb-1"
          style={{ 
            color: theme.colors.text,
            background: gradient 
              ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`
              : 'none',
            WebkitBackgroundClip: gradient ? 'text' : 'unset',
            WebkitTextFillColor: gradient ? 'transparent' : 'unset',
          }}
        >
          {value}
        </h3>
        {subtitle && (
          <p 
            className="text-xs"
            style={{ color: theme.colors.textSecondary }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </GlassCard>
  );
}
