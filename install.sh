#!/bin/bash
set -e

echo "🚀 Finio - УМНЫЙ автоматический деплой"
echo "========================================"

# Функция поиска свободного порта
find_free_port() {
    local port=$1
    while lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; do
        echo "⚠️  Порт $port занят, пробуем следующий..."
        port=$((port + 1))
    done
    echo $port
}

# УБИВАЕМ ВСЁ НАХРЕН
echo "💀 Убиваем все старые процессы..."
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true
pkill -9 node 2>/dev/null || true
killall -9 node 2>/dev/null || true
sleep 3

# Освобождаем порты принудительно
echo "🔓 Освобождаем порты..."
for port in 3000 3001 3002 3003 3004 3005; do
    fuser -k $port/tcp 2>/dev/null || true
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
done
sleep 2

# Находим свободный порт
FREE_PORT=$(find_free_port 3000)
echo "✅ Используем порт: $FREE_PORT"

# Очистка
echo "🗑️  Очистка..."
rm -rf server/node_modules server/package-lock.json server/db/*.db
rm -rf website-frontend/node_modules website-frontend/package-lock.json website-frontend/dist
rm -rf mini-app-frontend/node_modules mini-app-frontend/package-lock.json mini-app-frontend/dist

# Сборка фронтендов
echo "📦 Сборка website..."
cd website-frontend
npm install --legacy-peer-deps --no-audit
VITE_API_URL=http://studiofinance.ru/api npm run build
cd ..

echo "📦 Сборка mini-app..."
cd mini-app-frontend
npm install --legacy-peer-deps --no-audit
VITE_API_URL=http://studiofinance.ru/api npm run build
cd ..

# Backend
echo "📦 Установка backend..."
cd server
npm install --production --legacy-peer-deps --no-audit
cd ..

# Создание .env с правильным портом
echo "⚙️  Настройка окружения (порт $FREE_PORT)..."
cat > server/.env << EOF
PORT=$FREE_PORT
BOT_TOKEN=8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34
JWT_SECRET=maks15097_finio_secret_key_production_2026
NODE_ENV=production
EOF

# Nginx с правильным портом
echo "🌐 Настройка nginx..."
cat > /etc/nginx/sites-available/finio << EOF
server {
    listen 80;
    server_name studiofinance.ru www.studiofinance.ru;

    location / {
        proxy_pass http://127.0.0.1:$FREE_PORT;
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
rm -f /etc/nginx/sites-enabled/default

# Проверка nginx
if nginx -t 2>&1; then
    systemctl restart nginx
    echo "✅ Nginx перезапущен"
else
    echo "❌ Ошибка конфигурации nginx"
    exit 1
fi

# PM2
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Запуск с ожиданием
echo "🚀 Запуск на порту $FREE_PORT..."
cd server

# Запускаем и ждем
pm2 start index.js --name finio --time --wait-ready --listen-timeout 10000
pm2 save

# Настройка автозапуска
pm2 startup systemd -u root --hp /root 2>/dev/null || true

# Ждем запуска
echo "⏳ Ожидание запуска..."
sleep 5

# Проверка
if pm2 list | grep -q "finio.*online"; then
    # Проверяем что порт слушается
    if netstat -tlnp | grep -q ":$FREE_PORT.*node"; then
        # Проверяем HTTP ответ
        if curl -s http://localhost:$FREE_PORT/health | grep -q "ok"; then
            echo ""
            echo "✅✅✅ ВСЁ РАБОТАЕТ! ✅✅✅"
            echo "🌐 Сайт: http://studiofinance.ru"
            echo "🔌 Порт: $FREE_PORT"
            echo "📊 Статус: pm2 status"
            echo "📝 Логи: pm2 logs finio"
            echo ""
        else
            echo "⚠️  Backend запущен но не отвечает на /health"
            pm2 logs finio --lines 20 --nostream
        fi
    else
        echo "⚠️  Процесс запущен но порт не слушается"
        pm2 logs finio --lines 20 --nostream
    fi
else
    echo ""
    echo "❌ Backend не запустился. Логи:"
    pm2 logs finio --lines 30 --nostream
    echo ""
    echo "Попробуйте запустить вручную:"
    echo "cd /var/www/Finio/server && node index.js"
    exit 1
fi
