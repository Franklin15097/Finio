interface Transaction {
  id: number;
  category_name: string;
  amount: number;
  description: string;
  transaction_date: string;
}

interface Props {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: Props) {
  return (
    <div className="transaction-list">
      <h2>Transactions</h2>
      {transactions.length === 0 ? (
        <p>No transactions yet</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td>{t.transaction_date}</td>
                <td>{t.category_name}</td>
                <td>{t.description}</td>
                <td>${t.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
