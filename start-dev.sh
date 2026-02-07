#!/bin/bash

echo "🚀 Запуск Finio в режиме разработки..."

# Проверяем, установлены ли зависимости
if [ ! -d "node_modules" ]; then
    echo "📦 Устанавливаем зависимости..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo "📦 Устанавливаем зависимости сервера..."
    cd server && npm install && cd ..
fi

if [ ! -d "website-frontend/node_modules" ]; then
    echo "📦 Устанавливаем зависимости веб-сайта..."
    cd website-frontend && npm install && cd ..
fi

if [ ! -d "mini-app-frontend/node_modules" ]; then
    echo "📦 Устанавливаем зависимости мини-приложения..."
    cd mini-app-frontend && npm install && cd ..
fi

echo "✅ Все зависимости установлены!"
echo ""
echo "🌟 Запускаем сервисы..."
echo ""
echo "📍 Доступные адреса:"
echo "   🖥️  Веб-сайт:        http://localhost:5173"
echo "   📱 Мини-приложение:  http://localhost:5174"
echo "   🔧 API сервер:       http://localhost:3000"
echo ""
echo "💡 Для остановки нажмите Ctrl+C"
echo ""

# Запускаем все сервисы параллельно
trap 'kill $(jobs -p)' EXIT

# Запуск сервера
echo "🔧 Запуск API сервера..."
cd server && npm run dev &

# Ждем немного, чтобы сервер успел запуститься
sleep 2

# Запуск веб-сайта
echo "🖥️  Запуск веб-сайта..."
cd website-frontend && npm run dev &

# Запуск мини-приложения
echo "📱 Запуск мини-приложения..."
cd mini-app-frontend && npm run dev &

# Ждем завершения всех процессов
wait