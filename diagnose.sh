#!/bin/bash

echo "🔍 ДИАГНОСТИКА ПРОБЛЕМЫ 502"
echo "=========================="

echo ""
echo "1️⃣ Статус сервиса Finio:"
systemctl status finio --no-pager -l

echo ""
echo "2️⃣ Последние 30 строк логов:"
journalctl -u finio --no-pager -n 30

echo ""
echo "3️⃣ Проверка порта 3000:"
netstat -tlnp | grep :3000 || echo "❌ Порт 3000 не слушается!"

echo ""
echo "4️⃣ Проверка процессов Node:"
ps aux | grep node

echo ""
echo "5️⃣ Проверка файлов проекта:"
ls -la /opt/Finio/server/

echo ""
echo "6️⃣ Проверка .env файла:"
cat /opt/Finio/server/.env

echo ""
echo "7️⃣ Проверка зависимостей:"
cd /opt/Finio/server && npm list --depth=0

echo ""
echo "8️⃣ Попытка запуска вручную:"
cd /opt/Finio/server && node index.js &
sleep 5
echo "Проверка после запуска:"
netstat -tlnp | grep :3000

echo ""
echo "✅ Диагностика завершена"
