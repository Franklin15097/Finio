#!/bin/bash

echo "🔍 Диагностика проблем Finio"
echo "============================"

echo ""
echo "📊 Статус контейнеров:"
docker-compose ps

echo ""
echo "🌐 Проверка портов:"
netstat -tulpn | grep -E ":80|:8000|:3306"

echo ""
echo "🔥 Проверка firewall:"
ufw status

echo ""
echo "📋 Логи nginx:"
docker-compose logs nginx | tail -20

echo ""
echo "📋 Логи backend:"
docker-compose logs backend | tail -20

echo ""
echo "📋 Логи frontend:"
docker-compose logs frontend | tail -20

echo ""
echo "🧪 Тестирование локальных подключений:"
echo "Тест nginx:"
curl -I http://localhost:80 2>/dev/null || echo "❌ Nginx не отвечает"

echo "Тест backend:"
curl -I http://localhost:8000 2>/dev/null || echo "❌ Backend не отвечает"

echo ""
echo "🔧 Проверка Docker сети:"
docker network ls
docker network inspect finio_finio_network 2>/dev/null || echo "❌ Сеть не найдена"