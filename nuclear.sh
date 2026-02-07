#!/bin/bash

echo "☢️  ЯДЕРНАЯ ПЕРЕУСТАНОВКА ☢️"
echo "============================"
echo "ВНИМАНИЕ: Это удалит ВСЁ и установит заново!"
echo ""
read -p "Продолжить? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Отменено"
    exit 0
fi

echo ""
echo "💀 УБИВАЕМ ВСЁ..."
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true
pkill -9 node 2>/dev/null || true
killall -9 node 2>/dev/null || true
sleep 3

# Освобождаем ВСЕ порты
echo "🔓 Освобождаем порты..."
for port in {3000..9000}; do
    fuser -k $port/tcp 2>/dev/null || true
done
sleep 2

# Удаляем ВЕСЬ проект
echo "🗑️  Удаляем старый проект..."
cd /var/www
rm -rf Finio
rm -rf Finio.old

# Клонируем заново
echo "📥 Клонируем свежий код..."
git clone https://github.com/Franklin15097/Finio.git
cd Finio

# Очистка nginx
echo "🌐 Очистка nginx..."
rm -f /etc/nginx/sites-enabled/*
rm -f /etc/nginx/sites-available/finio

# Установка
echo "📦 Установка backend..."
cd server
npm install --production --legacy-peer-deps --no-audit
cd ..

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

# .env
echo "⚙️  Создание .env..."
cat > server/.env << 'EOF'
PORT=8080
BOT_TOKEN=8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34
JWT_SECRET=maks15097_finio_secret_key_production_2026
NODE_ENV=production
EOF

# Nginx
echo "🌐 Настройка nginx..."
cat > /etc/nginx/sites-available/finio << 'EOF'
server {
    listen 80;
    server_name studiofinance.ru www.studiofinance.ru;

    root /var/www/Finio/website-frontend/dist;
    index index.html;

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

    location /health {
        proxy_pass http://127.0.0.1:8080;
    }

    location /mini-app {
        alias /var/www/Finio/mini-app-frontend/dist;
        try_files $uri $uri/ /mini-app/index.html;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

ln -sf /etc/nginx/sites-available/finio /etc/nginx/sites-enabled/finio
nginx -t && systemctl restart nginx

# PM2
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Запуск
echo "🚀 Запуск backend..."
cd /var/www/Finio/server
pm2 start index.js --name finio
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

sleep 5

# Проверка
echo ""
echo "🔍 ПРОВЕРКА:"
if curl -s http://localhost:8080/health | grep -q "ok"; then
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
echo "✅✅✅ ЯДЕРНАЯ ПЕРЕУСТАНОВКА ЗАВЕРШЕНА! ✅✅✅"
echo "🌐 Сайт: http://studiofinance.ru"
echo "🔌 Backend: http://localhost:8080"
echo "📊 Статус: pm2 status"
echo ""
