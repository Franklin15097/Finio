import { Transaction, Category, Account, UserProfile } from './types';

export const categories: Category[] = [
  { id: '1', name: 'Зарплата', icon: 'Briefcase', type: 'income' },
  { id: '2', name: 'Фриланс', icon: 'Laptop', type: 'income' },
  { id: '3', name: 'Инвестиции', icon: 'TrendingUp', type: 'income' },
  { id: '4', name: 'Подарки', icon: 'Gift', type: 'income' },
  { id: '5', name: 'Продукты', icon: 'ShoppingCart', type: 'expense' },
  { id: '6', name: 'Транспорт', icon: 'Car', type: 'expense' },
  { id: '7', name: 'Развлечения', icon: 'Film', type: 'expense' },
  { id: '8', name: 'Кафе', icon: 'Coffee', type: 'expense' },
  { id: '9', name: 'Одежда', icon: 'Shirt', type: 'expense' },
  { id: '10', name: 'Здоровье', icon: 'Heart', type: 'expense' },
  { id: '11', name: 'Связь', icon: 'Smartphone', type: 'expense' },
  { id: '12', name: 'ЖКХ', icon: 'Home', type: 'expense' },
];

const now = new Date();
const d = (daysAgo: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const transactions: Transaction[] = [
  { id: '1', type: 'income', amount: 150000, categoryId: '1', description: 'Основная работа', date: d(0) },
  { id: '2', type: 'expense', amount: 4500, categoryId: '5', description: 'Пятёрочка', date: d(0) },
  { id: '3', type: 'expense', amount: 1200, categoryId: '8', description: 'Кофемания', date: d(1) },
  { id: '4', type: 'income', amount: 35000, categoryId: '2', description: 'Проект для клиента', date: d(2) },
  { id: '5', type: 'expense', amount: 3200, categoryId: '6', description: 'Такси Яндекс', date: d(2) },
  { id: '6', type: 'expense', amount: 8900, categoryId: '9', description: 'Uniqlo', date: d(3) },
  { id: '7', type: 'expense', amount: 2500, categoryId: '7', description: 'Кинотеатр', date: d(4) },
  { id: '8', type: 'income', amount: 12000, categoryId: '3', description: 'Дивиденды', date: d(5) },
  { id: '9', type: 'expense', amount: 6800, categoryId: '5', description: 'Перекрёсток', date: d(5) },
  { id: '10', type: 'expense', amount: 15000, categoryId: '12', description: 'Квартплата', date: d(7) },
  { id: '11', type: 'income', amount: 150000, categoryId: '1', description: 'Основная работа', date: d(30) },
  { id: '12', type: 'expense', amount: 5200, categoryId: '5', description: 'Магнит', date: d(10) },
  { id: '13', type: 'expense', amount: 800, categoryId: '11', description: 'Мобильная связь', date: d(12) },
  { id: '14', type: 'expense', amount: 3500, categoryId: '10', description: 'Аптека', date: d(14) },
  { id: '15', type: 'income', amount: 5000, categoryId: '4', description: 'День рождения', date: d(20) },
];

export const accounts: Account[] = [
  { id: '1', name: 'Основной', icon: 'Wallet', percentage: 50, plannedBalance: 176000, actualBalance: 165000 },
  { id: '2', name: 'Накопления', icon: 'PiggyBank', percentage: 30, plannedBalance: 105600, actualBalance: 120000 },
  { id: '3', name: 'Инвестиции', icon: 'TrendingUp', percentage: 20, plannedBalance: 70400, actualBalance: 85000 },
];

export const userProfile: UserProfile = {
  name: 'Александр',
  email: 'alex@example.com',
  telegramId: '@alex_finance',
};

export const balanceHistory = Array.from({ length: 30 }, (_, i) => {
  const base = 300000;
  const variation = Math.sin(i / 5) * 30000 + Math.random() * 15000;
  return {
    day: d(29 - i),
    balance: Math.round(base + variation),
  };
});

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find(c => c.id === id);
}
