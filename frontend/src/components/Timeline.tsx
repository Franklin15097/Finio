import { ReactNode } from 'react';
import { useTheme } from '../context/ThemeContext';
import GlassCard from './GlassCard';

interface TimelineItemProps {
  icon: ReactNode;
  title: string;
  amount: string;
  time: string;
  category?: string;
  type: 'income' | 'expense';
  onClick?: () => void;
}

export function TimelineItem({ icon, title, amount, time, category, type, onClick }: TimelineItemProps) {
  const { theme } = useTheme();
  
  const amountColor = type === 'income' ? theme.colors.income : theme.colors.expense;
  const amountPrefix = type === 'income' ? '+' : '-';

  return (
    <div className="flex gap-4 group">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{
            background: theme.colors.surfaceGlass,
            border: `2px solid ${theme.colors.primary}`,
            boxShadow: `0 0 20px ${theme.colors.primary}40`,
          }}
        >
          {icon}
        </div>
        <div 
          className="w-0.5 flex-1 mt-2"
          style={{
            background: `linear-gradient(to bottom, ${theme.colors.primary}80, transparent)`,
          }}
        />
      </div>

      {/* Content */}
      <GlassCard 
        className="flex-1 p-4 mb-4 group-hover:scale-[1.02] transition-transform"
        hover
        onClick={onClick}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 
              className="font-semibold text-lg"
              style={{ color: theme.colors.text }}
            >
              {title}
            </h3>
            {category && (
              <span 
                className="text-sm"
                style={{ color: theme.colors.textSecondary }}
              >
                {category}
              </span>
            )}
            <p 
              className="text-xs mt-1"
              style={{ color: theme.colors.textSecondary }}
            >
              {time}
            </p>
          </div>
          <div 
            className="text-xl font-bold"
            style={{ color: amountColor }}
          >
            {amountPrefix}{amount}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

interface TimelineDayProps {
  date: string;
  children: ReactNode;
}

export function TimelineDay({ date, children }: TimelineDayProps) {
  const { theme } = useTheme();

  return (
    <div className="mb-8">
      <div 
        className="sticky top-0 z-10 py-2 px-4 mb-4 rounded-xl backdrop-blur-md"
        style={{
          background: theme.colors.surfaceGlass,
          border: `1px solid ${theme.colors.primary}40`,
        }}
      >
        <h2 
          className="text-sm font-bold"
          style={{ color: theme.colors.text }}
        >
          {date}
        </h2>
      </div>
      <div className="space-y-0">
        {children}
      </div>
    </div>
  );
}

interface TimelineProps {
  children: ReactNode;
}

export default function Timeline({ children }: TimelineProps) {
  return (
    <div className="relative">
      {children}
    </div>
  );
}
