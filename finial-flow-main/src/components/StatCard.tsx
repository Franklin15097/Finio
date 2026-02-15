import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  gradient: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
}

export function StatCard({ title, value, icon, gradient, subtitle, children, className }: StatCardProps) {
  return (
    <div className={cn('glass-card rounded-2xl p-4 animate-fade-in', className)}>
      <div className="flex items-start justify-between mb-2">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-primary-foreground', gradient)}>
          {icon}
        </div>
      </div>
      <p className="text-xs text-muted-foreground font-medium">{title}</p>
      <p className="text-xl font-bold mt-0.5">{value}</p>
      {subtitle && <p className="text-[10px] text-muted-foreground mt-1">{subtitle}</p>}
      {children}
    </div>
  );
}
