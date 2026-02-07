#!/bin/bash

echo "🚀 Установка Finio - Финансовый трекер"
echo "======================================"

# Остановка всех процессов
echo "⏹️  Остановка существующих процессов..."
pkill -f "node.*index.js" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true
pkill -f "npm.*start" 2>/dev/null || true

# Очистка старых файлов
echo "🧹 Очистка старых файлов..."
rm -f app.log app.pid 2>/dev/null || true

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Установите Node.js 16+ и повторите попытку."
    exit 1
fi

echo "✅ Node.js $(node --version) найден"

# Установка зависимостей
echo "📦 Установка зависимостей..."
npm install

echo "📦 Установка зависимостей сервера..."
cd server && npm install && cd ..

echo "📦 Установка зависимостей веб-сайта..."
cd website-frontend && npm install && cd ..

echo "📦 Установка зависимостей мини-приложения..."
cd mini-app-frontend && npm install && cd ..

# Сборка фронтенда
echo "🔨 Сборка фронтенда..."
cd website-frontend && npm run build && cd ..
cd mini-app-frontend && npm run build && cd ..

# Создание .env файла
if [ ! -f "server/.env" ]; then
    echo "⚙️  Создание .env файла..."
    cat > server/.env << EOF
PORT=3000
BOT_TOKEN=your_telegram_bot_token_here
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "your_jwt_secret_$(date +%s)")
NODE_ENV=production
EOF
    echo "📝 Создан server/.env"
fi

# Запуск в production режиме
echo "🌟 Запуск приложения..."
cd server
nohup npm start > ../app.log 2>&1 &
echo $! > ../app.pid
cd ..

# Ожидание запуска
sleep 3

# Проверка запуска
if ps -p $(cat app.pid 2>/dev/null) > /dev/null 2>&1; then
    echo ""
    echo "✅ Finio успешно установлен и запущен!"
    echo ""
    echo "📍 Доступные адреса:"
    echo "   🌐 Веб-сайт:     http://localhost:3000"
    echo "   📱 Mini App:     http://localhost:3000/mini-app"
    echo "   🔧 API:          http://localhost:3000/api"
    echo ""
    echo "⚙️  Настройка:"
    echo "   1. Отредактируйте server/.env"
    echo "   2. Добавьте BOT_TOKEN от @BotFather"
    echo "   3. Перезапустите: ./install.sh"
    echo ""
    echo "📋 Управление:"
    echo "   Остановка:  kill \$(cat app.pid)"
    echo "   Логи:       tail -f app.log"
    echo "   Статус:     ps -p \$(cat app.pid)"
else
    echo ""
    echo "❌ Ошибка запуска! Проверьте логи:"
    echo "   tail -f app.log"
    exit 1
fi
