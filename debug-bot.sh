#!/bin/bash

echo "🔍 Диагностика бота..."

# Переход в директорию проекта
cd /var/www/crypto-bot || {
    echo "❌ Директория проекта не найдена"
    exit 1
}

echo "📊 Статус контейнеров:"
docker-compose ps

echo ""
echo "📋 Логи backend (последние 20 строк):"
docker-compose logs backend | tail -20

echo ""
echo "🔍 Проверка API:"
curl -s http://localhost:8000/health | jq . || echo "API не отвечает"

echo ""
echo "🔍 Проверка webhook:"
curl -s -X POST http://localhost:8000/bot-webhook/ \
  -H "Content-Type: application/json" \
  -d '{"update_id": 123, "message": {"message_id": 1, "date": 1234567890, "chat": {"id": 123, "type": "private"}, "from": {"id": 123, "is_bot": false, "first_name": "Test"}, "text": "/start"}}' \
  | jq . || echo "Webhook не отвечает"

echo ""
echo "🔍 Переменные окружения в контейнере:"
docker-compose exec backend env | grep TELEGRAM || echo "Переменные TELEGRAM не найдены"

echo ""
echo "🔍 Процессы в контейнере:"
docker-compose exec backend ps aux | grep -E "(python|uvicorn)" || echo "Процессы не найдены"

echo ""
echo "📁 Файлы в контейнере:"
docker-compose exec backend ls -la /app/ | head -10

echo ""
echo "🔧 Для перезапуска с логами:"
echo "docker-compose restart backend && docker-compose logs -f backend"