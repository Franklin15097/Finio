import { ReactNode, ButtonHTMLAttributes } from 'react';
import { useTheme } from '../context/ThemeContext';

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
}

export default function GradientButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}: GradientButtonProps) {
  const { theme } = useTheme();

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantStyles = {
    primary: {
      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
      color: '#fff',
      boxShadow: theme.effects.shadow,
    },
    secondary: {
      background: 'transparent',
      color: theme.colors.primary,
      border: `2px solid ${theme.colors.primary}`,
    },
    ghost: {
      background: 'transparent',
      color: theme.colors.text,
    },
  };

  return (
    <button
      className={`
        relative overflow-hidden rounded-xl font-semibold
        transition-all duration-300 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:scale-105 hover:shadow-lg
        active:scale-95
        flex items-center justify-center gap-2
        ${sizeClasses[size]}
        ${className}
      `}
      style={variantStyles[variant]}
      disabled={disabled || loading}
      onMouseEnter={(e) => {
        if (variant === 'primary' && !disabled && !loading) {
          e.currentTarget.style.boxShadow = `${theme.effects.shadow}, ${theme.effects.glow}`;
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.boxShadow = theme.effects.shadow;
        }
      }}
      {...props}
    >
      {/* Ripple effect overlay */}
      <span className="absolute inset-0 overflow-hidden rounded-xl">
        <span className="absolute inset-0 bg-white opacity-0 hover:opacity-20 transition-opacity duration-300" />
      </span>

      {/* Content */}
      <span className="relative flex items-center gap-2">
        {loading ? (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : icon ? (
          <span>{icon}</span>
        ) : null}
        {children}
      </span>
    </button>
  );
}
