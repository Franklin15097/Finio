#!/bin/bash

echo "🚀 Установка Telegram Mini App..."

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Запустите скрипт с правами root: sudo $0"
    exit 1
fi

# Переход в директорию проекта или клонирование
if [ -d "/var/www/crypto-bot" ]; then
    echo "📁 Переход в существующую директорию проекта..."
    cd /var/www/crypto-bot
    
    echo "🔄 Обновление кода из GitHub..."
    git pull origin main
else
    echo "📥 Клонирование репозитория..."
    cd /var/www
    git clone https://github.com/Franklin15097/crypto-bot-miniapp.git crypto-bot
    cd crypto-bot
fi

# Остановка контейнеров
echo "⏹️ Остановка контейнеров..."
docker-compose down

# Пересборка фронтенда с новыми изменениями
echo "🔨 Пересборка фронтенда с поддержкой Telegram WebApp..."
docker-compose build --no-cache frontend

# Пересборка бэкенда
echo "🔨 Пересборка бэкенда с Telegram аутентификацией..."
docker-compose build --no-cache backend

# Запуск всех сервисов
echo "🚀 Запуск сервисов..."
docker-compose up -d

# Ожидание запуска
echo "⏳ Ожидание запуска сервисов..."
sleep 15

# Проверка статуса
echo "📊 Проверка статуса сервисов..."
docker-compose ps

# Проверка API
echo "🔍 Проверка работы API..."
sleep 5
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend API работает"
else
    echo "❌ Backend API не отвечает"
fi

# Проверка фронтенда
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend работает"
else
    echo "❌ Frontend не отвечает"
fi

echo ""
echo "🎉 Telegram Mini App установлен!"
echo ""
echo "📱 Настройте Mini App в @BotFather:"
echo "1. Отправьте /newapp в @BotFather"
echo "2. Выберите вашего бота"
echo "3. URL: https://$(hostname -f || echo 'your-domain.com')"
echo "4. Название: Crypto Bot"
echo "5. Описание: Управление финансами"
echo ""
echo "🤖 Использование:"
echo "1. Найдите бота в Telegram"
echo "2. Отправьте /start"
echo "3. Нажмите 'Открыть Crypto Bot'"
echo "4. Mini App откроется внутри Telegram"
echo ""
echo "🌐 Веб-сайт: https://$(hostname -f || echo 'your-domain.com')"
echo "📊 API: https://$(hostname -f || echo 'your-domain.com')/api"
echo ""
echo "📋 Управление:"
echo "docker-compose logs -f    # Просмотр логов"
echo "docker-compose restart   # Перезапуск"
echo "docker-compose ps        # Статус сервисов"