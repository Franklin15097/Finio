#!/bin/bash

echo "🔥 ПОЛНАЯ ПЕРЕУСТАНОВКА ПРОЕКТА С НУЛЯ..."

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Запустите скрипт с правами root: sudo $0"
    exit 1
fi

echo "1. 🛑 Остановка ВСЕХ сервисов..."
systemctl stop finio 2>/dev/null || echo "Сервис finio не найден"
systemctl stop finio-bot 2>/dev/null || echo "Сервис finio-bot не найден"
systemctl stop nginx 2>/dev/null || echo "Nginx не найден"

echo "2. 🗑️ Удаление ВСЕХ файлов сервисов..."
rm -f /etc/systemd/system/finio* 2>/dev/null
systemctl daemon-reload

echo "3. 🔪 Убийство ВСЕХ процессов..."
pkill -f python 2>/dev/null || echo "Python процессы не найдены"
pkill -f uvicorn 2>/dev/null || echo "Uvicorn процессы не найдены"
pkill -f gunicorn 2>/dev/null || echo "Gunicorn процессы не найдены"
pkill -f node 2>/dev/null || echo "Node процессы не найдены"

echo "4. 🔪 Освобождение портов..."
fuser -k 8000/tcp 2>/dev/null || echo "Порт 8000 свободен"
fuser -k 3000/tcp 2>/dev/null || echo "Порт 3000 свободен"
fuser -k 80/tcp 2>/dev/null || echo "Порт 80 свободен"

echo "5. 🗑️ Удаление ВСЕХ директорий проекта..."
rm -rf /var/www/crypto-bot 2>/dev/null || echo "crypto-bot не найден"
rm -rf /var/www/finio 2>/dev/null || echo "finio не найден"
rm -rf /home/finio 2>/dev/null || echo "home/finio не найден"
rm -rf /opt/finio 2>/dev/null || echo "opt/finio не найден"

echo "6. 🗑️ Удаление пользователя finio..."
userdel -r finio 2>/dev/null || echo "Пользователь finio не найден"

echo "7. 🧹 Полная очистка Docker..."
docker stop $(docker ps -aq) 2>/dev/null || echo "Контейнеры не найдены"
docker rm $(docker ps -aq) 2>/dev/null || echo "Контейнеры для удаления не найдены"
docker rmi $(docker images -q) -f 2>/dev/null || echo "Образы не найдены"
docker system prune -af --volumes 2>/dev/null || echo "Нечего очищать"

echo "8. 🗑️ Удаление логов..."
rm -rf /var/log/finio 2>/dev/null || echo "Логи не найдены"

echo "9. 📥 Клонирование ЧИСТОГО репозитория..."
cd /var/www
git clone https://github.com/Franklin15097/Finio.git crypto-bot
cd crypto-bot

echo "10. 🔐 Установка прав..."
chown -R root:root /var/www/crypto-bot
chmod -R 755 /var/www/crypto-bot

echo "11. 🔨 Установка Docker если нужно..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
fi

if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

echo "12. 🔨 Сборка контейнеров..."
docker-compose build --no-cache --pull

echo "13. 🚀 Запуск сервисов..."
docker-compose up -d

echo "14. ⏳ Ожидание запуска (30 секунд)..."
sleep 30

echo "15. 🔍 Проверка работы..."
docker-compose ps
echo ""
echo "API Health: $(curl -s http://localhost:8000/health | jq -r .status 2>/dev/null || echo 'Не отвечает')"
echo "Bot Status: $(curl -s http://localhost:8000/bot-status | jq -r .bot_initialized 2>/dev/null || echo 'Не отвечает')"

echo ""
echo "🎉 ПОЛНАЯ ПЕРЕУСТАНОВКА ЗАВЕРШЕНА!"
echo ""
echo "📱 Теперь бот должен показывать ТОЛЬКО одну кнопку:"
echo "   💰 Открыть Finio → https://t.me/FinanceStudio_bot/Finio"
echo ""
echo "🔍 Для проверки отправьте /start боту в Telegram"
echo "📋 Логи: docker-compose logs -f backend"