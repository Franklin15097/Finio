#!/bin/bash

echo "📋 ПРОВЕРКА ЛОГОВ"
echo "================="

echo ""
echo "1️⃣ Последние 50 строк логов сервиса:"
journalctl -u finio --no-pager -n 50

echo ""
echo "2️⃣ Попытка запуска вручную для проверки ошибок:"
cd /opt/Finio/server
sudo -u finio node index.js 2>&1 | head -20

echo ""
echo "3️⃣ Проверка PostgreSQL:"
sudo -u postgres psql -c "\l" | grep finio
sudo -u postgres psql -d finio -c "\dt"

echo ""
echo "4️⃣ Проверка подключения к БД:"
sudo -u postgres psql -d finio -c "SELECT version();"

echo ""
echo "✅ Проверка завершена"
