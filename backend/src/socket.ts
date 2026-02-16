import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface SocketData {
  userId: number;
}

export function setupSocket(server: HTTPServer) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  // Аутентификация при подключении
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication required'));
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      (socket.data as SocketData).userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket.data as SocketData).userId;
    console.log(`✅ User ${userId} connected via WebSocket`);
    
    // Присоединить пользователя к его личной комнате
    socket.join(`user:${userId}`);
    
    // Отправить подтверждение подключения
    socket.emit('connected', { userId, timestamp: new Date().toISOString() });
    
    socket.on('disconnect', () => {
      console.log(`❌ User ${userId} disconnected`);
    });
    
    // Обработка ping для проверки соединения
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });
  });

  console.log('🔌 WebSocket server initialized');
  return io;
}

// Типы событий для синхронизации
export interface TransactionEvent {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category_id?: number;
  transaction_date: string;
}

export interface CategoryEvent {
  id: number;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}

export interface AccountEvent {
  id: number;
  name: string;
  type: string;
  actual_balance: number;
}

export interface BudgetEvent {
  id: number;
  category_id: number;
  limit_amount: number;
  month: number;
  year: number;
}
