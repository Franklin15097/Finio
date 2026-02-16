import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface LiquidProgressBarProps {
  value: number;
  max: number;
  label?: string;
  color?: string;
  height?: number;
}

export default function LiquidProgressBar({
  value,
  max,
  label,
  color,
  height = 60,
}: LiquidProgressBarProps) {
  const { theme } = useTheme();
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = Math.min((value / max) * 100, 100);
  const displayColor = color || theme.colors.primary;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const isOverBudget = value > max;
  const waveColor = isOverBudget ? theme.colors.error : displayColor;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: theme.colors.text }}>
            {label}
          </span>
          <span className="text-sm font-bold" style={{ color: waveColor }}>
            {value.toLocaleString()} / {max.toLocaleString()} ₽
          </span>
        </div>
      )}

      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          height,
          background: theme.colors.surfaceGlass,
          backdropFilter: theme.effects.blur,
          border: `1px solid ${theme.colors.surfaceGlass}`,
        }}
      >
        {/* Liquid fill */}
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out"
          style={{
            height: `${animatedValue}%`,
            background: `linear-gradient(180deg, ${waveColor}40, ${waveColor})`,
          }}
        >
          {/* Wave animation */}
          <svg
            className="absolute top-0 left-0 w-full"
            style={{ height: '20px', transform: 'translateY(-50%)' }}
            preserveAspectRatio="none"
            viewBox="0 0 1200 120"
          >
            <path
              d="M0,60 C150,90 350,30 600,60 C850,90 1050,30 1200,60 L1200,120 L0,120 Z"
              fill={waveColor}
            >
              <animate
                attributeName="d"
                dur="3s"
                repeatCount="indefinite"
                values="
                  M0,60 C150,90 350,30 600,60 C850,90 1050,30 1200,60 L1200,120 L0,120 Z;
                  M0,60 C150,30 350,90 600,60 C850,30 1050,90 1200,60 L1200,120 L0,120 Z;
                  M0,60 C150,90 350,30 600,60 C850,90 1050,30 1200,60 L1200,120 L0,120 Z
                "
              />
            </path>
          </svg>
        </div>

        {/* Percentage text */}
        <div
          className="absolute inset-0 flex items-center justify-center font-bold text-lg z-10"
          style={{
            color: animatedValue > 50 ? '#fff' : theme.colors.text,
            textShadow: animatedValue > 50 ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
          }}
        >
          {percentage.toFixed(1)}%
        </div>

        {/* Shimmer effect */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            animation: 'shimmer 2s infinite',
          }}
        />
      </div>
    </div>
  );
}
