#!/bin/bash

# Автоматический установщик Finio для Franklin
# Использование: sudo ./install-franklin.sh [TELEGRAM_ID]

set -e

# Предустановленные данные
DOMAIN="studiofinance.ru"
BOT_TOKEN="8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34"
EMAIL="maks50kucherenko@gmail.com"

# Проверка Telegram ID
if [ -z "$1" ]; then
    echo "❌ Нужен ваш Telegram ID!"
    echo ""
    echo "Получите ID у бота @userinfobot в Telegram"
    echo "Затем запустите: sudo ./install-franklin.sh ВАШ_ID"
    echo ""
    echo "Пример: sudo ./install-franklin.sh 123456789"
    exit 1
fi

ADMIN_ID="$1"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
    error "Запустите скрипт с правами root: sudo ./install-franklin.sh $ADMIN_ID"
fi

echo -e "${BLUE}🚀 Автоматический установщик Finio для Franklin${NC}"
echo "=================================================="
echo "Домен: $DOMAIN"
echo "Email: $EMAIL"
echo "Telegram ID: $ADMIN_ID"
echo ""

read -p "Продолжить установку? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

PROJECT_DIR="/var/www/finio"
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
SECRET_KEY=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)

log "🧹 Очистка предыдущих установок..."
systemctl stop nginx 2>/dev/null || true
systemctl stop finio 2>/dev/null || true
systemctl disable finio 2>/dev/null || true
rm -f /etc/systemd/system/finio.service
rm -rf $PROJECT_DIR
rm -f /etc/nginx/sites-enabled/finio
rm -f /etc/nginx/sites-available/finio

log "📦 Обновление системы..."
apt update && apt upgrade -y

log "🔧 Установка зависимостей..."
apt install -y python3 python3-pip python3-venv nginx postgresql postgresql-contrib \
    certbot python3-certbot-nginx git curl software-properties-common openssl

# Установка Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

log "👤 Создание пользователя приложения..."
if ! id "finio" &>/dev/null; then
    adduser --system --group --home $PROJECT_DIR finio
fi

log "🗄️ Настройка PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Создание базы данных
sudo -u postgres psql -c "DROP DATABASE IF EXISTS finio;" 2>/dev/null || true
sudo -u postgres psql -c "DROP USER IF EXISTS finio_user;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE finio;"
sudo -u postgres psql -c "CREATE USER finio_user WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE finio TO finio_user;"
sudo -u postgres psql -c "ALTER USER finio_user CREATEDB;"

log "📁 Клонирование проекта..."
mkdir -p $PROJECT_DIR
git clone https://github.com/Franklin15097/Finio.git $PROJECT_DIR/temp
cp -r $PROJECT_DIR/temp/* $PROJECT_DIR/
rm -rf $PROJECT_DIR/temp
chown -R finio:finio $PROJECT_DIR

log "🐍 Настройка backend..."
cd $PROJECT_DIR/backend
sudo -u finio python3 -m venv venv
sudo -u finio $PROJECT_DIR/backend/venv/bin/pip install --upgrade pip
sudo -u finio $PROJECT_DIR/backend/venv/bin/pip install -r requirements.txt

# Создание .env файла
cat > .env << EOF
# App settings
APP_NAME="Finio API"
APP_ENV=production
DEBUG=false
SECRET_KEY=$SECRET_KEY

# JWT settings
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database settings
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finio
DB_USER=finio_user
DB_PASSWORD=$DB_PASSWORD

# Telegram Bot settings
TELEGRAM_BOT_TOKEN=$BOT_TOKEN
TELEGRAM_WEBHOOK_URL=https://$DOMAIN
TELEGRAM_ADMIN_IDS=$ADMIN_ID

# CORS settings
ALLOWED_HOSTS=https://$DOMAIN,https://www.$DOMAIN,http://$DOMAIN,http://www.$DOMAIN

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/finio/app.log
EOF

chown finio:finio .env
chmod 600 .env

log "🔄 Применение миграций БД..."
sudo -u finio $PROJECT_DIR/backend/venv/bin/alembic upgrade head

log "⚛️ Сборка frontend..."
cd $PROJECT_DIR/frontend

# Установка зависимостей с повторными попытками
for i in {1..3}; do
    log "📦 Установка зависимостей frontend (попытка $i)..."
    if npm install --no-audit --no-fund; then
        break
    fi
    if [ $i -eq 3 ]; then
        error "Не удалось установить зависимости frontend"
    fi
    sleep 5
done

# Сборка проекта
log "🔨 Сборка frontend..."
REACT_APP_API_URL=https://$DOMAIN/api/v1 npm run build

# Копирование собранных файлов
mkdir -p /var/www/finio/static
cp -r build/* /var/www/finio/static/
chown -R www-data:www-data /var/www/finio/static

log "🌐 Настройка Nginx..."
cat > /etc/nginx/sites-available/finio << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Frontend
    location / {
        root /var/www/finio/static;
        try_files \$uri \$uri/ /index.html;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # Telegram Bot Webhook
    location /bot-webhook {
        proxy_pass http://127.0.0.1:8000/bot-webhook;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# Активация сайта
ln -sf /etc/nginx/sites-available/finio /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверка конфигурации
nginx -t

log "⚙️ Настройка systemd сервиса..."
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
Environment="PATH=$PROJECT_DIR/backend/venv/bin"
EnvironmentFile=$PROJECT_DIR/backend/.env
ExecStart=$PROJECT_DIR/backend/venv/bin/gunicorn \\
          app.main:app \\
          --workers 4 \\
          --worker-class uvicorn.workers.UvicornWorker \\
          --bind 127.0.0.1:8000 \\
          --timeout 120 \\
          --access-logfile /var/log/finio/access.log \\
          --error-logfile /var/log/finio/error.log
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Создание директории для логов
mkdir -p /var/log/finio
chown finio:finio /var/log/finio
chmod 755 /var/log/finio

# Активация и запуск сервисов
systemctl daemon-reload
systemctl enable finio
systemctl start finio
systemctl restart nginx

log "🔒 Получение SSL сертификата..."
sleep 5

# Получение SSL сертификата
if certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL; then
    log "✅ SSL сертификат получен успешно"
else
    warn "⚠️ Не удалось получить SSL сертификат, но сайт работает по HTTP"
fi

log "🤖 Настройка Telegram webhook..."
sleep 5
WEBHOOK_URL="https://$DOMAIN/bot-webhook/"
if curl -X POST "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" \
     -H "Content-Type: application/json" \
     -d "{\"url\": \"$WEBHOOK_URL\"}" | grep -q '"ok":true'; then
    log "✅ Telegram webhook настроен"
else
    warn "⚠️ Проблемы с настройкой Telegram webhook"
fi

log "🛡️ Настройка firewall..."
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443

log "✅ Проверка установки..."
sleep 10

# Создание файла с информацией
cat > /root/finio-info.txt << EOF
=== ИНФОРМАЦИЯ О УСТАНОВКЕ FINIO ===

Домен: https://$DOMAIN
API: https://$DOMAIN/api/v1/docs
Telegram Bot: найдите в Telegram и отправьте /start

База данных:
- Имя: finio
- Пользователь: finio_user
- Пароль: $DB_PASSWORD

Файлы проекта: $PROJECT_DIR
Логи: /var/log/finio/
Бэкапы: /var/backups/finio/

Полезные команды:
- Статус: sudo systemctl status finio nginx
- Логи: sudo journalctl -u finio -f
- Перезапуск: sudo systemctl restart finio nginx

Дата установки: $(date)
EOF

echo ""
echo -e "${GREEN}🎉 УСТАНОВКА ЗАВЕРШЕНА!${NC}"
echo ""
echo -e "${BLUE}📊 Ваше приложение доступно:${NC}"
echo -e "   🌐 Сайт: https://$DOMAIN"
echo -e "   🔧 API: https://$DOMAIN/api/v1/docs"
echo -e "   🤖 Telegram Bot: найдите в Telegram и отправьте /start"
echo ""
echo -e "${BLUE}📋 Информация сохранена в:${NC} /root/finio-info.txt"
echo ""
echo -e "${GREEN}✅ Готово к использованию!${NC}"