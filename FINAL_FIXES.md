# Финальные исправления

## Дата: 17 февраля 2026

### Проблема
После предыдущего деплоя пользователь сообщил об ошибке "selectedCategory is not defined" при попытке открыть страницу расходов.

### Причина
В файле `frontend/src/pages/Expenses.tsx` на сервере (коммит 7a8a5d4) присутствовала дублирующаяся функция `filterTransactions()` (строки 110-172), которая:
- Переопределяла импортированную утилиту `filterTransactions` из `../utils/filterTransactions`
- Использовала несуществующие переменные: `selectedCategory`, `dateRange`, `searchQuery`, `sortBy`, `sortOrder`
- Эти переменные были удалены при рефакторинге на использование компонента `TransactionFilter`

### Решение
Дублирующаяся функция была удалена в коммите 2125e40. Файл теперь корректно:
- Импортирует утилиту `filterTransactions` из `../utils/filterTransactions`
- Использует компонент `TransactionFilter` для управления фильтрами
- Применяет фильтры через состояние `filters` типа `TransactionFilters`

### Выполненные действия
1. ✅ Проверен текущий код - дублирующая функция отсутствует
2. ✅ Выполнен деплой актуальной версии на production сервер
3. ✅ Фронтенд успешно собран без ошибок
4. ✅ Backend и Bot перезапущены

### Результат
- Сайт: https://studiofinance.ru - работает корректно
- Страница расходов открывается без ошибок
- Фильтрация транзакций работает через компонент `TransactionFilter`
- Telegram mini app навигация работает корректно

### Технические детали
**Было (коммит 7a8a5d4):**
```typescript
const filterTransactions = () => {
  let filtered = [...transactions];
  
  if (selectedCategory !== 'all') { // ❌ selectedCategory не определена
    // ...
  }
  
  if (dateRange !== 'all') { // ❌ dateRange не определена
    // ...
  }
  
  if (searchQuery) { // ❌ searchQuery не определена
    // ...
  }
  
  filtered.sort((a, b) => {
    if (sortBy === 'date') { // ❌ sortBy не определена
      // ...
    }
  });
}
```

**Стало (коммит 2125e40):**
```typescript
// Импорт утилиты
import { filterTransactions } from '../utils/filterTransactions';

// Использование в useEffect
useEffect(() => {
  const filtered = filterTransactions(transactions, filters);
  const sorted = sortTransactionsByDate(filtered, 'desc');
  const grouped = groupTransactionsByDate(sorted);
  
  setFilteredTransactions(sorted);
  setGroupedTransactions(grouped);
  
  const transactionStats = calculateTransactionStats(filtered);
  setStats(transactionStats);
}, [transactions, filters]);
```

### Связанные файлы
- `frontend/src/pages/Expenses.tsx` - исправлен
- `frontend/src/utils/filterTransactions.ts` - корректная утилита
- `frontend/src/components/TransactionFilter.tsx` - компонент фильтрации
- `TELEGRAM_MINIAPP_FIXES.md` - предыдущие исправления

### Статус
✅ Все исправления применены и задеплоены на production
