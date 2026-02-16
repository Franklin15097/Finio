import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { socketService } from '../services/socket';

interface WebSocketStatusProps {
  showDetailed?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  autoHide?: boolean;
  hideTimeout?: number;
}

const WebSocketStatus: React.FC<WebSocketStatusProps> = ({
  showDetailed = false,
  position = 'top-right',
  autoHide = false,
  hideTimeout = 3000
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastPing, setLastPing] = useState<number | null>(null);
  const [showStatus, setShowStatus] = useState(true);
  const [connectionTime, setConnectionTime] = useState<Date | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  useEffect(() => {
    const checkConnection = () => {
      const connected = socketService.isConnected();
      setIsConnected(connected);
      
      if (connected && !connectionTime) {
        setConnectionTime(new Date());
        setReconnectAttempts(0);
      } else if (!connected && connectionTime) {
        setConnectionTime(null);
        setReconnectAttempts(prev => prev + 1);
      }
    };

    // Проверяем соединение каждую секунду
    const interval = setInterval(checkConnection, 1000);
    checkConnection(); // Первоначальная проверка

    // Слушаем события WebSocket
    const handleConnect = () => {
      setIsConnected(true);
      setConnectionTime(new Date());
      setReconnectAttempts(0);
      if (autoHide) {
        setShowStatus(true);
        setTimeout(() => setShowStatus(false), hideTimeout);
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setConnectionTime(null);
      setShowStatus(true);
    };

    // В реальном приложении здесь нужно подписаться на события socket.io
    // socketService.on('connect', handleConnect);
    // socketService.on('disconnect', handleDisconnect);

    return () => {
      clearInterval(interval);
      // socketService.off('connect', handleConnect);
      // socketService.off('disconnect', handleDisconnect);
    };
  }, [autoHide, hideTimeout, connectionTime]);

  const getConnectionDuration = () => {
    if (!connectionTime) return null;
    
    const now = new Date();
    const diffMs = now.getTime() - connectionTime.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) {
      return `${diffSec} сек`;
    } else if (diffSec < 3600) {
      return `${Math.floor(diffSec / 60)} мин`;
    } else {
      return `${Math.floor(diffSec / 3600)} ч`;
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  const handleReconnect = () => {
    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);
    }
  };

  if (!showStatus && autoHide) {
    return null;
  }

  const connectionDuration = getConnectionDuration();

  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      {showDetailed ? (
        // Подробный статус
        <div className={`backdrop-blur-xl rounded-xl p-4 border shadow-lg transition-all duration-300 ${
          isConnected
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="w-5 h-5 text-green-400" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-400" />
              )}
              <span className={`text-sm font-medium ${
                isConnected ? 'text-green-400' : 'text-red-400'
              }`}>
                {isConnected ? 'Подключено' : 'Отключено'}
              </span>
            </div>
            <button
              onClick={() => setShowStatus(false)}
              className="text-gray-400 hover:text-gray-300"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2 text-xs text-gray-300">
            {isConnected ? (
              <>
                <div className="flex items-center justify-between">
                  <span>Статус:</span>
                  <span className="text-green-400 font-medium">Активно</span>
                </div>
                {connectionDuration && (
                  <div className="flex items-center justify-between">
                    <span>Время работы:</span>
                    <span>{connectionDuration}</span>
                  </div>
                )}
                {lastPing && (
                  <div className="flex items-center justify-between">
                    <span>Последний пинг:</span>
                    <span>{lastPing} мс</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span>Статус:</span>
                  <span className="text-red-400 font-medium">Неактивно</span>
                </div>
                {reconnectAttempts > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Попыток переподключения:</span>
                    <span>{reconnectAttempts}</span>
                  </div>
                )}
                <div className="pt-2">
                  <button
                    onClick={handleReconnect}
                    className="w-full px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Переподключиться
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        // Компактный статус
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-xl border shadow-lg transition-all duration-300 cursor-pointer hover:opacity-90 ${
            isConnected
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}
          onClick={() => setShowStatus(prev => !prev)}
          title={isConnected ? 'WebSocket подключен' : 'WebSocket отключен'}
        >
          {isConnected ? (
            <>
              <div className="relative">
                <Wifi className="w-4 h-4 text-green-400" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
              <span className="text-xs text-green-400 font-medium">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-400 font-medium">Offline</span>
            </>
          )}
        </div>
      )}
      
      {/* Уведомление при изменении статуса */}
      {!showDetailed && (
        <div className={`absolute ${position.includes('right') ? '-left-2' : '-right-2'} top-1/2 transform -translate-y-1/2`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            isConnected ? 'bg-green-400' : 'bg-red-400'
          }`} />
        </div>
      )}
    </div>
  );
};

// Хук для использования статуса WebSocket в компонентах
export const useWebSocketStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const checkConnection = () => {
      const connected = socketService.isConnected();
      setIsConnected(connected);
      if (connected) {
        setLastUpdate(new Date());
      }
    };

    const interval = setInterval(checkConnection, 5000);
    checkConnection();

    return () => clearInterval(interval);
  }, []);

  const reconnect = () => {
    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);
    }
  };

  return {
    isConnected,
    lastUpdate,
    reconnect,
    getStatusText: () => isConnected ? 'Подключено' : 'Отключено',
    getStatusColor: () => isConnected ? 'text-green-400' : 'text-red-400',
    getStatusIcon: () => isConnected ? CheckCircle : XCircle
  };
};

export default WebSocketStatus;