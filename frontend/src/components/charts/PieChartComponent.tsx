import { PieChart, Pie, Cell } from 'recharts';

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

export function PieChartComponent({ 
  data, 
  width = 180, 
  height = 180,
  innerRadius = 55,
  outerRadius = 80
}: PieChartComponentProps) {
  return (
    <div className="flex flex-col items-center">
      <PieChart width={width} height={height}>
        <Pie
          data={data}
          cx={width / 2}
          cy={height / 2}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
      <div className="space-y-2 mt-3 max-h-[140px] overflow-y-auto w-full">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center gap-2.5 text-sm">
            <div 
              className="w-3 h-3 rounded-full shrink-0" 
              style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} 
            />
            <span className="flex-1 text-muted-foreground text-xs truncate">{item.name}</span>
            <span className="font-semibold text-xs">{item.value.toFixed(0)} ₽</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export { PIE_COLORS };
