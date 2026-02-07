import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { StatsOverview } from './StatsOverview';
import { TransactionModal } from './TransactionModal';
import { TransactionsList } from './TransactionsList';
import { ChartsSection } from './ChartsSection';
import '../styles/dashboard.css';

export function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ balance: 0, income: 0, expense: 0 });
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Mock user data - в реальном приложении получаем из localStorage или API
    setUser({ name: 'Пользователь', avatar: 'П' });
    loadStats();
    loadTransactions();
    loadCategories();
  }, [refreshKey]);

  const loadStats = async () => {
    try {
      // Mock data - заменить на реальный API вызов
      setStats({
        balance: 125000,
        income: 85000,
        expense: 42000
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      // Mock data - заменить на реальный API вызов
      setTransactions([
        {
          id: 1,
          title: 'Зарплата',
          amount: 85000,
          type: 'income',
          category_name: 'Работа',
          transaction_date: '2026-02-07'
        },
        {
          id: 2,
          title: 'Продукты',
          amount: -3500,
          type: 'expense',
          category_name: 'Еда',
          transaction_date: '2026-02-06'
        },
        {
          id: 3,
          title: 'Бензин',
          amount: -2800,
          type: 'expense',
          category_name: 'Транспорт',
          transaction_date: '2026-02-05'
        }
      ]);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadCategories = async () => {
    try {
      // Mock data - заменить на реальный API вызов
      setCategories([
        { id: 1, name: 'Еда', type: 'expense' },
        { id: 2, name: 'Транспорт', type: 'expense' },
        { id: 3, name: 'Работа', type: 'income' },
        { id: 4, name: 'Развлечения', type: 'expense' }
      ]);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleTransactionSave = async (transactionData) => {
    try {
      // Mock save - заменить на реальный API вызов
      console.log('Saving transaction:', transactionData);
      setShowModal(false);
      setEditingTransaction(null);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleTransactionEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowModal(true);
  };

  const handleTransactionDelete = async (id) => {
    if (!confirm('Удалить транзакцию?')) return;
    
    try {
      // Mock delete - заменить на реальный API вызов
      console.log('Deleting transaction:', id);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const openTransactionModal = () => {
    setEditingTransaction(null);
    setShowModal(true);
  };

  const closeTransactionModal = () => {
    setShowModal(false);
    setEditingTransaction(null);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar user={user} />
      
      <main className="dashboard-grid">
        <header className="flex justify-between items-center mb-4">
          <h1>Обзор</h1>
          <div style={{ color: 'var(--text-secondary)' }}>
            {new Date().toLocaleDateString('ru-RU', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </header>

        <StatsOverview stats={stats} />
        
        <ChartsSection transactions={transactions} />

        <section className="transactions-section">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3>Последние операции</h3>
              <button className="btn btn-primary" onClick={openTransactionModal}>
                + Добавить
              </button>
            </div>

            <TransactionsList 
              transactions={transactions}
              onEdit={handleTransactionEdit}
              onDelete={handleTransactionDelete}
            />
          </div>
        </section>
      </main>

      {showModal && (
        <TransactionModal
          transaction={editingTransaction}
          categories={categories}
          onSave={handleTransactionSave}
          onClose={closeTransactionModal}
        />
      )}
    </div>
  );
}