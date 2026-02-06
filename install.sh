#!/bin/bash

# Автоматический скрипт установки Finio
# Использование: sudo ./install.sh your-domain.com your-telegram-bot-token

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Проверка аргументов
if [ $# -ne 2 ]; then
    error "Использование: sudo ./install.sh your-domain.com your-telegram-bot-token"
fi

DOMAIN=$1
BOT_TOKEN=$2
PROJECT_DIR="/var/www/finio"
DB_PASSWORD=$(openssl rand -base64 32)
SECRET_KEY=$(openssl rand -base64 64)

log "🚀 Начинаем установку Finio на домен: $DOMAIN"

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
    error "Запустите скрипт с правами root: sudo ./install.sh"
fi

# 1. Обновление системы
log "📦 Обновление системы..."
apt update && apt upgrade -y

# 2. Установка зависимостей
log "🔧 Установка зависимостей..."
apt install -y python3 python3-pip python3-venv nginx postgresql postgresql-contrib \
    certbot python3-certbot-nginx git curl software-properties-common

# Установка Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 3. Создание пользователя для приложения
log "👤 Создание пользователя приложения..."
if ! id "finio" &>/dev/null; then
    adduser --system --group --home $PROJECT_DIR finio
fi

# 4. Настройка PostgreSQL
log "🗄️ Настройка PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE finio;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE USER finio_user WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE finio TO finio_user;" 2>/dev/null || true
sudo -u postgres psql -c "ALTER USER finio_user CREATEDB;" 2>/dev/null || true

# 5. Копирование проекта
log "📁 Настройка проекта..."
mkdir -p $PROJECT_DIR
cp -r . $PROJECT_DIR/
chown -R finio:finio $PROJECT_DIR

# 6. Настройка backend
log "🐍 Настройка backend..."
cd $PROJECT_DIR/backend
sudo -u finio python3 -m venv venv
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
TELEGRAM_ADMIN_IDS=

# CORS settings
ALLOWED_HOSTS=https://$DOMAIN,https://www.$DOMAIN

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/finio/app.log
EOF

chown finio:finio .env

# 7. Применение миграций
log "🔄 Применение миграций БД..."
sudo -u finio $PROJECT_DIR/backend/venv/bin/alembic upgrade head

# 8. Сборка frontend
log "⚛️ Сборка frontend..."
cd $PROJECT_DIR/frontend
npm install
REACT_APP_API_URL=https://$DOMAIN/api/v1 npm run build

# Копирование собранных файлов
mkdir -p /var/www/finio/static
cp -r build/* /var/www/finio/static/
chown -R www-data:www-data /var/www/finio/static

# 9. Настройка Nginx
log "🌐 Настройка Nginx..."
cat > /etc/nginx/sites-available/finio << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL сертификаты (будут настроены позже)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Frontend (статичные файлы)
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

# 10. Получение SSL сертификата
log "🔒 Получение SSL сертификата..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# 11. Настройка systemd сервиса
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

# Активация и запуск сервиса
systemctl daemon-reload
systemctl enable finio
systemctl start finio

# 12. Настройка Telegram webhook
log "🤖 Настройка Telegram webhook..."
sleep 5  # Ждем запуска сервиса
curl -X POST "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" \
     -H "Content-Type: application/json" \
     -d "{\"url\": \"https://$DOMAIN/bot-webhook/\"}" || warn "Не удалось установить webhook"

# 13. Настройка автоматических бэкапов
log "💾 Настройка автоматических бэкапов..."
cat > /usr/local/bin/finio-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/finio"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Бэкап базы данных
sudo -u postgres pg_dump finio > $BACKUP_DIR/finio_db_$DATE.sql

# Бэкап файлов приложения
tar -czf $BACKUP_DIR/finio_files_$DATE.tar.gz -C /var/www finio

# Удаление старых бэкапов (старше 7 дней)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /usr/local/bin/finio-backup.sh

# Добавление в cron
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/finio-backup.sh") | crontab -

# 14. Настройка firewall
log "🛡️ Настройка firewall..."
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443

# 15. Перезапуск сервисов
log "🔄 Перезапуск сервисов..."
systemctl restart nginx
systemctl restart finio

# 16. Проверка установки
log "✅ Проверка установки..."
sleep 10

# Проверка backend
if curl -f -s https://$DOMAIN/health > /dev/null; then
    log "✅ Backend работает корректно"
else
    warn "❌ Backend не отвечает"
fi

# Проверка frontend
if curl -f -s https://$DOMAIN > /dev/null; then
    log "✅ Frontend доступен"
else
    warn "❌ Frontend недоступен"
fi

# Проверка webhook
WEBHOOK_INFO=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo")
if echo "$WEBHOOK_INFO" | grep -q "https://$DOMAIN/bot-webhook/"; then
    log "✅ Telegram webhook настроен"
else
    warn "❌ Проблемы с Telegram webhook"
fi

# Финальное сообщение
echo ""
echo -e "${GREEN}🎉 УСТАНОВКА ЗАВЕРШЕНА!${NC}"
echo ""
echo -e "${BLUE}📊 Ваше приложение доступно по адресу:${NC}"
echo -e "   🌐 Сайт: https://$DOMAIN"
echo -e "   🔧 API: https://$DOMAIN/api/v1/docs"
echo -e "   🤖 Telegram Bot: @FinanceStudio_bot"
echo ""
echo -e "${BLUE}📋 Данные для входа в БД:${NC}"
echo -e "   Database: finio"
echo -e "   User: finio_user"
echo -e "   Password: $DB_PASSWORD"
echo ""
echo -e "${BLUE}📁 Важные файлы:${NC}"
echo -e "   Конфигурация: $PROJECT_DIR/backend/.env"
echo -e "   Логи: /var/log/finio/"
echo -e "   Бэкапы: /var/backups/finio/"
echo ""
echo -e "${YELLOW}⚠️ Следующие шаги:${NC}"
echo -e "   1. Настройте TELEGRAM_ADMIN_IDS в $PROJECT_DIR/backend/.env"
echo -e "   2. Перезапустите сервис: sudo systemctl restart finio"
echo -e "   3. Протестируйте бота в Telegram"
echo ""
echo -e "${GREEN}✅ Готово к использованию!${NC}"