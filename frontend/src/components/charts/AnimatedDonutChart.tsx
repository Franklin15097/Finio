import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface DataItem {
  label: string;
  value: number;
  color: string;
  icon?: string;
}

interface AnimatedDonutChartProps {
  data: DataItem[];
  size?: number;
  thickness?: number;
  showLabels?: boolean;
}

export default function AnimatedDonutChart({
  data,
  size = 200,
  thickness = 30,
  showLabels = true,
}: AnimatedDonutChartProps) {
  const { theme } = useTheme();
  const [animatedData, setAnimatedData] = useState<DataItem[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const center = size / 2;
  const radius = (size - thickness) / 2;

  useEffect(() => {
    // Анимация появления
    const timer = setTimeout(() => {
      setAnimatedData(data);
    }, 100);
    return () => clearTimeout(timer);
  }, [data]);

  const createArc = (startAngle: number, endAngle: number, isHovered: boolean) => {
    const adjustedRadius = isHovered ? radius + 5 : radius;
    const innerRadius = adjustedRadius - thickness;

    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = center + adjustedRadius * Math.cos(startAngleRad);
    const y1 = center + adjustedRadius * Math.sin(startAngleRad);
    const x2 = center + adjustedRadius * Math.cos(endAngleRad);
    const y2 = center + adjustedRadius * Math.sin(endAngleRad);

    const x3 = center + innerRadius * Math.cos(endAngleRad);
    const y3 = center + innerRadius * Math.sin(endAngleRad);
    const x4 = center + innerRadius * Math.cos(startAngleRad);
    const y4 = center + innerRadius * Math.sin(startAngleRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${x1} ${y1}
      A ${adjustedRadius} ${adjustedRadius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;
  };

  let currentAngle = 0;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Chart */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform transition-transform duration-300">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius - thickness / 2}
            fill="none"
            stroke={theme.colors.surfaceGlass}
            strokeWidth={thickness}
            opacity={0.2}
          />

          {/* Data segments */}
          {animatedData.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            currentAngle = endAngle;

            const isHovered = hoveredIndex === index;

            return (
              <g key={index}>
                <path
                  d={createArc(startAngle, endAngle, isHovered)}
                  fill={item.color}
                  className="transition-all duration-300 cursor-pointer"
                  style={{
                    opacity: hoveredIndex === null || isHovered ? 1 : 0.5,
                    filter: isHovered ? `drop-shadow(0 0 10px ${item.color})` : 'none',
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Center content */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ color: theme.colors.text }}
        >
          {hoveredIndex !== null ? (
            <>
              <div className="text-3xl mb-1">{data[hoveredIndex].icon}</div>
              <div className="text-2xl font-bold">
                {((data[hoveredIndex].value / total) * 100).toFixed(1)}%
              </div>
              <div className="text-sm opacity-70">{data[hoveredIndex].label}</div>
            </>
          ) : (
            <>
              <div className="text-3xl font-bold">
                {total.toLocaleString()}
              </div>
              <div className="text-sm opacity-70">Всего</div>
            </>
          )}
        </div>
      </div>

      {/* Labels */}
      {showLabels && (
        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
          {data.map((item, index) => (
            <button
              key={index}
              className="flex items-center gap-2 p-2 rounded-lg transition-all duration-200
                       hover:scale-105 active:scale-95"
              style={{
                background: hoveredIndex === index ? `${item.color}20` : theme.colors.surfaceGlass,
                backdropFilter: theme.effects.blur,
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: item.color }}
              />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium" style={{ color: theme.colors.text }}>
                  {item.label}
                </div>
                <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                  {item.value.toLocaleString()} ₽
                </div>
              </div>
              {item.icon && <span className="text-lg">{item.icon}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
