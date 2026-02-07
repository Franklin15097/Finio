#!/bin/bash

echo "🔄 Перезапуск Finio"
echo "=================="

cd /opt/finio

echo "Остановка контейнеров..."
docker-compose down

echo "Удаление старых образов..."
docker-compose build --no-cache

echo "Запуск контейнеров..."
docker-compose up -d

echo "Ожидание запуска..."
sleep 30

echo "Статус контейнеров:"
docker-compose ps

echo ""
echo "Тестирование:"
curl -I http://localhost:80 && echo "✅ Nginx работает" || echo "❌ Nginx не работает"
curl -I http://localhost:8000/health && echo "✅ Backend работает" || echo "❌ Backend не работает"
curl -I http://localhost:3000 && echo "✅ Frontend работает" || echo "❌ Frontend не работает"

echo ""
echo "Логи nginx:"
docker-compose logs nginx | tail -5