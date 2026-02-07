#!/bin/bash

echo "🧪 Тестирование Telegram Mini App..."

# Проверка переменных окружения
if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "❌ TELEGRAM_BOT_TOKEN не установлен"
    echo "Установите токен: export TELEGRAM_BOT_TOKEN=your_token_here"
    exit 1
fi

if [ -z "$TELEGRAM_WEBHOOK_URL" ]; then
    echo "❌ TELEGRAM_WEBHOOK_URL не установлен"
    echo "Установите URL: export TELEGRAM_WEBHOOK_URL=https://your-domain.com"
    exit 1
fi

echo "✅ TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN:0:10}..."
echo "✅ TELEGRAM_WEBHOOK_URL: $TELEGRAM_WEBHOOK_URL"

# Остановка и пересборка
echo "🔄 Пересборка контейнеров..."
docker-compose down
docker-compose build --no-cache

# Запуск
echo "🚀 Запуск сервисов..."
docker-compose up -d

# Ожидание запуска
echo "⏳ Ожидание запуска..."
sleep 10

# Проверка API
echo "🔍 Проверка API..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ API работает"
else
    echo "❌ API не отвечает"
    docker-compose logs backend
    exit 1
fi

# Проверка фронтенда
echo "🔍 Проверка фронтенда..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend работает"
else
    echo "❌ Frontend не отвечает"
    docker-compose logs frontend
    exit 1
fi

echo ""
echo "🎉 Mini App готов к тестированию!"
echo ""
echo "📱 Для тестирования:"
echo "1. Откройте бота в Telegram"
echo "2. Отправьте /start"
echo "3. Нажмите 'Открыть Crypto Bot'"
echo "4. Должно открыться Mini App внутри Telegram"
echo ""
echo "🌐 Веб-версия: http://localhost:3000"
echo "📊 API: http://localhost:8000/docs"
echo ""
echo "📋 Логи:"
echo "docker-compose logs -f"