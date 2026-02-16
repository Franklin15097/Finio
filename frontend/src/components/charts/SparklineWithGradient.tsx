import { useTheme } from '../../context/ThemeContext';

interface SparklineWithGradientProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showDots?: boolean;
  animate?: boolean;
}

export default function SparklineWithGradient({
  data,
  width = 200,
  height = 60,
  color,
  showDots = true,
  animate = true,
}: SparklineWithGradientProps) {
  const { theme } = useTheme();
  const lineColor = color || theme.colors.primary;

  if (data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return { x, y, value };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
  const areaData = `${pathData} L ${width},${height} L 0,${height} Z`;

  const trend = data[data.length - 1] > data[0] ? 'up' : 'down';
  const trendColor = trend === 'up' ? theme.colors.success : theme.colors.error;

  return (
    <div className="relative" style={{ width, height }}>
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          {/* Gradient for area */}
          <linearGradient id={`gradient-${lineColor}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>

          {/* Gradient for line */}
          <linearGradient id={`line-gradient-${lineColor}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={lineColor} />
            <stop offset="100%" stopColor={trendColor} />
          </linearGradient>
        </defs>

        {/* Area */}
        <path
          d={areaData}
          fill={`url(#gradient-${lineColor})`}
          className={animate ? 'animate-fade-in' : ''}
        />

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={`url(#line-gradient-${lineColor})`}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animate ? 'animate-fade-in' : ''}
          style={{
            filter: `drop-shadow(0 0 4px ${lineColor}40)`,
          }}
        />

        {/* Dots */}
        {showDots &&
          points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill={lineColor}
                className="transition-all duration-200 hover:r-6 cursor-pointer"
                style={{
                  filter: `drop-shadow(0 0 4px ${lineColor})`,
                }}
              >
                {animate && (
                  <animate
                    attributeName="r"
                    values="0;4"
                    dur="0.5s"
                    begin={`${index * 0.05}s`}
                    fill="freeze"
                  />
                )}
              </circle>
              <circle
                cx={point.x}
                cy={point.y}
                r="8"
                fill={lineColor}
                opacity="0"
                className="hover:opacity-20 transition-opacity duration-200"
              />
            </g>
          ))}

        {/* Last point highlight */}
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="6"
          fill={trendColor}
          className="animate-pulse"
          style={{
            filter: `drop-shadow(0 0 6px ${trendColor})`,
          }}
        />
      </svg>

      {/* Trend indicator */}
      <div
        className="absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"
        style={{
          background: `${trendColor}20`,
          color: trendColor,
          backdropFilter: theme.effects.blur,
        }}
      >
        <span>{trend === 'up' ? '↑' : '↓'}</span>
        <span>
          {Math.abs(
            ((data[data.length - 1] - data[0]) / data[0]) * 100
          ).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
