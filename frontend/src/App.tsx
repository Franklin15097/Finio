import { useState, useEffect } from 'react';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import './App.css';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionAdded = () => {
    fetchTransactions();
  };

  return (
    <div className="app">
      <header>
        <h1>Financial Literacy App</h1>
      </header>
      <main>
        <TransactionForm onTransactionAdded={handleTransactionAdded} />
        {loading ? <p>Loading...</p> : <TransactionList transactions={transactions} />}
      </main>
    </div>
  );
}

export default App;
