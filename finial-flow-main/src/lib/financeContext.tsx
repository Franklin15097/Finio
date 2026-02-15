import { useState, createContext, useContext, ReactNode } from 'react';
import { Transaction, Category, Account } from './types';
import { transactions as initialTx, categories as initialCats, accounts as initialAccs } from './mockData';

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (cat: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  updateCategory: (cat: Category) => void;
  addAccount: (acc: Omit<Account, 'id'>) => void;
  deleteAccount: (id: string) => void;
  updateAccount: (acc: Account) => void;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTx);
  const [categories, setCategories] = useState<Category[]>(initialCats);
  const [accounts, setAccounts] = useState<Account[]>(initialAccs);

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [{ ...tx, id: Date.now().toString() }, ...prev]);
  };
  const deleteTransaction = (id: string) => setTransactions(prev => prev.filter(t => t.id !== id));
  const addCategory = (cat: Omit<Category, 'id'>) => {
    setCategories(prev => [...prev, { ...cat, id: Date.now().toString() }]);
  };
  const deleteCategory = (id: string) => setCategories(prev => prev.filter(c => c.id !== id));
  const updateCategory = (cat: Category) => setCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
  const addAccount = (acc: Omit<Account, 'id'>) => {
    setAccounts(prev => [...prev, { ...acc, id: Date.now().toString() }]);
  };
  const deleteAccount = (id: string) => setAccounts(prev => prev.filter(a => a.id !== id));
  const updateAccount = (acc: Account) => setAccounts(prev => prev.map(a => a.id === acc.id ? acc : a));

  return (
    <FinanceContext.Provider value={{
      transactions, categories, accounts,
      addTransaction, deleteTransaction,
      addCategory, deleteCategory, updateCategory,
      addAccount, deleteAccount, updateAccount,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
};
