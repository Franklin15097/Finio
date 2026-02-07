#!/bin/bash

echo "🔍 ДИАГНОСТИКА ПРОБЛЕМ FINIO"
echo "============================"

# Проверка Docker
echo "🐳 1. Проверка Docker..."
if command -v docker &> /dev/null; then
    echo "✅ Docker установлен: $(docker --version)"
    
    if command -v docker-compose &> /dev/null; then
        echo "✅ Docker Compose установлен: $(docker-compose --version)"
    else
        echo "❌ Docker Compose не установлен"
    fi
else
    echo "❌ Docker не установлен"
fi

# Проверка портов
echo ""
echo "🔌 2. Проверка портов..."
for port in 80 443 3000 8000 3306; do
    if netstat -tulpn 2>/dev/null | grep -q ":$port "; then
        process=$(netstat -tulpn 2>/dev/null | grep ":$port " | awk '{print $7}' | head -1)
        echo "✅ Порт $port занят: $process"
    else
        echo "❌ Порт $port свободен"
    fi
done

# Проверка контейнеров
echo ""
echo "📦 3. Статус контейнеров..."
if [ -f "docker-compose.yml" ]; then
    docker-compose ps 2>/dev/null || echo "❌ Не удалось получить статус контейнеров"
else
    echo "❌ Файл docker-compose.yml не найден"
fi

# Проверка логов
echo ""
echo "📋 4. Последние ошибки в логах..."
if [ -f "docker-compose.yml" ]; then
    echo "--- Backend логи ---"
    docker-compose logs --tail=10 backend 2>/dev/null | grep -i error || echo "Нет ошибок в backend"
    
    echo "--- Frontend логи ---"
    docker-compose logs --tail=10 frontend 2>/dev/null | grep -i error || echo "Нет ошибок в frontend"
    
    echo "--- MySQL логи ---"
    docker-compose logs --tail=10 mysql 2>/dev/null | grep -i error || echo "Нет ошибок в MySQL"
    
    echo "--- Nginx логи ---"
    docker-compose logs --tail=10 nginx 2>/dev/null | grep -i error || echo "Нет ошибок в Nginx"
fi

# Проверка подключения к базе данных
echo ""
echo "🗄️ 5. Проверка базы данных..."
if docker-compose exec -T mysql mysqladmin ping -h localhost -u finio_user -pmaks15097 2>/dev/null; then
    echo "✅ MySQL отвечает"
    
    # Проверка таблиц
    tables=$(docker-compose exec -T mysql mysql -u finio_user -pmaks15097 finio -e "SHOW TABLES;" 2>/dev/null | wc -l)
    if [ $tables -gt 1 ]; then
        echo "✅ Таблицы созданы ($((tables-1)) таблиц)"
    else
        echo "❌ Таблицы не созданы"
    fi
else
    echo "❌ MySQL не отвечает"
fi

# Проверка доступности API
echo ""
echo "🌐 6. Проверка API..."
if curl -f -s http://localhost:8000/health >/dev/null 2>&1; then
    echo "✅ Backend API отвечает"
else
    echo "❌ Backend API не отвечает"
fi

if curl -f -s http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Frontend отвечает"
else
    echo "❌ Frontend не отвечает"
fi

if curl -f -s http://localhost/health >/dev/null 2>&1; then
    echo "✅ Nginx proxy работает"
else
    echo "❌ Nginx proxy не работает"
fi

# Проверка внешней доступности
echo ""
echo "🌍 7. Проверка внешней доступности..."
if curl -f -s https://studiofinance.ru/health >/dev/null 2>&1; then
    echo "✅ Сайт доступен извне"
else
    echo "❌ Сайт недоступен извне"
fi

# Проверка SSL
echo ""
echo "🔒 8. Проверка SSL..."
if python3 check_ssl.py 2>/dev/null; then
    echo "✅ SSL проверка выполнена"
else
    echo "❌ Ошибка проверки SSL"
fi

echo ""
echo "🎯 РЕКОМЕНДАЦИИ:"
echo "1. Если контейнеры не запущены: docker-compose up -d --build"
echo "2. Если порты заняты: sudo ./clean.sh && sudo ./start.sh"
echo "3. Если база данных не отвечает: docker-compose restart mysql"
echo "4. Если API не работает: docker-compose logs backend"
echo "5. Если SSL проблемы: проверьте настройки домена и сертификата"