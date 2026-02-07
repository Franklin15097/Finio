#!/bin/bash

echo "🔧 Исправление деплоя Studio Finance"
echo "======================================"

# Переходим в директорию проекта
cd /var/www/studiofinance

# Останавливаем и удаляем старые процессы
echo "🛑 Остановка старых процессов..."
pm2 delete all 2>/dev/null || true

# Проверяем структуру проекта
echo ""
echo "📁 Проверка структуры проекта..."
ls -la

# Запускаем Backend
echo ""
echo "🚀 Запуск Backend сервера..."
cd server
pm2 start index.js --name studiofinance-backend --log /var/www/studiofinance/logs/backend.log --error /var/www/studiofinance/logs/backend-error.log
cd ..

# Ждем 3 секунды
sleep 3

# Проверяем статус Backend
echo ""
echo "📊 Статус Backend:"
pm2 status studiofinance-backend

# Запускаем Mini App с правильной конфигурацией
echo ""
echo "🚀 Запуск Mini App..."
cd mini-app-frontend
pm2 start npm --name studiofinance-miniapp -- run dev -- --host 0.0.0.0 --port 5173
cd ..

# Запускаем Website с правильной конфигурацией
echo ""
echo "🚀 Запуск Website..."
cd website-frontend
pm2 start npm --name studiofinance-website -- run dev -- --host 0.0.0.0 --port 5174
cd ..

# Сохраняем конфигурацию PM2
pm2 save

echo ""
echo "✅ Запуск завершен!"
echo ""
echo "📊 Статус всех сервисов:"
pm2 status

echo ""
echo "📝 Просмотр логов:"
echo "  pm2 logs studiofinance-backend"
echo "  pm2 logs studiofinance-miniapp"
echo "  pm2 logs studiofinance-website"

echo ""
echo "🧪 Тест Backend:"
curl -s http://localhost:3000/health || echo "Backend не отвечает"
