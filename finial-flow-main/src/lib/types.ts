export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  description: string;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: 'income' | 'expense';
}

export interface Account {
  id: string;
  name: string;
  icon: string;
  percentage: number;
  plannedBalance: number;
  actualBalance: number;
}

export interface UserProfile {
  name: string;
  email: string;
  telegramId?: string;
}
