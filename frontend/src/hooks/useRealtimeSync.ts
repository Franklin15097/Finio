import { useEffect, useCallback } from 'react';
import { socketService } from '../services/socket';

interface UseRealtimeSyncOptions {
  onTransactionCreated?: (data: any) => void;
  onTransactionUpdated?: (data: any) => void;
  onTransactionDeleted?: (data: any) => void;
  onCategoryCreated?: (data: any) => void;
  onCategoryUpdated?: (data: any) => void;
  onCategoryDeleted?: (data: any) => void;
  onAccountCreated?: (data: any) => void;
  onAccountUpdated?: (data: any) => void;
  onAccountDeleted?: (data: any) => void;
  onBudgetCreated?: (data: any) => void;
  onBudgetUpdated?: (data: any) => void;
}

/**
 * Хук для real-time синхронизации данных через WebSocket
 * Автоматически подписывается на события и отписывается при размонтировании
 */
export function useRealtimeSync(options: UseRealtimeSyncOptions) {
  const {
    onTransactionCreated,
    onTransactionUpdated,
    onTransactionDeleted,
    onCategoryCreated,
    onCategoryUpdated,
    onCategoryDeleted,
    onAccountCreated,
    onAccountUpdated,
    onAccountDeleted,
    onBudgetCreated,
    onBudgetUpdated
  } = options;

  useEffect(() => {
    // Подписываемся на события транзакций
    if (onTransactionCreated) {
      socketService.onTransactionCreated(onTransactionCreated);
    }
    if (onTransactionUpdated) {
      socketService.onTransactionUpdated(onTransactionUpdated);
    }
    if (onTransactionDeleted) {
      socketService.onTransactionDeleted(onTransactionDeleted);
    }

    // Подписываемся на события категорий
    if (onCategoryCreated) {
      socketService.onCategoryCreated(onCategoryCreated);
    }
    if (onCategoryUpdated) {
      socketService.onCategoryUpdated(onCategoryUpdated);
    }
    if (onCategoryDeleted) {
      socketService.onCategoryDeleted(onCategoryDeleted);
    }

    // Подписываемся на события счетов
    if (onAccountCreated) {
      socketService.onAccountCreated(onAccountCreated);
    }
    if (onAccountUpdated) {
      socketService.onAccountUpdated(onAccountUpdated);
    }
    if (onAccountDeleted) {
      socketService.onAccountDeleted(onAccountDeleted);
    }

    // Подписываемся на события бюджетов
    if (onBudgetCreated) {
      socketService.onBudgetCreated(onBudgetCreated);
    }
    if (onBudgetUpdated) {
      socketService.onBudgetUpdated(onBudgetUpdated);
    }

    // Отписываемся при размонтировании
    return () => {
      socketService.offAll();
    };
  }, [
    onTransactionCreated,
    onTransactionUpdated,
    onTransactionDeleted,
    onCategoryCreated,
    onCategoryUpdated,
    onCategoryDeleted,
    onAccountCreated,
    onAccountUpdated,
    onAccountDeleted,
    onBudgetCreated,
    onBudgetUpdated
  ]);

  return {
    isConnected: socketService.isConnected()
  };
}
