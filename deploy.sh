#!/bin/bash

echo "==================================="
echo "Studio Finance - Деплой на сервер"
echo "==================================="

SERVER_IP="85.235.205.99"
SERVER_USER="root"
PROJECT_DIR="/var/www/studiofinance"

echo "📦 Сборка фронтендов..."

# Сборка Mini App
cd mini-app-frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Ошибка сборки Mini App"
    exit 1
fi
cd ..

# Сборка Website
cd website-frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Ошибка сборки Website"
    exit 1
fi
cd ..

echo "✓ Сборка завершена"

echo ""
echo "📤 Загрузка на сервер $SERVER_IP..."

# Создаем архив
tar -czf deploy.tar.gz \
    server/ \
    mini-app-frontend/dist/ \
    website-frontend/dist/ \
    package.json \
    README.md

# Загружаем на сервер
scp deploy.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

# Выполняем команды на сервере
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    # Останавливаем старые процессы
    pm2 stop studiofinance-server 2>/dev/null || true
    
    # Создаем директорию проекта
    mkdir -p /var/www/studiofinance
    cd /var/www/studiofinance
    
    # Распаковываем
    tar -xzf /tmp/deploy.tar.gz
    rm /tmp/deploy.tar.gz
    
    # Устанавливаем зависимости сервера
    cd server
    npm install --production
    
    # Запускаем через PM2
    pm2 start index.js --name studiofinance-server
    pm2 save
    
    echo "✅ Деплой завершен!"
ENDSSH

# Удаляем локальный архив
rm deploy.tar.gz

echo ""
echo "✅ Проект успешно развернут на сервере!"
echo ""
echo "🌐 URL:"
echo "  Backend API: http://$SERVER_IP:3000"
echo "  Mini App:    http://studiofinance.ru:5173"
echo "  Website:     http://studiofinance.ru:5174"
