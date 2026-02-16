import { io, Socket } from 'socket.io-client';

const SOCKET_URL = (import.meta as any).env?.VITE_API_URL || window.location.origin;

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    console.log('Connecting to WebSocket...', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('connected', (data) => {
      console.log('WebSocket authenticated:', data);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    // Ping-pong для проверки соединения
    setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
      }
    }, 30000); // каждые 30 секунд
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting WebSocket...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Подписка на события транзакций
  onTransactionCreated(callback: (data: any) => void) {
    this.socket?.on('transaction:created', callback);
  }

  onTransactionUpdated(callback: (data: any) => void) {
    this.socket?.on('transaction:updated', callback);
  }

  onTransactionDeleted(callback: (data: any) => void) {
    this.socket?.on('transaction:deleted', callback);
  }

  // Подписка на события категорий
  onCategoryCreated(callback: (data: any) => void) {
    this.socket?.on('category:created', callback);
  }

  onCategoryUpdated(callback: (data: any) => void) {
    this.socket?.on('category:updated', callback);
  }

  onCategoryDeleted(callback: (data: any) => void) {
    this.socket?.on('category:deleted', callback);
  }

  // Подписка на события счетов
  onAccountCreated(callback: (data: any) => void) {
    this.socket?.on('account:created', callback);
  }

  onAccountUpdated(callback: (data: any) => void) {
    this.socket?.on('account:updated', callback);
  }

  onAccountDeleted(callback: (data: any) => void) {
    this.socket?.on('account:deleted', callback);
  }

  // Подписка на события бюджетов
  onBudgetCreated(callback: (data: any) => void) {
    this.socket?.on('budget:created', callback);
  }

  onBudgetUpdated(callback: (data: any) => void) {
    this.socket?.on('budget:updated', callback);
  }

  // Отписка от всех событий
  offAll() {
    if (this.socket) {
      this.socket.off('transaction:created');
      this.socket.off('transaction:updated');
      this.socket.off('transaction:deleted');
      this.socket.off('category:created');
      this.socket.off('category:updated');
      this.socket.off('category:deleted');
      this.socket.off('account:created');
      this.socket.off('account:updated');
      this.socket.off('account:deleted');
      this.socket.off('budget:created');
      this.socket.off('budget:updated');
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
