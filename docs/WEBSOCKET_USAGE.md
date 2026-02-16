# 🔌 Использование WebSocket для Real-time синхронизации

Это руководство показывает, как использовать WebSocket для real-time синхронизации данных между веб-сайтом и Telegram mini app.

## 📚 Содержание

- [Основы](#основы)
- [Использование в компонентах](#использование-в-компонентах)
- [События](#события)
- [Примеры](#примеры)
- [Best Practices](#best-practices)

## Основы

### Автоматическое подключение

WebSocket автоматически подключается при авторизации пользователя через `AuthContext`:

```typescript
// frontend/src/context/AuthContext.tsx
useEffect(() => {
  const token = localStorage.getItem('token');
  if (user && token) {
    socketService.connect(token);
  }
  
  return () => {
    socketService.offAll();
  };
}, [user]);
```

### Проверка подключения

```typescript
import { socketService } from '../services/socket';

// В любом компоненте
const isConnected = socketService.isConnected();
console.log('WebSocket:', isConnected ? 'Connected' : 'Disconnected');
```

## Использование в компонентах

### Хук useRealtimeSync

Самый простой способ использовать WebSocket - через хук `useRealtimeSync`:

```typescript
import { useRealtimeSync } from '../hooks/useRealtimeSync';

function MyComponent() {
  const { isConnected } = useRealtimeSync({
    onTransactionCreated: (data) => {
      console.log('Новая транзакция:', data);
      // Обновить состояние
    },
    onTransactionUpdated: (data) => {
      console.log('Транзакция обновлена:', data);
    },
    onTransactionDeleted: (data) => {
      console.log('Транзакция удалена:', data);
    }
  });

  return (
    <div>
      <span>WebSocket: {isConnected ? '✅' : '❌'}</span>
    </div>
  );
}
```

### Прямое использование socketService

Для более сложных случаев можно использовать `socketService` напрямую:

```typescript
import { useEffect } from 'react';
import { socketService } from '../services/socket';

function MyComponent() {
  useEffect(() => {
    // Подписаться на события
    const handleTransactionCreated = (data: any) => {
      console.log('Новая транзакция:', data);
    };
    
    socketService.onTransactionCreated(handleTransactionCreated);
    
    // Отписаться при размонтировании
    return () => {
      socketService.offAll();
    };
  }, []);

  return <div>My Component</div>;
}
```

## События

### Транзакции

#### transaction:created
Вызывается при создании новой транзакции.

**Данные:**
```typescript
{
  id: number;
  amount: number;
  description: string;
  category_id?: number;
  transaction_date: string;
  type: 'income' | 'expense';
  timestamp: string;
}
```

**Пример:**
```typescript
socketService.onTransactionCreated((data) => {
  console.log(`Создана транзакция #${data.id}: ${data.amount} ₽`);
  // Обновить список транзакций
  setTransactions(prev => [data, ...prev]);
});
```

#### transaction:updated
Вызывается при обновлении транзакции.

**Данные:**
```typescript
{
  id: number;
  timestamp: string;
}
```

**Пример:**
```typescript
socketService.onTransactionUpdated((data) => {
  console.log(`Обновлена транзакция #${data.id}`);
  // Перезагрузить транзакцию
  fetchTransaction(data.id);
});
```

#### transaction:deleted
Вызывается при удалении транзакции.

**Данные:**
```typescript
{
  id: number;
  timestamp: string;
}
```

**Пример:**
```typescript
socketService.onTransactionDeleted((data) => {
  console.log(`Удалена транзакция #${data.id}`);
  // Удалить из списка
  setTransactions(prev => prev.filter(t => t.id !== data.id));
});
```

### Категории

#### category:created
Вызывается при создании новой категории.

**Данные:**
```typescript
{
  id: number;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  timestamp: string;
}
```

#### category:updated
Вызывается при обновлении категории.

#### category:deleted
Вызывается при удалении категории.

### Счета

#### account:created
Вызывается при создании нового счета.

**Данные:**
```typescript
{
  id: number;
  name: string;
  type: string;
  actual_balance: number;
  timestamp: string;
}
```

#### account:updated
Вызывается при обновлении счета.

#### account:deleted
Вызывается при удалении счета.

### Бюджеты

#### budget:created
Вызывается при создании нового бюджета.

**Данные:**
```typescript
{
  id: number;
  category_id: number;
  limit_amount: number;
  month: number;
  year: number;
  timestamp: string;
}
```

#### budget:updated
Вызывается при обновлении бюджета.

## Примеры

### Пример 1: Страница транзакций с real-time обновлениями

```typescript
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useRealtimeSync } from '../hooks/useRealtimeSync';

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Загрузить транзакции
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    const data = await api.getTransactions();
    setTransactions(data);
    setLoading(false);
  };

  // Real-time синхронизация
  const { isConnected } = useRealtimeSync({
    onTransactionCreated: (data) => {
      // Добавить новую транзакцию в начало списка
      setTransactions(prev => [data, ...prev]);
      
      // Показать уведомление
      showNotification(`Добавлена транзакция: ${data.amount} ₽`);
    },
    
    onTransactionUpdated: (data) => {
      // Перезагрузить транзакцию
      loadTransactions();
    },
    
    onTransactionDeleted: (data) => {
      // Удалить из списка
      setTransactions(prev => prev.filter(t => t.id !== data.id));
    }
  });

  if (loading) return <div>Загрузка...</div>;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h1>Транзакции</h1>
        <span className={isConnected ? 'text-green-500' : 'text-red-500'}>
          {isConnected ? '🟢 Online' : '🔴 Offline'}
        </span>
      </div>
      
      <div className="space-y-2">
        {transactions.map(transaction => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </div>
  );
}
```

### Пример 2: Dashboard с real-time статистикой

```typescript
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useRealtimeSync } from '../hooks/useRealtimeSync';

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const data = await api.getDashboardStats();
    setStats(data);
  };

  // Обновлять статистику при любых изменениях
  useRealtimeSync({
    onTransactionCreated: () => loadStats(),
    onTransactionUpdated: () => loadStats(),
    onTransactionDeleted: () => loadStats(),
    onAccountUpdated: () => loadStats()
  });

  if (!stats) return <div>Загрузка...</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Баланс" value={stats.balance} />
        <StatCard title="Доходы" value={stats.totalIncome} />
        <StatCard title="Расходы" value={stats.totalExpense} />
      </div>
    </div>
  );
}
```

### Пример 3: Уведомления о новых транзакциях

```typescript
import { useEffect } from 'react';
import { socketService } from '../services/socket';
import { toast } from 'react-toastify'; // или любая библиотека уведомлений

function NotificationProvider({ children }) {
  useEffect(() => {
    socketService.onTransactionCreated((data) => {
      const type = data.type === 'income' ? '💰' : '💸';
      const message = `${type} ${data.description}: ${data.amount} ₽`;
      
      toast.success(message, {
        position: 'top-right',
        autoClose: 3000
      });
    });

    return () => {
      socketService.offAll();
    };
  }, []);

  return <>{children}</>;
}
```

### Пример 4: Индикатор подключения

```typescript
import { useState, useEffect } from 'react';
import { socketService } from '../services/socket';

function ConnectionIndicator() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Проверять подключение каждую секунду
    const interval = setInterval(() => {
      setIsConnected(socketService.isConnected());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center gap-2 ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
      <span className="text-sm">
        {isConnected ? 'Подключено' : 'Отключено'}
      </span>
    </div>
  );
}
```

## Best Practices

### 1. Всегда отписывайтесь от событий

```typescript
useEffect(() => {
  const handler = (data) => console.log(data);
  socketService.onTransactionCreated(handler);
  
  // ✅ Правильно: отписываемся при размонтировании
  return () => {
    socketService.offAll();
  };
}, []);
```

### 2. Используйте debounce для частых обновлений

```typescript
import { debounce } from 'lodash';

const debouncedLoadStats = debounce(loadStats, 500);

useRealtimeSync({
  onTransactionCreated: () => debouncedLoadStats(),
  onTransactionUpdated: () => debouncedLoadStats(),
  onTransactionDeleted: () => debouncedLoadStats()
});
```

### 3. Показывайте статус подключения

```typescript
const { isConnected } = useRealtimeSync({...});

return (
  <div>
    {!isConnected && (
      <div className="bg-yellow-100 p-2 text-center">
        ⚠️ Нет подключения к серверу. Данные могут быть неактуальными.
      </div>
    )}
    {/* Остальной контент */}
  </div>
);
```

### 4. Обрабатывайте ошибки

```typescript
useEffect(() => {
  socketService.onTransactionCreated((data) => {
    try {
      // Обработка данных
      setTransactions(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error handling transaction:', error);
      // Показать уведомление об ошибке
    }
  });
}, []);
```

### 5. Оптимизируйте обновления

```typescript
// ❌ Плохо: перезагружаем все данные
onTransactionCreated: () => loadAllData()

// ✅ Хорошо: обновляем только нужное
onTransactionCreated: (data) => {
  setTransactions(prev => [data, ...prev]);
  setStats(prev => ({
    ...prev,
    balance: prev.balance + data.amount
  }));
}
```

## 🐛 Troubleshooting

### WebSocket не подключается

1. Проверьте, что пользователь авторизован
2. Проверьте токен в localStorage
3. Проверьте CORS настройки
4. Откройте DevTools → Network → WS

### События не приходят

1. Проверьте, что вы подписались на события
2. Проверьте, что не отписались раньше времени
3. Проверьте логи сервера

### Дублирование событий

1. Убедитесь, что отписываетесь в cleanup функции
2. Используйте `useEffect` с правильными зависимостями
3. Проверьте, что не подписываетесь несколько раз

## 📚 Дополнительные ресурсы

- [Socket.io Client API](https://socket.io/docs/v4/client-api/)
- [React Hooks](https://react.dev/reference/react)
- [IMPROVEMENTS.md](IMPROVEMENTS.md)

## 💬 Поддержка

Если возникли вопросы:
1. Проверьте логи в DevTools Console
2. Проверьте Network → WS вкладку
3. Создайте issue в репозитории
