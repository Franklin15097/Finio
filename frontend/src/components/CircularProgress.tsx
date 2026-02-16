import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showPercentage?: boolean;
  animated?: boolean;
  gradient?: boolean;
}

export default function CircularProgress({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  label,
  showPercentage = true,
  animated = true,
  gradient = true,
}: CircularProgressProps) {
  const { theme } = useTheme();
  const [animatedValue, setAnimatedValue] = useState(0);
  
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedValue / 100) * circumference;

  useEffect(() => {
    if (animated) {
      let start = 0;
      const duration = 1500;
      const startTime = Date.now();

      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        
        setAnimatedValue(percentage * easeOutCubic);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    } else {
      setAnimatedValue(percentage);
    }
  }, [percentage, animated]);

  const getColor = () => {
    if (percentage >= 90) return theme.colors.error;
    if (percentage >= 70) return theme.colors.warning;
    return theme.colors.success;
  };

  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          {gradient && (
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.colors.primary} />
              <stop offset="100%" stopColor={theme.colors.accent} />
            </linearGradient>
          )}
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.surfaceGlass}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={gradient ? `url(#${gradientId})` : getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: animated ? 'stroke-dashoffset 0.5s ease' : 'none',
            filter: `drop-shadow(0 0 8px ${getColor()}40)`,
          }}
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <span 
            className="text-2xl font-bold"
            style={{ color: theme.colors.text }}
          >
            {Math.round(animatedValue)}%
          </span>
        )}
        {label && (
          <span 
            className="text-xs mt-1"
            style={{ color: theme.colors.textSecondary }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
