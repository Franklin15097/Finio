#!/bin/bash

echo "🚀 ПОЛНАЯ ПЕРЕУСТАНОВКА TELEGRAM MINI APP..."

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Запустите скрипт с правами root: sudo $0"
    exit 1
fi

# Установка Docker и Docker Compose если не установлены
if ! command -v docker &> /dev/null; then
    echo "📦 Установка Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
fi

if ! command -v docker-compose &> /dev/null; then
    echo "📦 Установка Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Проверка установки
echo "🔍 Проверка Docker..."
docker --version
docker-compose --version

# ПОЛНОЕ УДАЛЕНИЕ старой установки
echo "🗑️ Удаление старой установки..."
if [ -d "/var/www/crypto-bot" ]; then
    cd /var/www/crypto-bot
    docker-compose down --remove-orphans --volumes || true
    cd /var/www
    rm -rf crypto-bot
fi

# Очистка Docker
echo "🧹 Очистка Docker..."
docker system prune -af --volumes || true

# Клонирование репозитория заново
echo "📥 Клонирование репозитория..."
cd /var/www
git clone https://github.com/Franklin15097/Finio.git crypto-bot
cd crypto-bot

# Установка правильных прав
echo "🔐 Установка прав доступа..."
chown -R root:root /var/www/crypto-bot
chmod -R 755 /var/www/crypto-bot

# Пересборка всех контейнеров с нуля
echo "🔨 Сборка контейнеров с нуля..."
docker-compose build --no-cache --pull

# Запуск всех сервисов
echo "🚀 Запуск сервисов..."
docker-compose up -d

# Ожидание запуска
echo "⏳ Ожидание запуска сервисов (30 секунд)..."
sleep 30

# Проверка статуса
echo "📊 Проверка статуса сервисов..."
docker-compose ps

# Проверка API
echo "🔍 Проверка работы API..."
sleep 5
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend API работает"
else
    echo "❌ Backend API не отвечает, проверяем логи..."
    docker-compose logs backend | tail -20
fi

# Проверка статуса бота
echo "🔍 Проверка статуса бота..."
if curl -f http://localhost:8000/bot-status > /dev/null 2>&1; then
    echo "✅ Bot status endpoint работает"
    curl -s http://localhost:8000/bot-status | jq . || echo "Ответ получен"
else
    echo "❌ Bot status не отвечает"
fi

# Проверка фронтенда
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend работает"
else
    echo "❌ Frontend не отвечает, проверяем логи..."
    docker-compose logs frontend | tail -20
fi

# Тест webhook
echo "🔍 Тест webhook..."
curl -s -X POST http://localhost:8000/bot-webhook/ \
  -H "Content-Type: application/json" \
  -d '{"update_id": 999, "message": {"message_id": 1, "date": 1234567890, "chat": {"id": 123, "type": "private"}, "from": {"id": 123, "is_bot": false, "first_name": "Test"}, "text": "/start"}}' \
  | jq . || echo "Webhook тест выполнен"

echo ""
echo "🎉 ПОЛНАЯ ПЕРЕУСТАНОВКА ЗАВЕРШЕНА!"
echo ""
echo "📱 Telegram Mini App настроен:"
echo "• Бот: @FinanceStudio_bot"
echo "• Mini App: https://t.me/FinanceStudio_bot/Finio"
echo ""
echo "🌐 Веб-сайт: https://studiofinance.ru"
echo "📊 API: https://studiofinance.ru/api"
echo ""
echo "📋 Управление:"
echo "docker-compose logs -f backend   # Логи бэкенда"
echo "docker-compose logs -f frontend  # Логи фронтенда"
echo "docker-compose restart          # Перезапуск всех сервисов"
echo "docker-compose ps               # Статус сервисов"
echo ""
echo "🔧 Если что-то не работает:"
echo "1. Проверьте логи: docker-compose logs backend"
echo "2. Проверьте переменные: docker-compose exec backend env | grep TELEGRAM"
echo "3. Перезапустите: docker-compose restart backend"