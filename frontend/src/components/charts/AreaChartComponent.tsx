import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface AreaChartComponentProps {
  data: { label: string; balance: number }[];
  height?: number;
}

export function AreaChartComponent({ data, height = 280 }: AreaChartComponentProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(258, 90%, 62%)" stopOpacity={0.4} />
            <stop offset="50%" stopColor="hsl(258, 90%, 62%)" stopOpacity={0.2} />
            <stop offset="100%" stopColor="hsl(258, 90%, 62%)" stopOpacity={0} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="hsl(var(--border))" 
          opacity={0.3}
          vertical={false}
        />
        <XAxis 
          dataKey="label" 
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
          tickLine={false} 
          axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
          dy={8}
        />
        <YAxis 
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
          tickLine={false} 
          axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
          tickFormatter={v => `${(v / 1000).toFixed(0)}к`} 
          width={45}
          dx={-5}
        />
        <Tooltip
          contentStyle={{ 
            background: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))', 
            borderRadius: '12px', 
            fontSize: '13px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            padding: '8px 12px'
          }}
          labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: '4px' }}
          formatter={(value: number) => [`${value.toFixed(0)} ₽`, 'Баланс']}
          cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '5 5' }}
        />
        <Area 
          type="monotone" 
          dataKey="balance" 
          stroke="hsl(258, 90%, 62%)" 
          strokeWidth={3} 
          fill="url(#balanceGrad)" 
          dot={{ 
            fill: 'hsl(258, 90%, 62%)', 
            strokeWidth: 2, 
            stroke: 'hsl(var(--card))',
            r: 4
          }}
          activeDot={{ 
            r: 6, 
            fill: 'hsl(258, 90%, 62%)',
            stroke: 'hsl(var(--card))',
            strokeWidth: 3,
            filter: 'url(#glow)'
          }}
          animationDuration={1500}
          animationEasing="ease-in-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
