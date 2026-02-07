#!/bin/bash

echo "🔧 ДИАГНОСТИКА И АВТОФИКС"
echo "=========================="

# УБИВАЕМ ВСЁ
echo "💀 Убиваем все процессы..."
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true
pkill -9 node 2>/dev/null || true
killall -9 node 2>/dev/null || true

# Освобождаем порты
for port in 3000 3001 3002 3737; do
    fuser -k $port/tcp 2>/dev/null || true
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
done

sleep 3

# Удаляем ВСЕ конфиги nginx
echo "🗑️  Удаляем старые конфиги nginx..."
rm -f /etc/nginx/sites-enabled/*
rm -f /etc/nginx/sites-available/finio
rm -f /etc/nginx/sites-available/default

# Создаем НОВЫЙ конфиг
echo "📝 Создаем новый конфиг nginx..."
cat > /etc/nginx/sites-available/finio << 'EOF'
server {
    listen 80;
    server_name studiofinance.ru www.studiofinance.ru;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

ln -sf /etc/nginx/sites-available/finio /etc/nginx/sites-enabled/finio

# Проверяем и перезапускаем nginx
if nginx -t; then
    systemctl restart nginx
    echo "✅ Nginx перезапущен"
else
    echo "❌ Ошибка конфигурации nginx"
    nginx -t
    exit 1
fi

# Создаем .env
cat > /var/www/Finio/server/.env << 'EOF'
PORT=3000
BOT_TOKEN=8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34
JWT_SECRET=maks15097_finio_secret_key_production_2026
NODE_ENV=production
EOF

# Запускаем backend
echo "🚀 Запускаем backend..."
cd /var/www/Finio/server
pm2 start index.js --name finio
pm2 save

sleep 5

# Проверка
echo ""
echo "🔍 ПРОВЕРКА:"
if curl -s http://localhost:3000/health | grep -q "ok"; then
    echo "✅ Backend работает"
else
    echo "❌ Backend не работает"
    pm2 logs finio --lines 20 --nostream
    exit 1
fi

if systemctl is-active --quiet nginx; then
    echo "✅ Nginx работает"
else
    echo "❌ Nginx не работает"
    exit 1
fi

echo ""
echo "✅✅✅ ВСЁ ИСПРАВЛЕНО! ✅✅✅"
echo "🌐 Сайт: http://studiofinance.ru"
echo ""

