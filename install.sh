#!/bin/bash
set -e

echo "🚀 Finio - ЧИСТАЯ установка"
echo "============================"

# УБИВАЕМ ВСЁ
echo "💀 Убиваем процессы..."
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true
pkill -9 node 2>/dev/null || true
killall -9 node 2>/dev/null || true
sleep 3

# Очистка
echo "🗑️  Очистка..."
rm -rf server/node_modules server/package-lock.json server/db/*.db
rm -rf website-frontend/node_modules website-frontend/package-lock.json website-frontend/dist
rm -rf mini-app-frontend/node_modules mini-app-frontend/package-lock.json mini-app-frontend/dist

# Backend
echo "📦 Установка backend..."
cd server
npm install --production --legacy-peer-deps --no-audit
cd ..

# Фронтенды
echo "📦 Сборка website..."
cd website-frontend
npm install --legacy-peer-deps --no-audit
npm run build
cd ..

echo "📦 Сборка mini-app..."
cd mini-app-frontend
npm install --legacy-peer-deps --no-audit
npm run build
cd ..

# .env для backend на порту 8080
echo "⚙️  Настройка backend (порт 8080)..."
cat > server/.env << 'EOF'
PORT=8080
BOT_TOKEN=8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34
JWT_SECRET=maks15097_finio_secret_key_production_2026
NODE_ENV=production
EOF

# Nginx - статика + API
echo "🌐 Настройка nginx..."
cat > /etc/nginx/sites-available/finio << 'EOF'
server {
    listen 80;
    server_name studiofinance.ru www.studiofinance.ru;

    # Статика фронтенда
    root /var/www/Finio/website-frontend/dist;
    index index.html;

    # API на backend
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

    # Health check
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
EOF

rm -f /etc/nginx/sites-enabled/*
ln -sf /etc/nginx/sites-available/finio /etc/nginx/sites-enabled/finio

if nginx -t; then
    systemctl restart nginx
    echo "✅ Nginx OK"
else
    echo "❌ Nginx ошибка"
    nginx -t
    exit 1
fi

# PM2
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Запуск backend
echo "🚀 Запуск backend на порту 8080..."
cd server
pm2 start index.js --name finio
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

sleep 5

# Проверка
echo ""
echo "🔍 ПРОВЕРКА:"
if curl -s http://localhost:8080/health | grep -q "ok"; then
    echo "✅ Backend работает (порт 8080)"
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
echo "✅✅✅ ВСЁ РАБОТАЕТ! ✅✅✅"
echo "🌐 Сайт: http://studiofinance.ru"
echo "🔌 Backend: http://localhost:8080"
echo "📊 Статус: pm2 status"
echo ""
