import { useRef, useEffect, useState } from 'react';

interface LineChartProps {
  data: { value: number; label?: string }[];
  color?: string;
  height?: number;
  showPeriods?: boolean;
  onPeriodChange?: (period: string) => void;
  currentPeriod?: string;
}

export default function LineChart({ 
  data, 
  color = '#ef4444', 
  height = 200,
  showPeriods = true,
  onPeriodChange,
  currentPeriod = 'all'
}: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);

    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Find min and max values
    const values = data.map(d => d.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const valueRange = maxValue - minValue || 1;

    // Draw horizontal grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();

      // Draw Y-axis labels
      const value = maxValue - (valueRange / gridLines) * i;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(
        value >= 1000 ? `${(value / 1000).toFixed(2)}K` : value.toFixed(0),
        padding.left - 10,
        y + 4
      );
    }

    // Calculate points
    const points = data.map((d, i) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * i;
      const normalizedValue = (d.value - minValue) / valueRange;
      const y = padding.top + chartHeight - normalizedValue * chartHeight;
      return { x, y, value: d.value };
    });

    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(1, color + '00');

    ctx.beginPath();
    ctx.moveTo(points[0].x, padding.top + chartHeight);
    points.forEach((point, i) => {
      if (i === 0) {
        ctx.lineTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    points.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();

    // Draw hover point
    if (hoveredIndex !== null && points[hoveredIndex]) {
      const point = points[hoveredIndex];
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

  }, [data, color, hoveredIndex]);

  const periods = [
    { key: 'day', label: '1Д' },
    { key: 'week', label: '7Д' },
    { key: 'month', label: '1М' },
    { key: 'year', label: '1Г' },
    { key: 'all', label: 'Все' }
  ];

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px` }}
        className="cursor-crosshair"
      />
      
      {showPeriods && (
        <div className="flex gap-2 mt-4 justify-center">
          {periods.map((period) => (
            <button
              key={period.key}
              onClick={() => onPeriodChange?.(period.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                currentPeriod === period.key
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
