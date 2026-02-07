#!/bin/bash

echo "🔧 БЫСТРОЕ ИСПРАВЛЕНИЕ"
echo "====================="

cd /opt/Finio

# Остановка сервиса
echo "⏹️ Остановка сервиса..."
systemctl stop finio

# Удаление старых зависимостей SQLite
echo "🗑️ Удаление SQLite..."
cd server
npm uninstall sqlite3 sqlite

# Установка PostgreSQL
echo "📦 Установка pg..."
npm install pg bcrypt

# Установка зависимостей фронтенда
echo "📦 Установка зависимостей фронтенда..."
cd ../website-frontend
npm install chart.js react-chartjs-2 framer-motion

# Пересборка фронтенда
echo "🔨 Пересборка..."
npm run build

cd ../mini-app-frontend
npm run build

# Исправление прав
echo "🔐 Исправление прав..."
cd /opt/Finio
chown -R finio:finio .

# Запуск сервиса
echo "🚀 Запуск сервиса..."
systemctl start finio

# Ожидание
sleep 5

# Проверка
echo "✅ Проверка статуса..."
systemctl status finio --no-pager
netstat -tlnp | grep :3000

echo ""
echo "🎉 Исправление завершено!"
