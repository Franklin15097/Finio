#!/bin/bash

# ФИНАЛЬНЫЙ УСТАНОВЩИК FINIO ДЛЯ FRANKLIN
# Полностью автоматический с исправлением всех проблем
# Использование: sudo ./final-install.sh

set -e

# Предустановленные данные Franklin
DOMAIN="studiofinance.ru"
BOT_TOKEN="8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34"
EMAIL="maks50kucherenko@gmail.com"
ADMIN_ID="1086679273"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

log() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }
info() { echo -e "${BLUE}[i]${NC} $1"; }

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
    error "Запустите скрипт с правами root: sudo ./final-install.sh"
fi

clear
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                    🚀 FINIO INSTALLER                        ║${NC}"
echo -e "${PURPLE}║                 Финальная версия для Franklin                ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Настройки установки:${NC}"
echo "   🌐 Домен: $DOMAIN"
echo "   📧 Email: $EMAIL"
echo "   🤖 Telegram ID: $ADMIN_ID"
echo "   📁 Проект: /var/www/finio"
echo ""

read -p "🚀 Начать установку? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Установка отменена."
    exit 1
fi

PROJECT_DIR="/var/www/finio"
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
SECRET_KEY=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)

echo ""
echo -e "${PURPLE}════════════════════════════════════════════════════════════════${NC}"

# 1. ПОЛНАЯ ОЧИСТКА
log "🧹 Полная очистка предыдущих установок..."
systemctl stop nginx 2>/dev/null || true
systemctl stop finio 2>/dev/null || true
systemctl disable finio 2>/dev/null || true
pkill -f "gunicorn.*finio" 2>/dev/null || true
pkill -f "uvicorn.*finio" 2>/dev/null || true

rm -f /etc/systemd/system/finio.service
rm -rf $PROJECT_DIR
rm -f /etc/nginx/sites-enabled/finio
rm -f /etc/nginx/sites-available/finio
rm -rf /var/log/finio
rm -rf /var/backups/finio

# Очистка базы данных
sudo -u postgres psql -c "DROP DATABASE IF EXISTS finio;" 2>/dev/null || true
sudo -u postgres psql -c "DROP USER IF EXISTS finio_user;" 2>/dev/null || true

# Удаление пользователя finio
userdel -r finio 2>/dev/null || true

systemctl daemon-reload

# 2. ОБНОВЛЕНИЕ СИСТЕМЫ
log "📦 Обновление системы..."
export DEBIAN_FRONTEND=noninteractive
apt update -qq
apt upgrade -y -qq

# 3. УСТАНОВКА ЗАВИСИМОСТЕЙ
log "🔧 Установка всех зависимостей..."
apt install -y -qq \
    python3 python3-pip python3-venv python3-dev \
    nginx postgresql postgresql-contrib \
    certbot python3-certbot-nginx \
    git curl wget software-properties-common \
    openssl build-essential \
    ufw fail2ban locales

# Настройка локалей
log "🌐 Настройка локалей..."
locale-gen en_US.UTF-8
update-locale LANG=en_US.UTF-8
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# Установка Node.js 18
if ! command -v node &> /dev/null; then
    info "📦 Установка Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - >/dev/null 2>&1
    apt install -y -qq nodejs
fi

# 4. СОЗДАНИЕ ПОЛЬЗОВАТЕЛЯ
log "👤 Создание системного пользователя finio..."
# Удаляем старого пользователя если есть
if id "finio" &>/dev/null; then
    userdel -r finio 2>/dev/null || true
fi

# Создаем нового пользователя
adduser --system --group --home $PROJECT_DIR --shell /bin/bash finio
usermod -aG www-data finio

# Создаем домашнюю директорию если не существует
mkdir -p $PROJECT_DIR
chown finio:finio $PROJECT_DIR

# 5. НАСТРОЙКА POSTGRESQL
log "🗄️ Настройка PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Ждем запуска PostgreSQL
sleep 5

# Настройка локали для PostgreSQL
locale-gen en_US.UTF-8
update-locale LANG=en_US.UTF-8

# Перезапуск PostgreSQL после настройки локали
systemctl restart postgresql
sleep 3

# Создание базы данных с правильными правами
log "🗄️ Создание базы данных..."
sudo -u postgres psql << EOF
DROP DATABASE IF EXISTS finio;
DROP USER IF EXISTS finio_user;
CREATE USER finio_user WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE finio WITH 
    OWNER finio_user 
    ENCODING 'UTF8' 
    LC_COLLATE 'C' 
    LC_CTYPE 'C' 
    TEMPLATE template0;
GRANT ALL PRIVILEGES ON DATABASE finio TO finio_user;
ALTER USER finio_user CREATEDB;
\\q
EOF

# 6. КЛОНИРОВАНИЕ И НАСТРОЙКА ПРОЕКТА
log "📁 Клонирование проекта Finio..."
mkdir -p $PROJECT_DIR
git clone https://github.com/Franklin15097/Finio.git $PROJECT_DIR/temp
cp -r $PROJECT_DIR/temp/* $PROJECT_DIR/
rm -rf $PROJECT_DIR/temp

# Установка правильных прав
chown -R finio:finio $PROJECT_DIR
chmod -R 755 $PROJECT_DIR

# 7. НАСТРОЙКА BACKEND
log "🐍 Настройка Python backend..."
cd $PROJECT_DIR/backend

# Создание виртуального окружения
sudo -u finio python3 -m venv venv
sudo -u finio $PROJECT_DIR/backend/venv/bin/pip install --upgrade pip setuptools wheel

# Установка зависимостей с обработкой ошибок
info "📦 Установка Python зависимостей..."
if ! sudo -u finio $PROJECT_DIR/backend/venv/bin/pip install -r requirements.txt; then
    warn "Повторная попытка установки зависимостей..."
    sudo -u finio $PROJECT_DIR/backend/venv/bin/pip install --no-cache-dir -r requirements.txt
fi

# Создание .env файла с правильными настройками
log "⚙️ Создание конфигурации backend..."
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
ALLOWED_HOSTS=["https://$DOMAIN","https://www.$DOMAIN","http://$DOMAIN","http://www.$DOMAIN"]

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/finio/app.log
EOF

chown finio:finio .env
chmod 600 .env

# 8. ПРИМЕНЕНИЕ МИГРАЦИЙ
log "🔄 Применение миграций базы данных..."
sudo -u finio $PROJECT_DIR/backend/venv/bin/alembic upgrade head

# 9. СБОРКА FRONTEND
log "⚛️ Сборка React frontend..."
cd $PROJECT_DIR/frontend

# Проверка package.json
if [ ! -f "package.json" ]; then
    error "package.json не найден в frontend/"
fi

# Очистка npm кэша
npm cache clean --force 2>/dev/null || true

# Установка зависимостей с несколькими попытками
for i in {1..3}; do
    info "📦 Установка зависимостей frontend (попытка $i/3)..."
    if npm install --no-audit --no-fund --legacy-peer-deps; then
        break
    fi
    if [ $i -eq 3 ]; then
        error "Не удалось установить зависимости frontend после 3 попыток"
    fi
    warn "Попытка $i не удалась, повторяем через 5 секунд..."
    sleep 5
done

# Сборка проекта
log "🔨 Сборка production версии frontend..."
REACT_APP_API_URL=https://$DOMAIN/api/v1 npm run build

# Копирование собранных файлов
mkdir -p /var/www/finio/static
cp -r build/* /var/www/finio/static/
chown -R www-data:www-data /var/www/finio/static
chmod -R 755 /var/www/finio/static

# 10. НАСТРОЙКА NGINX
log "🌐 Настройка Nginx..."
cat > /etc/nginx/sites-available/finio << 'EOF'
server {
    listen 80;
    server_name studiofinance.ru www.studiofinance.ru;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Frontend
    location / {
        root /var/www/finio/static;
        try_files $uri $uri/ /index.html;
        expires 30d;
        add_header Cache-Control "public, immutable";
        
        # Handle React Router
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://studiofinance.ru" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    }

    # Telegram Bot Webhook
    location /bot-webhook {
        proxy_pass http://127.0.0.1:8000/bot-webhook;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60;
        proxy_connect_timeout 60;
        proxy_send_timeout 60;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        proxy_set_header Host $host;
        access_log off;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
}
EOF

# Активация сайта
ln -sf /etc/nginx/sites-available/finio /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверка конфигурации Nginx
if ! nginx -t; then
    error "Ошибка в конфигурации Nginx"
fi

# 11. СОЗДАНИЕ SYSTEMD СЕРВИСА
log "⚙️ Создание systemd сервиса..."

# Создание директории для логов
mkdir -p /var/log/finio
chown finio:finio /var/log/finio
chmod 755 /var/log/finio

cat > /etc/systemd/system/finio.service << EOF
[Unit]
Description=Finio Backend API
After=network.target postgresql.service
Requires=postgresql.service
StartLimitIntervalSec=0

[Service]
Type=simple
User=finio
Group=finio
WorkingDirectory=$PROJECT_DIR/backend
Environment="PATH=$PROJECT_DIR/backend/venv/bin"
EnvironmentFile=$PROJECT_DIR/backend/.env
ExecStart=$PROJECT_DIR/backend/venv/bin/gunicorn \\
          app.main:app \\
          --workers 2 \\
          --worker-class uvicorn.workers.UvicornWorker \\
          --bind 127.0.0.1:8000 \\
          --timeout 120 \\
          --keepalive 5 \\
          --max-requests 1000 \\
          --max-requests-jitter 100 \\
          --access-logfile /var/log/finio/access.log \\
          --error-logfile /var/log/finio/error.log \\
          --log-level info
Restart=always
RestartSec=10
KillMode=mixed
TimeoutStopSec=5

[Install]
WantedBy=multi-user.target
EOF

# 12. ЗАПУСК СЕРВИСОВ
log "🚀 Запуск всех сервисов..."
systemctl daemon-reload
systemctl enable finio
systemctl start finio
systemctl restart nginx

# Ждем запуска сервисов
sleep 10

# Проверка запуска backend
if ! systemctl is-active --quiet finio; then
    warn "Backend не запустился, проверяем логи..."
    journalctl -u finio --no-pager -n 20
    error "Backend не удалось запустить"
fi

# 13. НАСТРОЙКА SSL
log "🔒 Получение SSL сертификата..."
if certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect; then
    log "✅ SSL сертификат успешно получен и настроен"
else
    warn "⚠️ Не удалось получить SSL сертификат, сайт работает по HTTP"
fi

# 14. НАСТРОЙКА TELEGRAM WEBHOOK
log "🤖 Настройка Telegram webhook..."
sleep 5

WEBHOOK_URL="https://$DOMAIN/bot-webhook/"
WEBHOOK_RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" \
     -H "Content-Type: application/json" \
     -d "{\"url\": \"$WEBHOOK_URL\"}")

if echo "$WEBHOOK_RESPONSE" | grep -q '"ok":true'; then
    log "✅ Telegram webhook успешно настроен"
else
    warn "⚠️ Проблемы с настройкой Telegram webhook"
    echo "Ответ API: $WEBHOOK_RESPONSE"
fi

# Настройка команд бота
curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/setMyCommands" \
     -H "Content-Type: application/json" \
     -d '{
       "commands": [
         {"command": "start", "description": "Начать работу с ботом"},
         {"command": "help", "description": "Справка по командам"},
         {"command": "balance", "description": "Показать текущий баланс"},
         {"command": "stats", "description": "Показать статистику"},
         {"command": "link", "description": "Привязать аккаунт к сайту"}
       ]
     }' >/dev/null

# 15. НАСТРОЙКА АВТОМАТИЧЕСКИХ БЭКАПОВ
log "💾 Настройка автоматических бэкапов..."
mkdir -p /var/backups/finio

cat > /usr/local/bin/finio-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/finio"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Бэкап базы данных
sudo -u postgres pg_dump finio > $BACKUP_DIR/finio_db_$DATE.sql

# Бэкап файлов приложения
tar -czf $BACKUP_DIR/finio_files_$DATE.tar.gz -C /var/www finio --exclude='finio/backend/venv' --exclude='finio/frontend/node_modules'

# Удаление старых бэкапов (старше 7 дней)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "$(date): Backup completed successfully" >> /var/log/finio-backup.log
EOF

chmod +x /usr/local/bin/finio-backup.sh

# Добавление в cron (ежедневно в 2:00)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/finio-backup.sh") | crontab -

# 16. НАСТРОЙКА БЕЗОПАСНОСТИ
log "🛡️ Настройка безопасности..."

# Firewall
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80
ufw allow 443

# Fail2ban для защиты SSH
systemctl enable fail2ban
systemctl start fail2ban

# 17. ФИНАЛЬНАЯ ПРОВЕРКА
log "✅ Финальная проверка системы..."
sleep 15

# Проверка сервисов
SERVICES_OK=true

if systemctl is-active --quiet finio; then
    log "✅ Backend сервис работает"
else
    warn "❌ Backend сервис не работает"
    SERVICES_OK=false
fi

if systemctl is-active --quiet nginx; then
    log "✅ Nginx работает"
else
    warn "❌ Nginx не работает"
    SERVICES_OK=false
fi

if systemctl is-active --quiet postgresql; then
    log "✅ PostgreSQL работает"
else
    warn "❌ PostgreSQL не работает"
    SERVICES_OK=false
fi

# Проверка доступности API
if curl -f -s http://127.0.0.1:8000/health >/dev/null; then
    log "✅ Backend API отвечает"
else
    warn "❌ Backend API не отвечает"
    SERVICES_OK=false
fi

# Проверка frontend
if curl -f -s http://127.0.0.1 >/dev/null; then
    log "✅ Frontend доступен"
else
    warn "❌ Frontend недоступен"
    SERVICES_OK=false
fi

# Проверка webhook
WEBHOOK_INFO=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo")
if echo "$WEBHOOK_INFO" | grep -q "https://$DOMAIN/bot-webhook/"; then
    log "✅ Telegram webhook настроен корректно"
else
    warn "❌ Проблемы с Telegram webhook"
fi

# 18. СОЗДАНИЕ ФАЙЛА С ИНФОРМАЦИЕЙ
cat > /root/finio-installation-info.txt << EOF
╔══════════════════════════════════════════════════════════════╗
║                    FINIO INSTALLATION INFO                  ║
╚══════════════════════════════════════════════════════════════╝

🌐 ДОСТУП К ПРИЛОЖЕНИЮ:
   Сайт: https://$DOMAIN
   API документация: https://$DOMAIN/api/v1/docs
   Telegram Bot: найдите в Telegram и отправьте /start

🗄️ БАЗА ДАННЫХ:
   Имя: finio
   Пользователь: finio_user
   Пароль: $DB_PASSWORD

📁 ФАЙЛЫ ПРОЕКТА:
   Основная директория: $PROJECT_DIR
   Логи приложения: /var/log/finio/
   Бэкапы: /var/backups/finio/

🔧 ПОЛЕЗНЫЕ КОМАНДЫ:
   Статус сервисов: sudo systemctl status finio nginx postgresql
   Логи в реальном времени: sudo journalctl -u finio -f
   Перезапуск: sudo systemctl restart finio nginx
   Обновление проекта: cd $PROJECT_DIR && git pull && sudo systemctl restart finio
   Создать бэкап: sudo /usr/local/bin/finio-backup.sh

🤖 TELEGRAM BOT:
   Токен: $BOT_TOKEN
   Webhook: https://$DOMAIN/bot-webhook/
   Admin ID: $ADMIN_ID

🔒 БЕЗОПАСНОСТЬ:
   SSL сертификат: автоматическое обновление настроено
   Firewall: активен (порты 22, 80, 443)
   Fail2ban: активен для защиты SSH
   Автоматические бэкапы: ежедневно в 2:00

📅 ДАТА УСТАНОВКИ: $(date)
🏷️ ВЕРСИЯ УСТАНОВЩИКА: Final v1.0

╔══════════════════════════════════════════════════════════════╗
║  Сохраните этот файл! Он содержит важную информацию.        ║
╚══════════════════════════════════════════════════════════════╝
EOF

# 19. ФИНАЛЬНОЕ СООБЩЕНИЕ
clear
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                    🎉 УСТАНОВКА ЗАВЕРШЕНА!                  ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$SERVICES_OK" = true ]; then
    echo -e "${GREEN}✅ Все сервисы работают корректно!${NC}"
else
    echo -e "${YELLOW}⚠️ Некоторые сервисы требуют внимания (см. выше)${NC}"
fi

echo ""
echo -e "${BLUE}🌐 Ваше приложение доступно по адресу:${NC}"
echo -e "   ${GREEN}https://$DOMAIN${NC}"
echo ""
echo -e "${BLUE}🔧 API документация:${NC}"
echo -e "   ${GREEN}https://$DOMAIN/api/v1/docs${NC}"
echo ""
echo -e "${BLUE}🤖 Telegram бот:${NC}"
echo -e "   Найдите в Telegram и отправьте ${GREEN}/start${NC}"
echo ""
echo -e "${BLUE}📋 Полная информация сохранена в:${NC}"
echo -e "   ${GREEN}/root/finio-installation-info.txt${NC}"
echo ""
echo -e "${YELLOW}📝 Следующие шаги:${NC}"
echo -e "   1. Откройте ${GREEN}https://$DOMAIN${NC} и зарегистрируйтесь"
echo -e "   2. Найдите вашего бота в Telegram и отправьте ${GREEN}/start${NC}"
echo -e "   3. Привяжите Telegram аккаунт в настройках сайта"
echo ""
echo -e "${GREEN}🎯 Готово к использованию!${NC}"
echo ""
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║           Спасибо за использование Finio! 💰                ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"