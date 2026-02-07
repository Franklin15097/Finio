import { useEffect, useRef } from 'react';

export function ChartsSection({ transactions }) {
  const mainChartRef = useRef(null);
  const categoriesChartRef = useRef(null);
  const mainChartInstance = useRef(null);
  const categoriesChartInstance = useRef(null);

  useEffect(() => {
    // Динамически загружаем Chart.js только когда компонент монтируется
    const loadChartJS = async () => {
      if (typeof window !== 'undefined' && !window.Chart) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => {
          renderCharts();
        };
        document.head.appendChild(script);
      } else if (window.Chart) {
        renderCharts();
      }
    };

    loadChartJS();

    return () => {
      // Очищаем графики при размонтировании
      if (mainChartInstance.current) {
        mainChartInstance.current.destroy();
      }
      if (categoriesChartInstance.current) {
        categoriesChartInstance.current.destroy();
      }
    };
  }, [transactions]);

  const renderCharts = () => {
    if (!window.Chart || !mainChartRef.current || !categoriesChartRef.current) return;

    // Подготавливаем данные для основного графика
    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    const expenseData = last7Days.map(date => {
      const dayTransactions = transactions.filter(t => 
        t.transaction_date === date && t.type === 'expense'
      );
      return dayTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    });

    // Основной график расходов
    if (mainChartInstance.current) {
      mainChartInstance.current.destroy();
    }

    mainChartInstance.current = new window.Chart(mainChartRef.current, {
      type: 'line',
      data: {
        labels: last7Days.map(date => 
          new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
        ),
        datasets: [{
          label: 'Расходы (₽)',
          data: expenseData,
          borderColor: '#F87171',
          backgroundColor: 'rgba(248, 113, 113, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#18181b',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#27272A',
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
              label: (ctx) => `₽ ${Number(ctx.raw).toLocaleString('ru-RU')}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false, drawBorder: false },
            ticks: { color: '#71717A' }
          },
          y: {
            grid: { color: '#27272A', borderDash: [5, 5], drawBorder: false },
            ticks: { 
              color: '#71717A', 
              callback: (val) => '₽' + val.toLocaleString('ru-RU')
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
      }
    });

    // График категорий (пончик)
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const categoryTotals = {};
    
    expenseTransactions.forEach(t => {
      const category = t.category_name || 'Без категории';
      categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(t.amount);
    });

    const categoryLabels = Object.keys(categoryTotals);
    const categoryValues = Object.values(categoryTotals);
    const categoryColors = [
      '#F87171', '#60A5FA', '#34D399', '#FBBF24', 
      '#A78BFA', '#FB7185', '#38BDF8', '#4ADE80'
    ];

    if (categoriesChartInstance.current) {
      categoriesChartInstance.current.destroy();
    }

    categoriesChartInstance.current = new window.Chart(categoriesChartRef.current, {
      type: 'doughnut',
      data: {
        labels: categoryLabels,
        datasets: [{
          data: categoryValues,
          backgroundColor: categoryColors.slice(0, categoryLabels.length),
          borderWidth: 0,
          hoverBorderWidth: 2,
          hoverBorderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#B4B4C8',
              padding: 15,
              usePointStyle: true,
              font: { size: 12 }
            }
          },
          tooltip: {
            backgroundColor: '#18181b',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#27272A',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (ctx) => `${ctx.label}: ₽${Number(ctx.raw).toLocaleString('ru-RU')}`
            }
          }
        },
        cutout: '60%'
      }
    });
  };

  return (
    <section className="charts-section grid-2-1">
      <div className="card chart-card">
        <h3>Динамика расходов</h3>
        <div style={{ height: '300px', position: 'relative' }}>
          <canvas ref={mainChartRef}></canvas>
        </div>
      </div>
      <div className="card chart-card">
        <h3>Категории</h3>
        <div style={{ height: '300px', position: 'relative' }}>
          <canvas ref={categoriesChartRef}></canvas>
        </div>
      </div>
    </section>
  );
}