#!/bin/bash

# Запуск сервисов после сборки

SERVER_USER="root"
SERVER_HOST="85.235.205.99"
SERVER_PATH="/var/www/studiofinance"

echo "Запуск сервисов..."

ssh $SERVER_USER@$SERVER_HOST "
cd $SERVER_PATH/backend

echo '→ Запуск Backend...'
pm2 start dist/index.js --name finio-backend --node-args='--max-old-space-size=1024'

echo '→ Запуск Bot...'
pm2 start dist/bot.js --name finio-bot --node-args='--max-old-space-size=512'

echo '→ Сохранение конфигурации PM2...'
pm2 save

echo '→ Статус сервисов:'
pm2 status

echo ''
echo '→ Логи Backend (последние 30 строк):'
pm2 logs finio-backend --lines 30 --nostream

echo ''
echo '→ Проверка Redis:'
redis-cli ping

echo ''
echo '→ Проверка Backend API:'
sleep 2
curl -f http://localhost:5000/api/health || echo 'Backend не отвечает'
"

echo ""
echo "✓ Сервисы запущены!"
echo "Сайт: https://studiofinance.ru"
