#!/bin/bash

echo "🔥 ПОЛНАЯ ОЧИСТКА СЕРВЕРА ОТ FINIO"
echo "=================================="
echo "⚠️  ВНИМАНИЕ: Это удалит ВСЕ данные Finio!"
echo "⚠️  Продолжить? (y/N)"
read -p "> " confirm

if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "❌ Очистка отменена"
    exit 0
fi

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Запустите скрипт с правами root: sudo $0"
    exit 1
fi

echo "🛑 1. Остановка всех сервисов..."
systemctl stop finio* 2>/dev/null || true
systemctl stop nginx 2>/dev/null || true

echo "🗑️ 2. Удаление systemd сервисов..."
rm -f /etc/systemd/system/finio* 2>/dev/null || true
systemctl daemon-reload

echo "🔪 3. Убийство всех процессов..."
pkill -f python 2>/dev/null || true
pkill -f uvicorn 2>/dev/null || true
pkill -f gunicorn 2>/dev/null || true
pkill -f node 2>/dev/null || true
pkill -f npm 2>/dev/null || true

echo "🔪 4. Освобождение портов..."
fuser -k 8000/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 3306/tcp 2>/dev/null || true

echo "🐳 5. Полная очистка Docker..."
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true
docker rmi $(docker images -q) -f 2>/dev/null || true
docker volume rm $(docker volume ls -q) -f 2>/dev/null || true
docker network rm $(docker network ls -q) 2>/dev/null || true
docker system prune -af --volumes 2>/dev/null || true

echo "🗑️ 6. Удаление всех директорий проекта..."
rm -rf /var/www/crypto-bot 2>/dev/null || true
rm -rf /var/www/finio 2>/dev/null || true
rm -rf /home/finio 2>/dev/null || true
rm -rf /opt/finio 2>/dev/null || true
rm -rf /usr/local/finio 2>/dev/null || true

echo "🗑️ 7. Удаление пользователей..."
userdel -r finio 2>/dev/null || true

echo "🗑️ 8. Удаление логов..."
rm -rf /var/log/finio 2>/dev/null || true
rm -rf /var/log/crypto-bot 2>/dev/null || true

echo "🗑️ 9. Очистка nginx конфигурации..."
rm -f /etc/nginx/sites-enabled/finio* 2>/dev/null || true
rm -f /etc/nginx/sites-available/finio* 2>/dev/null || true
nginx -s reload 2>/dev/null || true

echo "🗑️ 10. Удаление cron задач..."
crontab -r 2>/dev/null || true

echo "🧹 11. Очистка временных файлов..."
rm -rf /tmp/finio* 2>/dev/null || true
rm -rf /tmp/crypto-bot* 2>/dev/null || true

echo "🔍 12. Проверка оставшихся процессов..."
REMAINING=$(ps aux | grep -E "(finio|crypto-bot)" | grep -v grep | wc -l)
if [ $REMAINING -gt 0 ]; then
    echo "⚠️  Найдены оставшиеся процессы:"
    ps aux | grep -E "(finio|crypto-bot)" | grep -v grep
else
    echo "✅ Все процессы очищены"
fi

echo "🔍 13. Проверка портов..."
PORTS_USED=$(netstat -tulpn 2>/dev/null | grep -E ":8000|:3000|:3306" | wc -l)
if [ $PORTS_USED -gt 0 ]; then
    echo "⚠️  Порты все еще заняты:"
    netstat -tulpn 2>/dev/null | grep -E ":8000|:3000|:3306"
else
    echo "✅ Все порты освобождены"
fi

echo ""
echo "🎉 ПОЛНАЯ ОЧИСТКА ЗАВЕРШЕНА!"
echo ""
echo "🚀 Для установки Finio заново выполните:"
echo "curl -sSL https://raw.githubusercontent.com/Franklin15097/Finio/main/start.sh -o start.sh && chmod +x start.sh && sudo ./start.sh"
echo ""
echo "💾 Все данные удалены безвозвратно!"