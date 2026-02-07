#!/bin/bash

echo "🚀 Finio - Полная переустановка проекта"
echo "========================================"

# Удаление старых зависимостей
echo "🗑️  Удаление старых зависимостей..."
rm -rf server/node_modules server/package-lock.json
rm -rf website-frontend/node_modules website-frontend/package-lock.json
rm -rf mini-app-frontend/node_modules mini-app-frontend/package-lock.json

# Установка зависимостей
echo "📦 Установка зависимостей..."

echo "  → Backend..."
cd server && npm install && cd ..

echo "  → Website..."
cd website-frontend && npm install && cd ..

echo "  → Mini App..."
cd mini-app-frontend && npm install && cd ..

# Создание .env если не существует
if [ ! -f server/.env ]; then
    echo "⚙️  Создание .env файла..."
    cat > server/.env << EOF
PORT=3000
BOT_TOKEN=your_telegram_bot_token
JWT_SECRET=change_this_secret_key_in_production
NODE_ENV=production
EOF
    echo "⚠️  Не забудьте настроить server/.env"
fi

echo ""
echo "✅ Установка завершена!"
echo ""
echo "📝 Следующие шаги:"
echo "1. Настройте server/.env"
echo "2. Запустите: cd server && npm start"
echo ""
