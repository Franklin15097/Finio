#!/bin/bash

echo "🚀 Studio Finance - Установка и запуск"
echo "======================================"

# Остановка старых процессов
pm2 delete all 2>/dev/null || true

# Установка зависимостей
echo "📦 Установка зависимостей..."
cd server && npm install && cd ..
cd mini-app-frontend && npm install && cd ..
cd website-frontend && npm install && cd ..

# Запуск сервисов
echo "🚀 Запуск сервисов..."
cd server
pm2 start index.js --name backend --node-args="--max-old-space-size=512"
cd ..

cd mini-app-frontend
pm2 start npm --name miniapp -- run dev
cd ..

cd website-frontend
pm2 start npm --name website -- run dev
cd ..

pm2 save
pm2 startup

echo ""
echo "✅ Готово!"
echo ""
echo "Проверка:"
echo "  pm2 status"
echo "  pm2 logs"
echo ""
echo "URLs:"
echo "  Backend:  http://85.235.205.99:3000/health"
echo "  Mini App: http://studiofinance.ru:5173"
echo "  Website:  http://studiofinance.ru:5174"
