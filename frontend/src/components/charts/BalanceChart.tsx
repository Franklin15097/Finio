import { useMemo } from 'react';
import { AreaChartComponent } from './AreaChartComponent';

interface Transaction {
  transaction_date: string;
  amount: string;
  transaction_type: 'income' | 'expense';
}

interface BalanceChartProps {
  transactions: Transaction[];
  height?: number;
}

export function BalanceChart({ transactions, height = 280 }: BalanceChartProps) {
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // Sort transactions by date (oldest first)
    const sortedTransactions = [...transactions].sort((a, b) => {
      return new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime();
    });

    // Group by date and calculate cumulative balance
    const dailyData: { [key: string]: number } = {};
    let cumulativeBalance = 0;

    sortedTransactions.forEach((t) => {
      const date = new Date(t.transaction_date);
      const dateKey = date.toISOString().split('T')[0];
      const amount = parseFloat(t.amount);
      
      // Calculate cumulative balance
      if (t.transaction_type === 'income') {
        cumulativeBalance += amount;
      } else {
        cumulativeBalance -= amount;
      }
      
      // Store the balance for this date
      dailyData[dateKey] = cumulativeBalance;
    });

    // Convert to array format for chart
    const chartPoints = Object.entries(dailyData).map(([date, balance]) => {
      const d = new Date(date);
      const label = d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
      return {
        label,
        balance: Math.round(balance)
      };
    });

    // If we have too many points, sample them
    if (chartPoints.length > 30) {
      const step = Math.ceil(chartPoints.length / 30);
      return chartPoints.filter((_, index) => index % step === 0 || index === chartPoints.length - 1);
    }

    return chartPoints;
  }, [transactions]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
        Нет данных для отображения
      </div>
    );
  }

  return <AreaChartComponent data={chartData} height={height} />;
}
