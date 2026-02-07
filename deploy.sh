#!/bin/bash

echo "🚀 ДЕПЛОЙ FINIO С НУЛЕВЫМ ДАУНТАЙМОМ"
echo "===================================="

set -e

# Переход в директорию проекта
cd /opt/Finio

# Получение последних изменений
echo "📥 Получение обновлений..."
git pull origin main

# Создание .env файла если не существует
if [ ! -f ".env" ]; then
    echo "📝 Создание .env файла..."
    cat > .env << EOF
BOT_TOKEN=8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34
JWT_SECRET=$(openssl rand -base64 32)
EOF
fi

# Сборка нового образа
echo "🔨 Сборка Docker образа..."
docker-compose build --no-cache

# Запуск новых контейнеров
echo "🚀 Запуск новых контейнеров..."
docker-compose up -d

# Ожидание готовности
echo "⏳ Ожидание готовности сервиса..."
sleep 10

# Проверка здоровья
echo "🔍 Проверка здоровья..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Сервис работает!"
    
    # Очистка старых образов
    echo "🧹 Очистка старых образов..."
    docker image prune -f
    
    echo ""
    echo "🎉 ДЕПЛОЙ ЗАВЕРШЕН УСПЕШНО!"
    echo "🌐 Сайт: https://studiofinance.ru"
    echo "📊 Статус: docker-compose ps"
    echo "📋 Логи: docker-compose logs -f app"
else
    echo "❌ Сервис не отвечает!"
    echo "📋 Логи:"
    docker-compose logs app
    exit 1
fi
