#!/bin/bash
# Простая версия без PM2 - для Railway, Heroku, Vercel

set -e

echo "🚀 Установка зависимостей..."

# Backend
cd server && npm install --production && cd ..

# Website
cd website-frontend && npm install && npm run build && cd ..

# Mini App
cd mini-app-frontend && npm install && npm run build && cd ..

echo "✓ Готово! Запустите: cd server && npm start"
