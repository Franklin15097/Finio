#!/bin/bash

echo "🔧 ОТКЛЮЧЕНИЕ БЭКЕНДА - ТОЛЬКО ФРОНТЕНД"
echo "======================================"

# Остановка и отключение сервиса
echo "⏹️ Остановка Node.js сервиса..."
systemctl stop finio
systemctl disable finio

# Настройка Nginx для прямой раздачи статики
echo "🌐 Настройка Nginx для статики..."
cat > /etc/nginx/sites-available/finio << 'EOF'
server {
    listen 80;
    server_name studiofinance.ru www.studiofinance.ru;

    root /opt/Finio/website-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /mini-app {
        alias /opt/Finio/mini-app-frontend/dist;
        try_files $uri $uri/ /mini-app/index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOF

# Перезагрузка Nginx
echo "🔄 Перезагрузка Nginx..."
nginx -t && systemctl reload nginx

echo ""
echo "✅ ГОТОВО!"
echo "🌐 Сайт: http://studiofinance.ru"
echo "📱 Mini App: http://studiofinance.ru/mini-app"
echo ""
echo "⚠️  Бэкенд отключен - работает только фронтенд с mock данными"
echo "💡 Для включения бэкенда: systemctl start finio"
