#!/bin/bash

echo "==================================="
echo "Studio Finance - Запуск проекта"
echo "==================================="

# Создаем директорию для логов
mkdir -p logs

# Запуск сервера
echo "🚀 Запуск Backend сервера..."
cd server
node index.js > ../logs/server.log 2>&1 &
SERVER_PID=$!
echo "Backend PID: $SERVER_PID"
cd ..

# Ждем запуска сервера
sleep 3

# Запуск Mini App Frontend
echo "🚀 Запуск Mini App Frontend..."
cd mini-app-frontend
npm run dev > ../logs/mini-app.log 2>&1 &
MINIAPP_PID=$!
echo "Mini App PID: $MINIAPP_PID"
cd ..

# Запуск Website Frontend
echo "🚀 Запуск Website Frontend..."
cd website-frontend
npm run dev > ../logs/website.log 2>&1 &
WEBSITE_PID=$!
echo "Website PID: $WEBSITE_PID"
cd ..

# Сохраняем PIDs
echo $SERVER_PID > logs/server.pid
echo $MINIAPP_PID > logs/miniapp.pid
echo $WEBSITE_PID > logs/website.pid

echo ""
echo "✅ Все сервисы запущены!"
echo ""
echo "📊 Сервисы:"
echo "  Backend:     http://localhost:3000"
echo "  Mini App:    http://localhost:5173"
echo "  Website:     http://localhost:5174"
echo ""
echo "📝 Логи в папке: logs/"
echo "🛑 Остановка: ./stop.sh"
