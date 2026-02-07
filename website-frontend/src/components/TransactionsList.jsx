export function TransactionsList({ transactions, onEdit, onDelete }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center text-secondary" style={{ padding: '2rem' }}>
        Нет транзакций
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="transactions-table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Название</th>
            <th>Категория</th>
            <th>Сумма</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => {
            const isIncome = transaction.type === 'income';
            const amountClass = isIncome ? 'text-success' : 'text-danger';
            const sign = isIncome ? '+' : '-';
            
            return (
              <tr key={transaction.id}>
                <td>{formatDate(transaction.transaction_date)}</td>
                <td>{transaction.title}</td>
                <td>{transaction.category_name || 'Без категории'}</td>
                <td className={amountClass} style={{ fontWeight: 600 }}>
                  {sign} {formatCurrency(transaction.amount)}
                </td>
                <td>
                  <button 
                    className="action-btn" 
                    onClick={() => onEdit(transaction)}
                    title="Редактировать"
                  >
                    ✎
                  </button>
                  <button 
                    className="action-btn delete" 
                    onClick={() => onDelete(transaction.id)}
                    title="Удалить"
                  >
                    ×
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}