import { ReactNode, ButtonHTMLAttributes } from 'react';
import { useTheme } from '../context/ThemeContext';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const { theme } = useTheme();

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
          color: '#FFFFFF',
          boxShadow: `0 4px 20px ${theme.colors.primary}40`,
          border: 'none',
        };
      case 'secondary':
        return {
          background: 'transparent',
          color: theme.colors.primary,
          border: `2px solid ${theme.colors.primary}`,
          boxShadow: 'none',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: theme.colors.text,
          border: 'none',
          boxShadow: 'none',
        };
      case 'icon':
        return {
          background: theme.colors.surfaceGlass,
          color: theme.colors.text,
          border: `1px solid ${theme.colors.surfaceGlass}`,
          boxShadow: theme.effects.shadow,
          padding: '0.5rem',
          borderRadius: '50%',
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <button
      className={`
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${variant === 'icon' ? 'aspect-square' : 'rounded-xl'}
        font-semibold
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
      style={variantStyles}
      disabled={disabled || loading}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          if (variant === 'primary') {
            e.currentTarget.style.boxShadow = `0 8px 30px ${theme.colors.primary}60`;
          }
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = variantStyles.boxShadow || 'none';
      }}
      {...props}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {variant !== 'icon' && children}
        </>
      )}
    </button>
  );
}
