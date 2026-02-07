#!/bin/bash

echo "🔍 ПРОВЕРКА СОСТОЯНИЯ БОТА..."

cd /var/www/crypto-bot || {
    echo "❌ Директория проекта не найдена"
    exit 1
}

echo "📊 Статус контейнеров:"
docker-compose ps

echo ""
echo "🔍 Последний коммит в репозитории:"
git log --oneline -1

echo ""
echo "🔍 Статус Git:"
git status --porcelain

echo ""
echo "📋 Логи backend (последние 10 строк):"
docker-compose logs backend | tail -10

echo ""
echo "🔍 Проверка API endpoints:"
echo "Health: $(curl -s http://localhost:8000/health | jq -r .status 2>/dev/null || echo 'Не отвечает')"
echo "Bot Status: $(curl -s http://localhost:8000/bot-status | jq -r .bot_initialized 2>/dev/null || echo 'Не отвечает')"

echo ""
echo "🔍 Переменные окружения в контейнере:"
docker-compose exec backend env | grep TELEGRAM || echo "Переменные TELEGRAM не найдены"

echo ""
echo "🔍 Процессы в контейнере:"
docker-compose exec backend ps aux | grep -E "(python|uvicorn)" || echo "Процессы не найдены"

echo ""
echo "📁 Содержимое /app в контейнере:"
docker-compose exec backend ls -la /app/ | head -5

echo ""
echo "🔧 Команды для исправления:"
echo "1. Принудительное обновление: ./force-update.sh"
echo "2. Просмотр логов: docker-compose logs -f backend"
echo "3. Перезапуск: docker-compose restart backend"