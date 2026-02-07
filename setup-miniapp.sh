#!/bin/bash

echo "🚀 Установка Telegram Mini App..."

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Запустите скрипт с правами root: sudo $0"
    exit 1
fi

# Установка Docker и Docker Compose если не установлены
if ! command -v docker &> /dev/null; then
    echo "📦 Установка Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
fi

if ! command -v docker-compose &> /dev/null; then
    echo "📦 Установка Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Проверка установки
echo "🔍 Проверка Docker..."
docker --version
docker-compose --version

# Переход в директорию проекта или клонирование
if [ -d "/var/www/crypto-bot" ]; then
    echo "📁 Переход в существующую директорию проекта..."
    cd /var/www/crypto-bot
    
    echo "🔄 Обновление кода из GitHub..."
    git pull origin main
else
    echo "📥 Клонирование репозитория..."
    cd /var/www
    git clone https://github.com/Franklin15097/Finio.git crypto-bot
    cd crypto-bot
fi

# Остановка контейнеров
echo "⏹️ Остановка контейнеров..."
docker-compose down || true

# Очистка старых образов
echo "🧹 Очистка старых образов..."
docker system prune -f

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
sleep 20

# Проверка статуса
echo "📊 Проверка статуса сервисов..."
docker-compose ps

# Проверка API
echo "🔍 Проверка работы API..."
sleep 5
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend API работает"
else
    echo "❌ Backend API не отвечает, проверяем логи..."
    docker-compose logs backend | tail -20
fi

# Проверка фронтенда
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend работает"
else
    echo "❌ Frontend не отвечает, проверяем логи..."
    docker-compose logs frontend | tail -20
fi

echo ""
echo "🎉 Telegram Mini App установлен!"
echo ""
echo "📱 Настройте Mini App в @BotFather:"
echo "1. Отправьте /newapp в @BotFather"
echo "2. Выберите вашего бота"
echo "3. URL: https://studiofinance.ru"
echo "4. Название: Crypto Bot"
echo "5. Описание: Управление финансами"
echo ""
echo "🤖 Использование:"
echo "1. Найдите бота в Telegram"
echo "2. Отправьте /start"
echo "3. Нажмите 'Открыть Crypto Bot'"
echo "4. Mini App откроется внутри Telegram"
echo ""
echo "🌐 Веб-сайт: https://studiofinance.ru"
echo "📊 API: https://studiofinance.ru/api"
echo ""
echo "📋 Управление:"
echo "docker-compose logs -f    # Просмотр логов"
echo "docker-compose restart   # Перезапуск"
echo "docker-compose ps        # Статус сервисов"
echo ""
echo "🔧 Если что-то не работает:"
echo "docker-compose logs backend  # Логи бэкенда"
echo "docker-compose logs frontend # Логи фронтенда"