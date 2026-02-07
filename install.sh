#!/bin/bash

echo "==================================="
echo "Studio Finance - Установка проекта"
echo "==================================="

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Установите Node.js 18+ и попробуйте снова."
    exit 1
fi

echo "✓ Node.js версия: $(node -v)"

# Установка зависимостей для сервера
echo ""
echo "📦 Установка зависимостей сервера..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "❌ Ошибка установки зависимостей сервера"
    exit 1
fi
cd ..

# Установка зависимостей для mini-app
echo ""
echo "📦 Установка зависимостей Mini App..."
cd mini-app-frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Ошибка установки зависимостей Mini App"
    exit 1
fi
cd ..

# Установка зависимостей для website
echo ""
echo "📦 Установка зависимостей Website..."
cd website-frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Ошибка установки зависимостей Website"
    exit 1
fi
cd ..

echo ""
echo "✅ Установка завершена успешно!"
echo ""
echo "Для запуска проекта используйте:"
echo "  ./start.sh          - Запуск всех сервисов"
echo "  ./deploy.sh         - Деплой на продакшн"
