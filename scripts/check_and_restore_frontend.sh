#!/bin/bash

# Проверка и восстановление frontend

SERVER_USER="root"
SERVER_HOST="85.235.205.99"
SERVER_PATH="/var/www/studiofinance"

echo "=== Проверка frontend ==="

ssh $SERVER_USER@$SERVER_HOST "
# Проверяем наличие dist
if [ -d '$SERVER_PATH/frontend/dist' ]; then
    echo '✓ Frontend dist существует'
    ls -lh '$SERVER_PATH/frontend/dist/' | head -10
else
    echo '✗ Frontend dist отсутствует'
    
    # Ищем бэкап
    BACKUP=\$(ls -td /var/www/studiofinance_backup_* 2>/dev/null | head -1)
    if [ -n \"\$BACKUP\" ] && [ -d \"\$BACKUP\" ]; then
        echo \"Найден бэкап: \$BACKUP\"
        
        # Проверяем есть ли там frontend
        if [ -d \"\$BACKUP/../frontend/dist\" ]; then
            echo 'Восстанавливаем frontend из соседней директории...'
            cp -r \"\$BACKUP/../frontend/dist\" '$SERVER_PATH/frontend/'
        fi
    fi
fi

# Проверяем nginx конфигурацию
echo ''
echo '→ Проверка nginx конфигурации:'
nginx -t

# Перезапускаем nginx
echo ''
echo '→ Перезапуск nginx:'
systemctl restart nginx
systemctl status nginx | head -5

# Проверяем доступность
echo ''
echo '→ Проверка доступности сайта:'
curl -I http://localhost/ 2>&1 | head -5
"

echo ""
echo "Проверьте сайт: https://studiofinance.ru"
