#!/bin/bash

echo "🔄 БЫСТРОЕ ОБНОВЛЕНИЕ FINIO"
echo "=========================="

# Переход в директорию проекта
cd /opt/Finio

# Получение последних изменений
echo "📥 Получение обновлений..."
git pull origin main

# Установка зависимостей (если изменились)
echo "📦 Обновление зависимостей..."
npm install --silent
cd server && npm install --silent && cd ..
cd website-frontend && npm install --silent && cd ..
cd mini-app-frontend && npm install --silent && cd ..

# Сборка фронтенда
echo "🔨 Пересборка фронтенда..."
cd website-frontend && npm run build && cd ..
cd mini-app-frontend && npm run build && cd ..

# Перезапуск сервиса
echo "🔄 Перезапуск сервиса..."
systemctl restart finio

# Проверка статуса
sleep 3
if systemctl is-active --quiet finio; then
    echo "✅ Обновление завершено успешно!"
    echo "🌐 Сайт: https://studiofinance.ru"
else
    echo "❌ Ошибка при перезапуске сервиса"
    systemctl status finio --no-pager
fi