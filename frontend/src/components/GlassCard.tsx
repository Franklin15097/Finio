import { ReactNode, CSSProperties } from 'react';
import { useTheme } from '../context/ThemeContext';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

export default function GlassCard({ children, className = '', hover = false, onClick, style }: GlassCardProps) {
  const { theme } = useTheme();

  const baseStyles: CSSProperties = {
    background: theme.colors.surfaceGlass,
    backdropFilter: theme.effects.blur,
    WebkitBackdropFilter: theme.effects.blur,
    border: `1px solid ${theme.colors.surfaceGlass}`,
    borderRadius: '20px',
    boxShadow: theme.effects.shadow,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ...style,
  };

  const hoverStyles: CSSProperties = hover ? {
    cursor: 'pointer',
  } : {};

  return (
    <div
      className={`glass-card ${className}`}
      onClick={onClick}
      style={baseStyles}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = `${theme.effects.shadow}, ${theme.effects.glow}`;
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = theme.effects.shadow;
        }
      }}
    >
      {children}
    </div>
  );
}
