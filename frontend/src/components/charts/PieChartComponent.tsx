import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { useState } from 'react';

const PIE_COLORS = [
  'hsl(258, 90%, 62%)',
  'hsl(350, 89%, 60%)',
  'hsl(210, 100%, 56%)',
  'hsl(36, 100%, 57%)',
  'hsl(280, 70%, 55%)',
  'hsl(160, 84%, 39%)',
  'hsl(190, 80%, 45%)',
  'hsl(20, 90%, 55%)',
];

interface PieChartData {
  name: string;
  value: number;
}

interface PieChartComponentProps {
  data: PieChartData[];
  width?: number;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 12}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.3}
      />
    </g>
  );
};

export function PieChartComponent({ 
  data, 
  width = 200, 
  height = 200,
  innerRadius = 60,
  outerRadius = 85
}: PieChartComponentProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width={width} height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={4}
            dataKey="value"
            strokeWidth={0}
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(undefined)}
            animationDuration={1000}
            animationEasing="ease-out"
          >
            {data.map((_, i) => (
              <Cell 
                key={i} 
                fill={PIE_COLORS[i % PIE_COLORS.length]}
                style={{ 
                  filter: activeIndex === i ? 'brightness(1.2)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 mt-4 max-h-[160px] overflow-y-auto w-full custom-scrollbar">
        {data.map((item, i) => (
          <div 
            key={item.name} 
            className={`flex items-center gap-3 text-sm p-2 rounded-lg transition-all duration-200 cursor-pointer ${
              activeIndex === i ? 'bg-secondary/50 scale-105' : 'hover:bg-secondary/30'
            }`}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(undefined)}
          >
            <div 
              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-lg" 
              style={{ 
                background: PIE_COLORS[i % PIE_COLORS.length],
                boxShadow: activeIndex === i ? `0 0 12px ${PIE_COLORS[i % PIE_COLORS.length]}` : 'none'
              }} 
            />
            <span className="flex-1 text-muted-foreground text-xs truncate font-medium">{item.name}</span>
            <span className="font-bold text-sm text-foreground">{item.value.toFixed(0)} ₽</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export { PIE_COLORS };
