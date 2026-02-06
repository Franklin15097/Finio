#!/bin/bash

# СУПЕР-ПРОСТОЙ УСТАНОВЩИК FINIO
# Максимально надежный, без лишних сложностей

set -e

# Цвета
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[OK]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

# Проверка root
if [ "$EUID" -ne 0 ]; then
    error "Запустите с sudo: sudo ./simple-install.sh"
fi

# Данные Franklin
DOMAIN="studiofinance.ru"
BOT_TOKEN="8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34"
EMAIL="maks50kucherenko@gmail.com"
ADMIN_ID="1086679273"
PROJECT_DIR="/var/www/finio"

echo "🚀 Простая установка Finio"
echo "Домен: $DOMAIN"
echo ""

# 1. ПОЛНАЯ ОЧИСТКА
log "Полная очистка..."
systemctl stop nginx 2>/dev/null || true
systemctl stop finio 2>/dev/null || true
systemctl disable finio 2>/dev/null || true
pkill -f finio 2>/dev/null || true
rm -rf /var/www/finio
rm -f /etc/systemd/system/finio.service
rm -f /etc/nginx/sites-enabled/finio
rm -f /etc/nginx/sites-available/finio
userdel -r finio 2>/dev/null || true
sudo -u postgres psql -c "DROP DATABASE IF EXISTS finio;" 2>/dev/null || true
sudo -u postgres psql -c "DROP USER IF EXISTS finio_user;" 2>/dev/null || true

# 2. ОБНОВЛЕНИЕ СИСТЕМЫ
log "Обновление системы..."
apt update -y
apt upgrade -y

# 3. УСТАНОВКА БАЗОВЫХ ПАКЕТОВ
log "Установка пакетов..."
apt install -y python3 python3-pip python3-venv nginx postgresql postgresql-contrib git curl

# 4. УСТАНОВКА NODE.JS
log "Установка Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 5. СОЗДАНИЕ ПОЛЬЗОВАТЕЛЯ
log "Создание пользователя finio..."
useradd -r -s /bin/bash -d $PROJECT_DIR finio
mkdir -p $PROJECT_DIR
chown finio:finio $PROJECT_DIR

# 6. НАСТРОЙКА POSTGRESQL
log "Настройка PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql
sleep 3

DB_PASSWORD="maks15097pass"

# Экранируем пароль для PostgreSQL
sudo -u postgres psql << 'EOF'
DROP USER IF EXISTS finio_user;
DROP DATABASE IF EXISTS finio;
CREATE USER finio_user WITH PASSWORD 'maks15097pass';
CREATE DATABASE finio OWNER finio_user;
GRANT ALL PRIVILEGES ON DATABASE finio TO finio_user;
ALTER USER finio_user CREATEDB;
EOF

# 7. КЛОНИРОВАНИЕ ПРОЕКТА
log "Клонирование проекта..."
git clone https://github.com/Franklin15097/Finio.git $PROJECT_DIR/temp
cp -r $PROJECT_DIR/temp/* $PROJECT_DIR/
rm -rf $PROJECT_DIR/temp
chown -R finio:finio $PROJECT_DIR

# 8. НАСТРОЙКА BACKEND
log "Настройка backend..."
cd $PROJECT_DIR/backend
sudo -u finio python3 -m venv venv
sudo -u finio ./venv/bin/pip install -r requirements.txt

# Создание .env
mkdir -p /var/log/finio
chown finio:finio /var/log/finio

cat > .env << EOF
APP_NAME="Finio API"
APP_ENV=production
DEBUG=false
SECRET_KEY=maks-super-secret-key-15097

DB_HOST=localhost
DB_PORT=5432
DB_NAME=finio
DB_USER=finio_user
DB_PASSWORD=maks15097pass

TELEGRAM_BOT_TOKEN=$BOT_TOKEN
TELEGRAM_WEBHOOK_URL=https://$DOMAIN
TELEGRAM_ADMIN_IDS=$ADMIN_ID

ALLOWED_HOSTS=["*"]
LOG_LEVEL=INFO
LOG_FILE=/var/log/finio/app.log
EOF

chown finio:finio .env

# 9. МИГРАЦИИ
log "Применение миграций..."
# Проверим подключение к базе
if sudo -u finio ./venv/bin/python -c "
import os
os.environ['DB_PASSWORD'] = 'maks15097pass'
from app.core.database import engine
import asyncio
async def test():
    try:
        async with engine.begin() as conn:
            print('DB connection OK')
    except Exception as e:
        print(f'DB error: {e}')
        exit(1)
asyncio.run(test())
"; then
    log "✅ Подключение к базе данных работает"
else
    error "❌ Не удается подключиться к базе данных"
fi

sudo -u finio ./venv/bin/alembic upgrade head

# 10. СБОРКА FRONTEND
log "Сборка frontend..."
cd $PROJECT_DIR/frontend
npm install
npm run build
mkdir -p /var/www/html/finio
cp -r build/* /var/www/html/finio/

# 11. НАСТРОЙКА NGINX
log "Настройка Nginx..."
cat > /etc/nginx/sites-available/finio << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        root /var/www/html/finio;
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location /bot-webhook {
        proxy_pass http://127.0.0.1:8000/bot-webhook;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location /health {
        proxy_pass http://127.0.0.1:8000/health;
    }
}
EOF

ln -sf /etc/nginx/sites-available/finio /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t

# 12. СОЗДАНИЕ СЕРВИСА
log "Создание systemd сервиса..."
mkdir -p /var/log/finio
chown finio:finio /var/log/finio

cat > /etc/systemd/system/finio.service << EOF
[Unit]
Description=Finio Backend API
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=finio
Group=finio
WorkingDirectory=$PROJECT_DIR/backend
Environment=PATH=$PROJECT_DIR/backend/venv/bin
EnvironmentFile=$PROJECT_DIR/backend/.env
ExecStart=$PROJECT_DIR/backend/venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5
StandardOutput=append:/var/log/finio/app.log
StandardError=append:/var/log/finio/error.log

[Install]
WantedBy=multi-user.target
EOF

# 13. ЗАПУСК СЕРВИСОВ
log "Запуск сервисов..."
systemctl daemon-reload
systemctl enable finio
systemctl start finio
systemctl restart nginx

# 14. ПРОВЕРКА
log "Проверка работы..."
sleep 15

if systemctl is-active --quiet finio; then
    log "✅ Backend запущен"
else
    warn "❌ Backend не запустился, проверяем логи..."
    journalctl -u finio -n 10 --no-pager
fi

if systemctl is-active --quiet nginx; then
    log "✅ Nginx запущен"
else
    warn "❌ Nginx не запустился"
fi

# Проверяем API несколько раз
for i in {1..5}; do
    if curl -s http://127.0.0.1:8000/health | grep -q "healthy"; then
        log "✅ API работает"
        break
    else
        warn "⚠️ API не отвечает, попытка $i/5..."
        sleep 3
    fi
done

# 15. НАСТРОЙКА SSL
log "Получение SSL сертификата..."
apt install -y certbot python3-certbot-nginx
if certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL; then
    log "✅ SSL сертификат получен"
    WEBHOOK_URL="https://$DOMAIN/bot-webhook/"
else
    warn "⚠️ SSL не получен, используем HTTP"
    WEBHOOK_URL="http://$DOMAIN/bot-webhook/"
fi

# 16. НАСТРОЙКА TELEGRAM WEBHOOK
log "Настройка Telegram webhook..."
sleep 5
curl -X POST "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" \
     -H "Content-Type: application/json" \
     -d "{\"url\": \"$WEBHOOK_URL\"}" || warn "Webhook не настроен"

# Настройка команд бота
curl -X POST "https://api.telegram.org/bot$BOT_TOKEN/setMyCommands" \
     -H "Content-Type: application/json" \
     -d '{
       "commands": [
         {"command": "start", "description": "Начать работу"},
         {"command": "help", "description": "Справка"},
         {"command": "balance", "description": "Баланс"},
         {"command": "stats", "description": "Статистика"}
       ]
     }' || warn "Команды бота не настроены"

# 17. ИНФОРМАЦИЯ
cat > /root/finio-info.txt << EOF
=== FINIO УСТАНОВЛЕН ===

Сайт: http://$DOMAIN
API: http://$DOMAIN/api/v1/docs
Telegram Bot: найдите в Telegram

База данных:
- Пользователь: finio_user
- Пароль: $DB_PASSWORD

Команды:
- Статус: sudo systemctl status finio nginx
- Логи: sudo journalctl -u finio -f
- Перезапуск: sudo systemctl restart finio nginx
EOF

echo ""
echo "🎉 УСТАНОВКА ЗАВЕРШЕНА!"
echo ""
echo "🌐 Сайт: http://$DOMAIN"
echo "🔧 API: http://$DOMAIN/api/v1/docs"
echo "🤖 Telegram: найдите бота и отправьте /start"
echo ""
echo "📋 Информация: /root/finio-info.txt"
echo ""
echo "Если что-то не работает:"
echo "sudo systemctl status finio nginx"
echo "sudo journalctl -u finio -f"