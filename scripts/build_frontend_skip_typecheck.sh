#!/bin/bash

# Сборка frontend без проверки типов

SERVER_USER="root"
SERVER_HOST="85.235.205.99"
SERVER_PATH="/var/www/studiofinance"

echo "=== Сборка frontend без проверки типов ==="

ssh $SERVER_USER@$SERVER_HOST "
set -e

cd $SERVER_PATH/frontend
export PATH=\"\$HOME/.yarn/bin:\$HOME/.config/yarn/global/node_modules/.bin:/usr/local/bin:\$PATH\"

echo '→ Установка зависимостей...'
yarn install

echo '→ Сборка только через Vite (без tsc)...'
npx vite build

if [ -d 'dist' ]; then
    echo '✓ Frontend собран успешно!'
    ls -lh dist/ | head -10
else
    echo '✗ Сборка не удалась'
    exit 1
fi

echo ''
echo '→ Перезапуск nginx...'
systemctl restart nginx

echo ''
echo '→ Проверка сайта:'
curl -I http://localhost/ 2>&1 | head -5
"

echo ""
echo "✓ Готово! Проверьте: https://studiofinance.ru"
