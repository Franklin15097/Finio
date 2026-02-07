#!/bin/bash

echo "🔥 ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ БОТА..."

# Переход в директорию проекта
cd /var/www/crypto-bot || {
    echo "❌ Директория проекта не найдена"
    exit 1
}

echo "⏹️ Полная остановка всех контейнеров..."
docker-compose down --remove-orphans

echo "🧹 Очистка Docker кэша..."
docker system prune -f
docker-compose build --no-cache backend

echo "📥 Принудительное обновление кода..."
git reset --hard HEAD
git pull origin main --force

echo "🔄 Перезапуск контейнеров..."
docker-compose up -d

echo "⏳ Ожидание запуска (30 сек)..."
sleep 30

echo "📊 Статус контейнеров:"
docker-compose ps

echo "📋 Логи backend (последние 20 строк):"
docker-compose logs backend | tail -20

echo "🔍 Проверка API:"
curl -s http://localhost:8000/health | jq . || echo "API не отвечает"

echo "🔍 Проверка статуса бота:"
curl -s http://localhost:8000/bot-status | jq . || echo "Bot status не отвечает"

echo "🔍 Тест webhook:"
curl -s -X POST http://localhost:8000/bot-webhook/ \
  -H "Content-Type: application/json" \
  -d '{"update_id": 999, "message": {"message_id": 1, "date": 1234567890, "chat": {"id": 123, "type": "private"}, "from": {"id": 123, "is_bot": false, "first_name": "Test"}, "text": "/start"}}' \
  | jq . || echo "Webhook не отвечает"

echo ""
echo "🎉 Принудительное обновление завершено!"
echo ""
echo "📱 Теперь попробуйте отправить /start боту в Telegram"
echo "📋 Для просмотра логов в реальном времени:"
echo "docker-compose logs -f backend"