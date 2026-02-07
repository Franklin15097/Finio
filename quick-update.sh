#!/bin/bash

echo "🔄 Быстрое обновление бота..."

# Переход в директорию проекта
cd /var/www/crypto-bot || {
    echo "❌ Директория проекта не найдена"
    exit 1
}

# Обновление кода из GitHub
echo "📥 Обновление кода..."
git pull origin main

# Перезапуск только backend контейнера
echo "🔄 Перезапуск backend..."
docker-compose restart backend

# Ожидание запуска
echo "⏳ Ожидание запуска..."
sleep 5

# Проверка статуса
echo "📊 Проверка статуса..."
docker-compose ps backend

# Проверка API
echo "🔍 Проверка API..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend обновлен и работает"
else
    echo "❌ Backend не отвечает, проверяем логи..."
    docker-compose logs backend | tail -10
fi

echo ""
echo "🎉 Обновление завершено!"
echo ""
echo "📱 Теперь попробуйте:"
echo "1. Найдите бота в Telegram"
echo "2. Отправьте /start"
echo "3. Нажмите 'Открыть Finio'"
echo "4. Должно открыться Mini App внутри Telegram"