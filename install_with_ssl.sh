#!/bin/bash

echo "🚀 FINIO - ПОЛНАЯ УСТАНОВКА С SSL"
echo "================================="

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Запустите скрипт с правами root: sudo $0"
    exit 1
fi

WORK_DIR="/var/www/finio"
EMAIL="maks50kucherenko@gmail.com"
DOMAIN="studiofinance.ru"

echo "📧 Email: $EMAIL"
echo "🌐 Домен: $DOMAIN"
echo ""

# 1. Установка зависимостей
echo "🔧 1/6 Установка зависимостей..."
apt-get update -y
apt-get install -y curl git jq

# Docker
if ! command -v docker &> /dev/null; then
    echo "🐳 Установка Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
    rm -f get-docker.sh
fi

# Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Установка Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 2. Остановка старых сервисов
echo "⏹️ 2/6 Остановка старых сервисов..."
systemctl stop nginx 2>/dev/null || true
docker-compose down 2>/dev/null || true
pkill -f python 2>/dev/null || true
pkill -f node 2>/dev/null || true

# 3. Клонирование проекта
echo "📥 3/6 Клонирование проекта..."
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

if [ -d ".git" ]; then
    git pull origin main
else
    git clone https://github.com/Franklin15097/Finio.git .
fi

# 4. Запуск без SSL (сначала проверим работу)
echo "🚀 4/6 Запуск системы без SSL..."
docker-compose build --no-cache
docker-compose up -d

echo "⏳ Ожидание запуска сервисов (60 секунд)..."
sleep 60

# Проверка работы
echo "🔍 Проверка работы сервисов..."
if curl -f http://localhost:8000/health >/dev/null 2>&1; then
    echo "✅ Backend работает"
else
    echo "❌ Backend не работает, проверяем логи..."
    docker-compose logs backend
fi

# 5. Установка SSL
echo "🔒 5/6 Установка SSL сертификата..."

# Установка Certbot
if ! command -v certbot &> /dev/null; then
    echo "📦 Установка Certbot..."
    apt-get install -y certbot python3-certbot-nginx
fi

# Установка Nginx (если нет)
if ! command -v nginx &> /dev/null; then
    echo "📦 Установка Nginx..."
    apt-get install -y nginx
fi

# Остановка Docker Nginx (будем использовать системный)
docker-compose stop nginx 2>/dev/null || true

# Создание базовой конфигурации Nginx
cat > /etc/nginx/sites-available/finio << 'EOF'
server {
    listen 80;
    server_name studiofinance.ru www.studiofinance.ru;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}
EOF

# Активация конфигурации
ln -sf /etc/nginx/sites-available/finio /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Получение SSL сертификата
echo "🔐 Получение SSL сертификата..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    --redirect

# 6. Обновление конфигурации Nginx для проксирования
echo "🔧 6/6 Настройка финальной конфигурации..."
cat > /etc/nginx/sites-available/finio << 'EOF'
server {
    listen 80;
    server_name studiofinance.ru www.studiofinance.ru;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name studiofinance.ru www.studiofinance.ru;
    
    ssl_certificate /etc/letsencrypt/live/studiofinance.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/studiofinance.ru/privkey.pem;
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
    
    # Bot webhook
    location /bot-webhook {
        proxy_pass http://localhost:8000/bot-webhook;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:8000/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Mini App
    location /miniapp {
        proxy_pass http://localhost:8000/miniapp;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
EOF

# Перезагрузка Nginx
nginx -t && systemctl reload nginx

# Настройка автообновления сертификата
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

# Финальная проверка
echo ""
echo "🔍 Финальная проверка..."
sleep 10

if curl -f https://$DOMAIN/health >/dev/null 2>&1; then
    echo "✅ HTTPS работает!"
else
    echo "⚠️ HTTPS пока не отвечает, может потребоваться время на распространение DNS"
fi

echo ""
echo "🎉 УСТАНОВКА ЗАВЕРШЕНА!"
echo ""
echo "🌐 Доступ:"
echo "• Веб-сайт: https://$DOMAIN"
echo "• API: https://$DOMAIN/api"
echo "• Mini App: https://t.me/FinanceStudio_bot/Finio"
echo "• Health: https://$DOMAIN/health"
echo ""
echo "📋 Проверка:"
echo "• Статус: docker-compose ps"
echo "• Логи: docker-compose logs -f"
echo "• SSL: curl https://$DOMAIN/health"
echo ""
echo "⏰ Время установки: ~5-7 минут"
echo "🔄 SSL сертификат обновляется автоматически"