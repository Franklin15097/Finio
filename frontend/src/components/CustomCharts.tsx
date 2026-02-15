import { useEffect, useRef } from 'react';

interface BarChartProps {
  data: { label: string; income: number; expense: number }[];
}

export function CustomBarChart({ data }: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Find max value
    const maxValue = Math.max(
      ...data.flatMap(d => [d.income, d.expense])
    );

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Draw bars
    const barWidth = chartWidth / (data.length * 2.5);
    const gap = barWidth * 0.3;

    data.forEach((item, index) => {
      const x = padding.left + (index * (barWidth * 2 + gap * 3)) + gap;
      
      // Income bar
      const incomeHeight = (item.income / maxValue) * chartHeight;
      const incomeY = padding.top + chartHeight - incomeHeight;
      
      // Gradient for income
      const incomeGradient = ctx.createLinearGradient(0, incomeY, 0, padding.top + chartHeight);
      incomeGradient.addColorStop(0, '#10b981');
      incomeGradient.addColorStop(1, '#059669');
      
      ctx.fillStyle = incomeGradient;
      ctx.beginPath();
      ctx.roundRect(x, incomeY, barWidth, incomeHeight, [8, 8, 0, 0]);
      ctx.fill();

      // Expense bar
      const expenseHeight = (item.expense / maxValue) * chartHeight;
      const expenseY = padding.top + chartHeight - expenseHeight;
      
      // Gradient for expense
      const expenseGradient = ctx.createLinearGradient(0, expenseY, 0, padding.top + chartHeight);
      expenseGradient.addColorStop(0, '#ef4444');
      expenseGradient.addColorStop(1, '#dc2626');
      
      ctx.fillStyle = expenseGradient;
      ctx.beginPath();
      ctx.roundRect(x + barWidth + gap, expenseY, barWidth, expenseHeight, [8, 8, 0, 0]);
      ctx.fill();

      // Label
      ctx.fillStyle = '#9ca3af';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, x + barWidth + gap / 2, height - 10);
    });

    // Y-axis labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const value = (maxValue / 4) * (4 - i);
      const y = padding.top + (chartHeight / 4) * i;
      ctx.fillText(`${(value / 1000).toFixed(0)}k`, padding.left - 10, y + 4);
    }
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ width: '100%', height: '180px' }}
    />
  );
}

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
}

export function CustomDonutChart({ data }: DonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;
    const innerRadius = radius * 0.6;

    ctx.clearRect(0, 0, width, height);

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -Math.PI / 2;

    data.forEach((item) => {
      const sliceAngle = (item.value / total) * Math.PI * 2;

      // Draw slice
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();

      ctx.fillStyle = item.color;
      ctx.fill();

      // Add subtle shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      currentAngle += sliceAngle;
    });

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(139, 92, 246, 0.1)';
    ctx.fill();
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ width: '100%', height: '180px' }}
    />
  );
}
