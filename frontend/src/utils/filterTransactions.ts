import { TransactionFilters } from '../components/TransactionFilter';

export interface Transaction {
  id: number;
  amount: number;
  description: string;
  transaction_date: string;
  category_id?: number;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  transaction_type?: 'income' | 'expense';
  created_at: string;
}

/**
 * Фильтрует массив транзакций по заданным фильтрам
 */
export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters
): Transaction[] {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  return transactions.filter(transaction => {
    // Поиск по описанию
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const descriptionLower = transaction.description?.toLowerCase() || '';
      if (!descriptionLower.includes(searchLower)) {
        return false;
      }
    }

    // Фильтр по дате
    if (filters.startDate || filters.endDate) {
      const transactionDate = new Date(transaction.transaction_date);
      
      if (filters.startDate && transactionDate < filters.startDate) {
        return false;
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999); // Конец дня
        if (transactionDate > endDate) {
          return false;
        }
      }
    }

    // Фильтр по типу
    if (filters.type !== 'all') {
      const transactionType = transaction.transaction_type || 
        (transaction.amount > 0 ? 'income' : 'expense');
      
      if (transactionType !== filters.type) {
        return false;
      }
    }

    // Фильтр по категориям
    if (filters.categoryIds.length > 0) {
      if (!transaction.category_id || !filters.categoryIds.includes(transaction.category_id)) {
        return false;
      }
    }

    // Фильтр по сумме
    if (filters.minAmount !== null && Math.abs(transaction.amount) < filters.minAmount) {
      return false;
    }
    
    if (filters.maxAmount !== null && Math.abs(transaction.amount) > filters.maxAmount) {
      return false;
    }

    return true;
  });
}

/**
 * Сортирует транзакции по дате (новые сначала)
 */
export function sortTransactionsByDate(
  transactions: Transaction[],
  order: 'asc' | 'desc' = 'desc'
): Transaction[] {
  return [...transactions].sort((a, b) => {
    const dateA = new Date(a.transaction_date).getTime();
    const dateB = new Date(b.transaction_date).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
}

/**
 * Группирует транзакции по дате
 */
export function groupTransactionsByDate(transactions: Transaction[]): Record<string, Transaction[]> {
  return transactions.reduce((groups, transaction) => {
    const date = transaction.transaction_date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);
}

/**
 * Вычисляет статистику по отфильтрованным транзакциям
 */
export function calculateTransactionStats(transactions: Transaction[]) {
  const stats = {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: transactions.length,
    averageIncome: 0,
    averageExpense: 0,
    largestIncome: 0,
    largestExpense: 0,
    incomeCount: 0,
    expenseCount: 0
  };

  transactions.forEach(transaction => {
    const amount = Math.abs(transaction.amount);
    const type = transaction.transaction_type || (transaction.amount > 0 ? 'income' : 'expense');

    if (type === 'income') {
      stats.totalIncome += amount;
      stats.incomeCount++;
      if (amount > stats.largestIncome) {
        stats.largestIncome = amount;
      }
    } else {
      stats.totalExpense += amount;
      stats.expenseCount++;
      if (amount > stats.largestExpense) {
        stats.largestExpense = amount;
      }
    }
  });

  stats.balance = stats.totalIncome - stats.totalExpense;
  stats.averageIncome = stats.incomeCount > 0 ? stats.totalIncome / stats.incomeCount : 0;
  stats.averageExpense = stats.expenseCount > 0 ? stats.totalExpense / stats.expenseCount : 0;

  return stats;
}

/**
 * Получает уникальные категории из транзакций
 */
export function getUniqueCategories(transactions: Transaction[]) {
  const categories = new Map<number, {
    id: number;
    name: string;
    type: 'income' | 'expense';
    count: number;
    totalAmount: number;
  }>();

  transactions.forEach(transaction => {
    if (transaction.category_id && transaction.category_name) {
      const categoryId = transaction.category_id;
      const current = categories.get(categoryId) || {
        id: categoryId,
        name: transaction.category_name || 'Без категории',
        type: transaction.transaction_type || (transaction.amount > 0 ? 'income' : 'expense'),
        count: 0,
        totalAmount: 0
      };

      current.count++;
      current.totalAmount += Math.abs(transaction.amount);
      categories.set(categoryId, current);
    }
  });

  return Array.from(categories.values());
}

/**
 * Экспортирует отфильтрованные транзакции в CSV
 */
export function exportToCSV(transactions: Transaction[], filename: string = 'transactions') {
  if (transactions.length === 0) {
    alert('Нет транзакций для экспорта');
    return;
  }

  // Заголовки CSV
  const headers = [
    'Дата',
    'Тип',
    'Категория',
    'Сумма',
    'Описание',
    'ID транзакции'
  ];

  // Данные
  const rows = transactions.map(transaction => [
    transaction.transaction_date,
    transaction.transaction_type === 'income' ? 'Доход' : 'Расход',
    transaction.category_name || 'Без категории',
    Math.abs(transaction.amount).toFixed(2),
    transaction.description || '',
    transaction.id.toString()
  ]);

  // Создаем CSV контент
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // Экранируем кавычки и запятые
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(','))
  ].join('\n');

  // Создаем Blob и скачиваем
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Форматирует дату для отображения
 */
export function formatTransactionDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Сегодня';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Вчера';
  } else {
    return date.toLocaleDateString('ru-RU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  }
}

/**
 * Форматирует сумму для отображения
 */
export function formatTransactionAmount(amount: number, type?: 'income' | 'expense'): string {
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(absAmount);

  const sign = type === 'income' || amount > 0 ? '+' : '-';
  return `${sign} ${formatted} ₽`;
}