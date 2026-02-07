#!/bin/bash

echo "🚀 FINIO V2.0 - ULTRA FAST INSTALLATION"
echo "======================================="

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
echo "⚡ Архитектура: Node.js + MySQL 8+ + Nginx"
echo ""

# 1. Установка зависимостей
echo "🔧 1/6 Установка зависимостей..."
apt-get update -y
apt-get install -y curl git jq nodejs npm mysql-server-8.0 nginx certbot python3-certbot-nginx

# 2. Настройка MySQL
echo "🗄️ 2/6 Настройка MySQL 8+..."
systemctl start mysql
systemctl enable mysql

# Создание базы данных
mysql -u root << 'EOF'
CREATE DATABASE IF NOT EXISTS finio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'finio_user'@'localhost' IDENTIFIED BY 'maks15097';
GRANT ALL PRIVILEGES ON finio.* TO 'finio_user'@'localhost';
FLUSH PRIVILEGES;
EOF

echo "✅ MySQL настроен"

# 3. Клонирование и настройка проекта
echo "📥 3/6 Клонирование проекта..."
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

if [ -d ".git" ]; then
    git pull origin main
else
    git clone https://github.com/Franklin15097/Finio.git .
fi

# 4. Установка backend
echo "⚡ 4/6 Установка Node.js backend..."
cd "$WORK_DIR/backend"
npm install --production

# Тест подключения к базе
if node -e "
const mysql = require('mysql2/promise');
mysql.createConnection({
  host: 'localhost',
  user: 'finio_user', 
  password: 'maks15097',
  database: 'finio'
}).then(() => {
  console.log('✅ Database connection OK');
  process.exit(0);
}).catch(err => {
  console.error('❌ Database connection failed:', err.message);
  process.exit(1);
});
"; then
    echo "✅ Backend готов"
else
    echo "❌ Ошибка подключения к базе данных"
    exit 1
fi

# 5. Настройка systemd сервиса для backend
echo "🔧 5/6 Настройка systemd сервиса..."
cat > /etc/systemd/system/finio-backend.service << EOF
[Unit]
Description=Finio Backend API
After=network.target mysql.service
Requires=mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=$WORK_DIR/backend
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable finio-backend
systemctl start finio-backend

# Проверка запуска backend
sleep 5
if curl -f -s http://localhost:8000/health >/dev/null 2>&1; then
    echo "✅ Backend запущен"
else
    echo "❌ Backend не запустился"
    systemctl status finio-backend
    exit 1
fi

# 6. Настройка Nginx с SSL
echo "🔒 6/6 Настройка Nginx..."

# СНАЧАЛА создаем базовую конфигурацию Nginx
cat > /etc/nginx/sites-available/finio << 'EOF'
server {
    listen 80;
    server_name studiofinance.ru www.studiofinance.ru;
    
    # Для получения SSL сертификата
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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
    
    # Bot webhook
    location /bot-webhook {
        proxy_pass http://localhost:8000/bot-webhook;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static frontend
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Активация конфигурации
ln -sf /etc/nginx/sites-available/finio /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "✅ Базовая конфигурация Nginx создана"

# ТЕПЕРЬ получаем SSL сертификат
echo "🔐 Получение SSL сертификата..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    --redirect

echo "✅ SSL сертификат получен"

# Создание простой главной страницы
cat > /var/www/html/index.html << 'EOF'
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Finio - Система управления финансами</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        h1 { font-size: 3rem; margin-bottom: 1rem; }
        p { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; }
        .btn {
            display: inline-block;
            padding: 12px 30px;
            background: #10B981;
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            transition: transform 0.2s;
        }
        .btn:hover { transform: translateY(-2px); }
        .performance {
            margin-top: 2rem;
            font-size: 0.9rem;
            opacity: 0.7;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>💰 Finio</h1>
        <p>Система управления финансами</p>
        <a href="https://t.me/FinanceStudio_bot/Finio" class="btn">Открыть Mini App</a>
        <div class="performance">
            ⚡ Ultra Fast: Node.js + MySQL 8+ + Nginx
        </div>
    </div>
</body>
</html>
EOF

# Настройка автообновления SSL
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

echo ""
echo "🎉 УСТАНОВКА ЗАВЕРШЕНА!"
echo ""
echo "🌐 Доступ:"
echo "• Веб-сайт: https://$DOMAIN"
echo "• API: https://$DOMAIN/api"
echo "• Mini App: https://t.me/FinanceStudio_bot/Finio"
echo "• Health: https://$DOMAIN/health"
echo ""
echo "🔧 Управление:"
echo "• Backend: systemctl status finio-backend"
echo "• MySQL: systemctl status mysql"
echo "• Nginx: systemctl status nginx"
echo ""
echo "📊 Производительность:"
echo "• Backend: Node.js + Express (Ultra Fast ⚡)"
echo "• Database: MySQL 8+ (Системный)"
echo "• Proxy: Nginx (Системный с SSL)"
echo ""
echo "⏰ Время установки: ~3-5 минут"
echo "🔄 SSL автообновление настроено"

# Финальная проверка
sleep 10
if curl -f -s https://$DOMAIN/health >/dev/null 2>&1; then
    echo ""
    echo "✅ ВСЕ РАБОТАЕТ! Сайт доступен по адресу: https://$DOMAIN"
else
    echo ""
    echo "⚠️ Проверьте настройки DNS - сайт может быть недоступен извне"
    echo "🔍 Локальная проверка: curl http://localhost:8000/health"
fi