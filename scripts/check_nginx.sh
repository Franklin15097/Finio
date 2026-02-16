#!/bin/bash

# Проверка конфигурации nginx

SERVER_USER="root"
SERVER_HOST="85.235.205.99"

echo "=== Проверка nginx ==="

ssh $SERVER_USER@$SERVER_HOST "
echo '→ Проверка конфигурации сайта:'
if [ -f /etc/nginx/sites-available/studiofinance ]; then
    cat /etc/nginx/sites-available/studiofinance
else
    echo 'Конфигурация не найдена!'
    echo ''
    echo 'Доступные конфигурации:'
    ls -la /etc/nginx/sites-available/
    echo ''
    echo 'Включенные конфигурации:'
    ls -la /etc/nginx/sites-enabled/
fi

echo ''
echo '→ Проверка директории frontend:'
ls -la /var/www/studiofinance/frontend/dist/

echo ''
echo '→ Проверка default конфигурации:'
cat /etc/nginx/sites-enabled/default | head -30
"
