#!/bin/bash

echo "🔧 ИСПРАВЛЕНИЕ ПРОБЛЕМ FINIO"
echo "============================"

# Остановка сервиса
echo "⏹️ Остановка сервиса..."
systemctl stop finio

# Переход в директорию и исправление прав Git
echo "🔐 Исправление прав Git..."
cd /opt/Finio
git config --global --add safe.directory /opt/Finio
chown -R finio:finio /opt/Finio

# Получение последних изменений
echo "📥 Получение обновлений..."
git pull origin main

# Очистка старых сборок
echo "🧹 Очистка старых сборок..."
rm -rf website-frontend/dist
rm -rf mini-app-frontend/dist

# Установка зависимостей
echo "📦 Установка зависимостей..."
npm install
cd server && npm install && cd ..
cd website-frontend && npm install && cd ..
cd mini-app-frontend && npm install && cd ..

# Сборка фронтенда
echo "🔨 Сборка website-frontend..."
cd website-frontend
npm run build
if [ ! -f "dist/index.html" ]; then
    echo "❌ Ошибка сборки website-frontend!"
    exit 1
fi
cd ..

echo "🔨 Сборка mini-app-frontend..."
cd mini-app-frontend
npm run build
if [ ! -f "dist/index.html" ]; then
    echo "❌ Ошибка сборки mini-app-frontend!"
    exit 1
fi
cd ..

# Проверка файлов
echo "✅ Проверка собранных файлов:"
ls -la website-frontend/dist/
ls -la mini-app-frontend/dist/

# Исправление прав
echo "🔐 Исправление прав доступа..."
chown -R finio:finio /opt/Finio

# Запуск сервиса
echo "🚀 Запуск сервиса..."
systemctl start finio

# Ожидание и проверка
sleep 5
if systemctl is-active --quiet finio; then
    echo "✅ Сервис запущен успешно!"
    echo "🌐 Проверка порта 3000..."
    netstat -tlnp | grep :3000 && echo "✅ Порт 3000 слушается!" || echo "❌ Порт 3000 не работает!"
else
    echo "❌ Ошибка запуска сервиса!"
    systemctl status finio --no-pager
    echo "📝 Последние логи:"
    journalctl -u finio --no-pager -n 10
fi

echo ""
echo "🎉 ИСПРАВЛЕНИЕ ЗАВЕРШЕНО!"
echo "🌐 Сайт: https://studiofinance.ru"