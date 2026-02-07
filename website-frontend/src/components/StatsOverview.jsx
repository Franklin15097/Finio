export function StatsOverview({ stats }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Текущий баланс',
      value: formatCurrency(stats.balance),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: '20px', height: '20px', color: 'var(--brand-primary)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
        </svg>
      ),
      trend: 'Активно',
      trendColor: 'var(--success)'
    },
    {
      title: 'Доходы',
      value: `↑ ${formatCurrency(stats.income)}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: '20px', height: '20px', color: 'var(--success)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
      ),
      trend: '+0% за месяц',
      trendColor: 'var(--success)',
      gradient: 'var(--gradient-primary)'
    },
    {
      title: 'Расходы',
      value: `↓ ${formatCurrency(stats.expense)}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: '20px', height: '20px', color: 'var(--danger)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 0111.818 8.818" />
        </svg>
      ),
      trend: '+0% за месяц',
      trendColor: 'var(--danger)',
      gradient: 'var(--gradient-danger)'
    }
  ];

  return (
    <section className="stats-overview">
      {statCards.map((card, index) => (
        <div key={index} className="card stat-card">
          <div className="stat-title">
            {card.icon}
            {card.title}
          </div>
          <div 
            className="stat-value" 
            style={card.gradient ? {
              background: card.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            } : {}}
          >
            {card.value}
          </div>
          <div 
            className="stat-trend" 
            style={{ 
              marginTop: '12px', 
              fontSize: '0.85rem', 
              color: card.trendColor 
            }}
          >
            <span style={{ color: card.trendColor }}>●</span> {card.trend}
          </div>
        </div>
      ))}
    </section>
  );
}