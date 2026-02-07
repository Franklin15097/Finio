#!/bin/bash

echo "🚀 Установка Studio Finance Mini App..."
echo ""

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен!"
    echo "Установите Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js версия: $(node -v)"
echo "✅ npm версия: $(npm -v)"
echo ""

# Установка зависимостей
echo "📦 Установка зависимостей..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Зависимости установлены успешно!"
else
    echo ""
    echo "❌ Ошибка установки зависимостей"
    exit 1
fi

# Проверка .env файла
if [ ! -f .env ]; then
    echo ""
    echo "⚠️  Файл .env не найден!"
    echo "Создайте .env файл с настройками:"
    echo ""
    cat << EOF
BOT_TOKEN=ваш_токен_бота
WEBAPP_URL=http://studiofinance.ru
SERVER_IP=85.235.205.99
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=finio
DB_USER=finio_user
DB_PASSWORD=maks15097
EOF
    echo ""
else
    echo ""
    echo "✅ Файл .env найден"
fi

echo ""
echo "🎉 Установка завершена!"
echo ""
echo "Для запуска:"
echo "  npm start        - запуск сервера"
echo "  npm run bot      - запуск бота"
echo ""
echo "Development режим:"
echo "  npm run dev      - сервер с автоперезагрузкой"
echo "  npm run dev:bot  - бот с автоперезагрузкой"
echo ""
