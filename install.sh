#!/bin/bash

echo "🚀 Finio - Автоматический деплой на studiofinance.ru"
echo "====================================================="

# Остановка старых процессов
echo "🛑 Остановка старых процессов..."
pm2 delete finio 2>/dev/null || true
pkill -f "node.*index.js" 2>/dev/null || true

# Удаление старых зависимостей
echo "🗑️  Очистка старых зависимостей..."
rm -rf server/node_modules server/package-lock.json
rm -rf website-frontend/node_modules website-frontend/package-lock.json
rm -rf mini-app-frontend/node_modules mini-app-frontend/package-lock.json

# Установка зависимостей
echo "📦 Установка зависимостей..."
cd server && npm install --production && cd ..
cd website-frontend && npm install && npm run build && cd ..
cd mini-app-frontend && npm install && npm run build && cd ..

# Создание .env
echo "⚙️  Настройка окружения..."
cat > server/.env << 'EOF'
PORT=3000
BOT_TOKEN=8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34
JWT_SECRET=maks15097_finio_secret_key_production_2026
NODE_ENV=production
EOF

# Настройка nginx
echo "🌐 Настройка nginx..."
cat > /etc/nginx/sites-available/finio << 'EOF'
server {
    listen 80;
    server_name studiofinance.ru www.studiofinance.ru;

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Frontend
    location / {
        root /var/www/Finio/website-frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Mini App
    location /mini-app {
        alias /var/www/Finio/mini-app-frontend/dist;
        try_files $uri $uri/ /mini-app/index.html;
    }
}
EOF

# Активация конфига nginx
ln -sf /etc/nginx/sites-available/finio /etc/nginx/sites-enabled/finio
rm -f /etc/nginx/sites-enabled/default

# Проверка и перезапуск nginx
nginx -t && systemctl restart nginx

# Установка PM2 если нет
if ! command -v pm2 &> /dev/null; then
    echo "📦 Установка PM2..."
    npm install -g pm2
fi

# Запуск приложения
echo "🚀 Запуск приложения..."
cd server
pm2 start index.js --name finio --time
pm2 save
pm2 startup systemd -u root --hp /root

echo ""
echo "✅ Деплой завершен!"
echo ""
echo "🌐 Сайт: http://studiofinance.ru"
echo "📊 Статус: pm2 status"
echo "📝 Логи: pm2 logs finio"
echo ""
