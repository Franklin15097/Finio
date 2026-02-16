#!/bin/bash

# Восстановление рабочей версии и сборка

SERVER_USER="root"
SERVER_HOST="85.235.205.99"
SERVER_PATH="/var/www/studiofinance"

echo "=== Восстановление рабочей версии ==="

ssh $SERVER_USER@$SERVER_HOST "
set -e

cd $SERVER_PATH

echo '→ Остановка сервисов...'
pm2 stop all

echo '→ Откат к рабочей версии...'
git fetch origin
git reset --hard origin/main
git clean -fd

echo '→ Установка зависимостей Backend...'
cd backend
export PATH=\"\$HOME/.yarn/bin:\$HOME/.config/yarn/global/node_modules/.bin:/usr/local/bin:\$PATH\"
yarn install
yarn add morgan winston @types/morgan

echo '→ Сборка Backend...'
yarn build

echo '→ Установка зависимостей Frontend...'
cd ../frontend
yarn install

echo '→ Сборка Frontend...'
yarn build

if [ ! -d 'dist' ]; then
    echo '✗ Frontend не собрался, используем старую версию'
else
    echo '✓ Frontend собран успешно'
fi

echo '→ Перезапуск сервисов...'
cd ../backend
pm2 restart all || pm2 start dist/index.js --name finio-backend
pm2 restart finio-bot || pm2 start dist/bot.js --name finio-bot
pm2 save

echo '→ Статус:'
pm2 status

echo '→ Проверка Redis:'
redis-cli ping

echo '→ Логи Backend:'
pm2 logs finio-backend --lines 20 --nostream
"

echo ""
echo "✓ Восстановление завершено!"
echo "Сайт: https://studiofinance.ru"
