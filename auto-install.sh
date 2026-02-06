#!/bin/bash

# Полностью автоматический установщик Finio
# Использование: sudo ./auto-install.sh

set -e

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
    error "Запустите скрипт с правами root: sudo ./auto-install.sh"
fi

echo -e "${BLUE}🚀 Автоматический установщик Finio${NC}"
echo "=================================================="

# Сбор информации от пользователя
read -p "Введите ваш домен (например: studiofinance.ru): " DOMAIN
read -p "Введите токен Telegram бота: " BOT_TOKEN
read -p "Введите ваш email для SSL сертификата: " EMAIL
read -p "Введите ваш Telegram ID (получите у @userinfobot): " ADMIN_ID

# Проверка обязательных параметров
if [ -z "$DOMAIN" ] || [ -z "$BOT_TOKEN" ] || [ -z "$EMAIL" ]; then
    error "Все поля обязательны для заполнения!"
fi

PROJECT_DIR="/var/www/finio"
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
SECRET_KEY=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)

log "🎯 Настройки:"
echo "   Домен: $DOMAIN"
echo "   Email: $EMAIL"
echo "   Проект: $PROJECT_DIR"
echo "   Пароль БД: $DB_PASSWORD"
echo ""

read -p "Продолжить установку? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

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

# Проверка package.json
if [ ! -f "package.json" ]; then
    error "package.json не найден в frontend/"
fi

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
if ! nginx -t; then
    error "Ошибка в конфигурации Nginx"
fi

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
sleep 5  # Ждем запуска сервисов

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

log "💾 Настройка автоматических бэкапов..."
cat > /usr/local/bin/finio-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/finio"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
sudo -u postgres pg_dump finio > $BACKUP_DIR/finio_db_$DATE.sql
tar -czf $BACKUP_DIR/finio_files_$DATE.tar.gz -C /var/www finio
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
echo "Backup completed: $DATE"
EOF

chmod +x /usr/local/bin/finio-backup.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/finio-backup.sh") | crontab -

log "🛡️ Настройка firewall..."
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443

log "✅ Проверка установки..."
sleep 10

# Проверка сервисов
if systemctl is-active --quiet finio; then
    log "✅ Backend запущен"
else
    warn "❌ Backend не запущен"
fi

if systemctl is-active --quiet nginx; then
    log "✅ Nginx запущен"
else
    warn "❌ Nginx не запущен"
fi

# Проверка доступности
if curl -f -s http://127.0.0.1:8000/health > /dev/null; then
    log "✅ Backend API работает"
else
    warn "❌ Backend API не отвечает"
fi

if curl -f -s http://127.0.0.1 > /dev/null; then
    log "✅ Frontend доступен"
else
    warn "❌ Frontend недоступен"
fi

# Проверка webhook
WEBHOOK_INFO=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo")
if echo "$WEBHOOK_INFO" | grep -q "https://$DOMAIN/bot-webhook/"; then
    log "✅ Telegram webhook работает"
else
    warn "❌ Проблемы с Telegram webhook"
fi

# Создание файла с информацией
cat > /root/finio-info.txt << EOF
=== ИНФОРМАЦИЯ О УСТАНОВКЕ FINIO ===

Домен: https://$DOMAIN
API: https://$DOMAIN/api/v1/docs
Telegram Bot: @$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getMe" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)

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
- Обновление: cd $PROJECT_DIR && git pull && sudo systemctl restart finio

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
echo -e "${YELLOW}⚠️ Следующие шаги:${NC}"
echo -e "   1. Откройте https://$DOMAIN и зарегистрируйтесь"
echo -e "   2. Найдите вашего бота в Telegram и отправьте /start"
echo -e "   3. Привяжите Telegram аккаунт в настройках сайта"
echo ""
echo -e "${GREEN}✅ Готово к использованию!${NC}"