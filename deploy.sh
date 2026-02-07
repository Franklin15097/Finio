#!/bin/bash

echo "🚀 Деплой Studio Finance на сервер..."
echo ""

# Установка зависимостей
echo "📦 Установка зависимостей..."
npm install --production

# Проверка PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 Установка PM2..."
    npm install -g pm2
fi

# Остановка старых процессов
echo "🛑 Остановка старых процессов..."
pm2 stop studiofinance-server 2>/dev/null || true
pm2 stop studiofinance-bot 2>/dev/null || true
pm2 delete studiofinance-server 2>/dev/null || true
pm2 delete studiofinance-bot 2>/dev/null || true

# Запуск сервера
echo "🚀 Запуск сервера..."
pm2 start server.js --name studiofinance-server

# Запуск бота
echo "🤖 Запуск бота..."
pm2 start bot.js --name studiofinance-bot

# Сохранение конфигурации PM2
pm2 save

# Настройка автозапуска
pm2 startup

echo ""
echo "✅ Деплой завершен!"
echo ""
echo "Управление процессами:"
echo "  pm2 status              - статус процессов"
echo "  pm2 logs                - логи всех процессов"
echo "  pm2 logs studiofinance-server  - логи сервера"
echo "  pm2 logs studiofinance-bot     - логи бота"
echo "  pm2 restart all         - перезапуск всех процессов"
echo "  pm2 stop all            - остановка всех процессов"
echo ""
