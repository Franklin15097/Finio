import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface AreaChartComponentProps {
  data: { label: string; balance: number }[];
  height?: number;
}

export function AreaChartComponent({ data, height = 220 }: AreaChartComponentProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(258, 90%, 62%)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="hsl(258, 90%, 62%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="label" 
          tick={{ fontSize: 10, fill: 'hsl(220, 10%, 50%)' }} 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis 
          tick={{ fontSize: 10, fill: 'hsl(220, 10%, 50%)' }} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={v => `${(v / 1000).toFixed(0)}к`} 
          width={40}
        />
        <Tooltip
          contentStyle={{ 
            background: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))', 
            borderRadius: '12px', 
            fontSize: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }}
          formatter={(value: number) => [`${value.toFixed(0)} ₽`, 'Баланс']}
        />
        <Area 
          type="monotone" 
          dataKey="balance" 
          stroke="hsl(258, 90%, 62%)" 
          strokeWidth={2.5} 
          fill="url(#balanceGrad)" 
          dot={false} 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
