#!/bin/bash

echo "🔧 ФИНАЛЬНЫЙ ФИКС - ИСПРАВЛЯЕМ ВСЁ НАХУЙ"
echo "========================================"

# Права доступа
echo "📁 Исправляем права доступа..."
chown -R www-data:www-data /var/www/Finio
chmod -R 755 /var/www/Finio
chmod -R 755 /var/www/Finio/website-frontend/dist
chmod -R 755 /var/www/Finio/mini-app-frontend/dist

# Nginx конфиг - ПРАВИЛЬНЫЙ
echo "🌐 Создаем ПРАВИЛЬНЫЙ nginx конфиг..."
cat > /etc/nginx/sites-available/finio << 'NGINXCONF'
server {
    listen 80;
    server_name studiofinance.ru www.studiofinance.ru;

    root /var/www/Finio/website-frontend/dist;
    index index.html;

    # Логи
    access_log /var/log/nginx/finio-access.log;
    error_log /var/log/nginx/finio-error.log;

    # Статика
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # API
    location /api {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Health
    location /health {
        proxy_pass http://127.0.0.1:8080;
    }

    # Mini App
    location /mini-app {
        alias /var/www/Finio/mini-app-frontend/dist;
        try_files $uri $uri/ /mini-app/index.html;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINXCONF

# Удаляем старые конфиги
rm -f /etc/nginx/sites-enabled/*
ln -sf /etc/nginx/sites-available/finio /etc/nginx/sites-enabled/finio

# Тест и перезапуск nginx
echo "🔄 Перезапуск nginx..."
nginx -t
if [ $? -eq 0 ]; then
    systemctl restart nginx
    echo "✅ Nginx перезапущен"
else
    echo "❌ Ошибка конфигурации nginx"
    nginx -t
    exit 1
fi

# Проверка backend
echo "🔍 Проверка backend..."
if curl -s http://localhost:8080/health | grep -q "ok"; then
    echo "✅ Backend работает"
else
    echo "⚠️  Backend не отвечает, перезапускаем..."
    cd /var/www/Finio/server
    pm2 restart finio
    sleep 3
fi

# Финальная проверка
echo ""
echo "🧪 ФИНАЛЬНАЯ ПРОВЕРКА:"
echo "1. Backend:"
curl -s http://localhost:8080/health

echo ""
echo "2. Index.html:"
curl -s -I http://studiofinance.ru/ | head -5

echo ""
echo "3. Assets:"
curl -s -I http://studiofinance.ru/assets/index-D77BQoot.js | head -5

echo ""
echo "4. Права доступа:"
ls -la /var/www/Finio/website-frontend/dist/ | head -5

echo ""
echo "✅✅✅ ГОТОВО! ✅✅✅"
echo "🌐 Открой: http://studiofinance.ru"
echo "📝 Логи nginx: tail -f /var/log/nginx/finio-error.log"
echo ""
