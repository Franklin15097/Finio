#!/bin/bash

echo "🚀 Деплой Finio на хостинг..."

# Остановка всех процессов
echo "⏹️  Остановка существующих процессов..."
pkill -f "node.*index.js" || true
pkill -f "npm.*dev" || true

# Установка зависимостей
echo "📦 Установка зависимостей..."
npm install

cd server
npm install
cd ..

cd website-frontend
npm install
npm run build
cd ..

cd mini-app-frontend
npm install
npm run build
cd ..

# Создание .env файла если его нет
if [ ! -f "server/.env" ]; then
    echo "⚙️  Создание .env файла..."
    cat > server/.env << EOF
PORT=3000
BOT_TOKEN=your_telegram_bot_token_here
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
EOF
    echo "📝 Создан server/.env - не забудьте добавить BOT_TOKEN!"
fi

# Запуск в production режиме
echo "🌟 Запуск в production режиме..."
cd server
nohup npm start > ../app.log 2>&1 &
echo $! > ../app.pid

echo "✅ Деплой завершен!"
echo "📍 Приложение доступно на порту 3000"
echo "📋 Логи: tail -f app.log"
echo "⏹️  Остановка: kill \$(cat app.pid)"