#!/bin/bash

echo "🔧 ДИАГНОСТИКА И АВТОФИКС"
echo "=========================="

# Проверка backend
echo "1️⃣ Проверка backend..."
if curl -s http://localhost:3000/health | grep -q "ok"; then
    echo "✅ Backend работает на порту 3000"
    BACKEND_PORT=3000
elif curl -s http://localhost:3001/health | grep -q "ok"; then
    echo "✅ Backend работает на порту 3001"
    BACKEND_PORT=3001
elif curl -s http://localhost:3002/health | grep -q "ok"; then
    echo "✅ Backend работает на порту 3002"
    BACKEND_PORT=3002
else
    echo "❌ Backend не отвечает ни на одном порту"
    echo "Перезапускаем..."
    pm2 restart finio
    sleep 3
    
    if curl -s http://localhost:3000/health | grep -q "ok"; then
        BACKEND_PORT=3000
    else
        echo "❌ Backend не запустился. Логи:"
        pm2 logs finio --lines 20 --nostream
        exit 1
    fi
fi

# Проверка nginx
echo ""
echo "2️⃣ Проверка nginx..."
NGINX_PORT=$(grep -oP 'proxy_pass http://[^:]+:\K\d+' /etc/nginx/sites-enabled/finio 2>/dev/null || echo "не найден")

if [ "$NGINX_PORT" = "$BACKEND_PORT" ]; then
    echo "✅ Nginx настроен правильно (порт $NGINX_PORT)"
else
    echo "❌ Nginx настроен на порт $NGINX_PORT, а backend на $BACKEND_PORT"
    echo "Исправляем nginx..."
    
    cat > /etc/nginx/sites-available/finio << EOF
server {
    listen 80;
    server_name studiofinance.ru www.studiofinance.ru;

    location / {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF
    
    ln -sf /etc/nginx/sites-available/finio /etc/nginx/sites-enabled/finio
    nginx -t && systemctl restart nginx
    echo "✅ Nginx исправлен и перезапущен"
fi

# Проверка dist папок
echo ""
echo "3️⃣ Проверка фронтенда..."
if [ ! -d "/var/www/Finio/website-frontend/dist" ]; then
    echo "❌ website-frontend/dist не найден"
    echo "Собираем..."
    cd /var/www/Finio/website-frontend
    npm run build
else
    echo "✅ website-frontend/dist существует"
fi

if [ ! -d "/var/www/Finio/mini-app-frontend/dist" ]; then
    echo "❌ mini-app-frontend/dist не найден"
    echo "Собираем..."
    cd /var/www/Finio/mini-app-frontend
    npm run build
else
    echo "✅ mini-app-frontend/dist существует"
fi

# Финальная проверка
echo ""
echo "4️⃣ Финальная проверка..."
sleep 2

if curl -s http://localhost:$BACKEND_PORT/health | grep -q "ok"; then
    echo "✅ Backend: OK"
else
    echo "❌ Backend: FAIL"
fi

if systemctl is-active --quiet nginx; then
    echo "✅ Nginx: OK"
else
    echo "❌ Nginx: FAIL"
fi

echo ""
echo "🌐 Проверьте сайт: http://studiofinance.ru"
echo "📊 PM2 статус: pm2 status"
echo "📝 Логи nginx: tail -f /var/log/nginx/error.log"
echo ""
