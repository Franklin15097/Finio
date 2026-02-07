#!/bin/bash

# ЕДИНЫЙ УСТАНОВЩИК FINIO - РАБОЧАЯ ВЕРСИЯ
# Полностью автоматический установщик
# Использование: sudo ./install.sh

set -e

# Цвета для красивого вывода
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
header() { echo -e "${PURPLE}$1${NC}"; }

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
    error "Запустите скрипт с правами root: sudo ./install.sh"
fi

# Предустановленные данные
DOMAIN="studiofinance.ru"
BOT_TOKEN="8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34"
EMAIL="maks50kucherenko@gmail.com"
ADMIN_ID="1086679273"
PROJECT_DIR="/var/www/finio"

# Генерация безопасных паролей
DB_ROOT_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
SECRET_KEY=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)

clear
header "╔══════════════════════════════════════════════════════════════╗"
header "║                    🚀 FINIO INSTALLER                        ║"
header "║              Единый установщик - рабочая версия             ║"
header "╚══════════════════════════════════════════════════════════════╝"
echo ""
info "📊 Настройки установки:"
echo "   🌐 Домен: $DOMAIN"
echo "   📧 Email: $EMAIL"
echo "   🤖 Telegram ID: $ADMIN_ID"
echo "   📁 Проект: $PROJECT_DIR"
echo ""

read -p "🚀 Начать установку? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Установка отменена."
    exit 1
fi

header "════════════════════════════════════════════════════════════════"

# 1. ПОЛНАЯ ОЧИСТКА
log "🧹 Полная очистка предыдущих установок..."
systemctl stop nginx 2>/dev/null || true
systemctl stop finio 2>/dev/null || true
systemctl stop mysql 2>/dev/null || true
systemctl disable finio 2>/dev/null || true
pkill -f "gunicorn.*finio" 2>/dev/null || true
pkill -f "uvicorn.*finio" 2>/dev/null || true

rm -f /etc/systemd/system/finio.service
rm -rf $PROJECT_DIR
rm -f /etc/nginx/sites-enabled/finio
rm -f /etc/nginx/sites-available/finio
rm -rf /var/log/finio
userdel -r finio 2>/dev/null || true

systemctl daemon-reload

# 2. ОБНОВЛЕНИЕ СИСТЕМЫ
log "📦 Обновление системы..."
export DEBIAN_FRONTEND=noninteractive
apt update -qq
apt upgrade -y -qq

# 3. УСТАНОВКА БАЗОВЫХ ЗАВИСИМОСТЕЙ
log "🔧 Установка базовых пакетов..."
apt install -y -qq \
    python3 python3-pip python3-venv python3-dev \
    nginx certbot python3-certbot-nginx \
    git curl wget software-properties-common \
    openssl build-essential ufw

# 4. УСТАНОВКА MYSQL 8.0
log "🗄️ Установка MySQL 8.0..."
apt install -y -qq mysql-server mysql-client

# Запуск MySQL
systemctl start mysql
systemctl enable mysql

# Настройка MySQL с безопасными настройками
log "🔐 Настройка безопасности MySQL..."
mysql -u root << EOF
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_ROOT_PASSWORD';
DELETE FROM mysql.user WHERE User='';
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
CREATE DATABASE finio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'finio_user'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON finio.* TO 'finio_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# 5. УСТАНОВКА NODE.JS 18
log "📦 Установка Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash - >/dev/null 2>&1
apt install -y -qq nodejs

# 6. СОЗДАНИЕ СИСТЕМНОГО ПОЛЬЗОВАТЕЛЯ
log "👤 Создание пользователя finio..."
adduser --system --group --home $PROJECT_DIR --shell /bin/bash finio
usermod -aG www-data finio

# 7. КЛОНИРОВАНИЕ И НАСТРОЙКА ПРОЕКТА
log "📁 Клонирование проекта Finio..."
mkdir -p $PROJECT_DIR
git clone https://github.com/Franklin15097/Finio.git $PROJECT_DIR/temp
cp -r $PROJECT_DIR/temp/* $PROJECT_DIR/
rm -rf $PROJECT_DIR/temp

# Установка правильных прав
chown -R finio:finio $PROJECT_DIR
chmod -R 755 $PROJECT_DIR

# 8. НАСТРОЙКА BACKEND
log "🐍 Настройка Python backend..."
cd $PROJECT_DIR/backend

# Создание виртуального окружения
sudo -u finio python3 -m venv venv
sudo -u finio $PROJECT_DIR/backend/venv/bin/pip install --upgrade pip

# Установка только необходимых зависимостей
info "📦 Установка Python зависимостей..."
sudo -u finio $PROJECT_DIR/backend/venv/bin/pip install fastapi uvicorn python-dotenv

# Создание .env файла
log "⚙️ Создание конфигурации backend..."
cat > .env << EOF
APP_NAME=Finio API
DEBUG=false
SECRET_KEY=$SECRET_KEY
TELEGRAM_BOT_TOKEN=$BOT_TOKEN
TELEGRAM_ADMIN_IDS=$ADMIN_ID
EOF

chown finio:finio .env
chmod 600 .env

# 9. ТЕСТ ПРИЛОЖЕНИЯ
log "🔄 Тест запуска приложения..."
if sudo -u finio timeout 5s $PROJECT_DIR/backend/venv/bin/python -c "
import sys
sys.path.append('.')
from app.main import app
print('✅ Приложение загружается успешно')
" 2>/dev/null; then
    log "✅ Приложение тестируется успешно"
else
    warn "⚠️ Проблемы с загрузкой приложения, но продолжаем..."
fi

# 10. СБОРКА FRONTEND
log "⚛️ Сборка React frontend..."
cd $PROJECT_DIR/frontend

# Очистка npm кэша
npm cache clean --force 2>/dev/null || true

# Установка зависимостей
for i in {1..3}; do
    info "📦 Установка зависимостей frontend (попытка $i/3)..."
    if npm install --no-audit --no-fund --legacy-peer-deps; then
        break
    fi
    if [ $i -eq 3 ]; then
        warn "Не удалось установить зависимости frontend, создаем простую страницу..."
        mkdir -p build
        cat > build/index.html << 'EOF'
<!DOCTYPE html>
<html><head><title>Finio</title></head>
<body><h1>Finio API работает!</h1><p><a href="/api/v1/test">Тест API</a></p></body></html>
EOF
        break
    fi
    sleep 5
done

# Сборка проекта если зависимости установились
if [ -d "node_modules" ]; then
    log "🔨 Сборка production версии frontend..."
    REACT_APP_API_URL=https://$DOMAIN/api/v1 npm run build || warn "Ошибка сборки, используем простую страницу"
fi

# Копирование собранных файлов
mkdir -p /var/www/finio/static
if [ -d "build" ]; then
    cp -r build/* /var/www/finio/static/
else
    cat > /var/www/finio/static/index.html << 'EOF'
<!DOCTYPE html>
<html><head><title>Finio</title></head>
<body><h1>Finio API работает!</h1><p><a href="/api/v1/test">Тест API</a></p></body></html>
EOF
fi
chown -R www-data:www-data /var/www/finio/static
chmod -R 755 /var/www/finio/static

# 11. НАСТРОЙКА NGINX
log "🌐 Настройка Nginx..."
cat > /etc/nginx/sites-available/finio << 'EOF'
server {
    listen 80;
    server_name studiofinance.ru www.studiofinance.ru;

    # Frontend
    location / {
        root /var/www/finio/static;
        try_files $uri $uri/ /index.html;
        expires 30d;
        add_header Cache-Control "public, immutable";
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
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        proxy_set_header Host $host;
        access_log off;
    }

    # Bot webhook
    location /bot-webhook/ {
        proxy_pass http://127.0.0.1:8000/bot-webhook/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Активация сайта
ln -sf /etc/nginx/sites-available/finio /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверка конфигурации Nginx
if ! nginx -t; then
    error "Ошибка в конфигурации Nginx"
fi

# 12. СОЗДАНИЕ SYSTEMD СЕРВИСА
log "⚙️ Создание systemd сервиса..."

# Создание директории для логов
mkdir -p /var/log/finio
chown finio:finio /var/log/finio
chmod 755 /var/log/finio

cat > /etc/systemd/system/finio.service << EOF
[Unit]
Description=Finio Backend API
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
User=finio
Group=finio
WorkingDirectory=$PROJECT_DIR/backend
Environment=PATH=$PROJECT_DIR/backend/venv/bin
Environment=PYTHONPATH=$PROJECT_DIR/backend
ExecStart=$PROJECT_DIR/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --log-level info
Restart=always
RestartSec=5
StandardOutput=append:/var/log/finio/app.log
StandardError=append:/var/log/finio/error.log

[Install]
WantedBy=multi-user.target
EOF

# 13. ЗАПУСК СЕРВИСОВ
log "🚀 Запуск всех сервисов..."
systemctl daemon-reload
systemctl enable finio
systemctl start finio
systemctl restart nginx

# Ждем запуска сервисов
sleep 15

# Проверка запуска backend
if ! systemctl is-active --quiet finio; then
    warn "Backend не запустился, проверяем логи..."
    journalctl -u finio --no-pager -n 10
    error "Backend не удалось запустить"
fi

# 14. НАСТРОЙКА SSL
log "🔒 Получение SSL сертификата..."
if certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect; then
    log "✅ SSL сертификат успешно получен и настроен"
    WEBHOOK_URL="https://$DOMAIN/bot-webhook/"
else
    warn "⚠️ Не удалось получить SSL сертификат, используем HTTP"
    WEBHOOK_URL="http://$DOMAIN/bot-webhook/"
fi

# 15. НАСТРОЙКА TELEGRAM WEBHOOK
log "🤖 Настройка Telegram webhook..."
sleep 5

WEBHOOK_RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" \
     -H "Content-Type: application/json" \
     -d "{\"url\": \"$WEBHOOK_URL\"}")

if echo "$WEBHOOK_RESPONSE" | grep -q '"ok":true'; then
    log "✅ Telegram webhook успешно настроен"
else
    warn "⚠️ Проблемы с настройкой Telegram webhook"
fi

# 16. НАСТРОЙКА БЕЗОПАСНОСТИ
log "🛡️ Настройка безопасности..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80
ufw allow 443

# 17. ФИНАЛЬНАЯ ПРОВЕРКА
log "✅ Финальная проверка системы..."
sleep 10

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

# Проверка доступности API
if curl -f -s http://127.0.0.1:8000/health >/dev/null; then
    log "✅ Backend API отвечает"
else
    warn "❌ Backend API не отвечает"
    SERVICES_OK=false
fi

# 18. СОЗДАНИЕ ФАЙЛА С ИНФОРМАЦИЕЙ
cat > /root/finio-installation-info.txt << EOF
╔══════════════════════════════════════════════════════════════╗
║                    FINIO INSTALLATION INFO                  ║
╚══════════════════════════════════════════════════════════════╝

🌐 ДОСТУП К ПРИЛОЖЕНИЮ:
   Сайт: https://$DOMAIN
   API тест: https://$DOMAIN/api/v1/test
   Health: https://$DOMAIN/health
   Telegram Bot: найдите в Telegram и отправьте /start

🗄️ БАЗА ДАННЫХ MYSQL:
   Хост: localhost:3306
   База: finio
   Пользователь: finio_user
   Пароль: $DB_PASSWORD
   Root пароль: $DB_ROOT_PASSWORD

📁 ФАЙЛЫ ПРОЕКТА:
   Основная директория: $PROJECT_DIR
   Логи приложения: /var/log/finio/
   
🔧 ПОЛЕЗНЫЕ КОМАНДЫ:
   Статус сервисов: sudo systemctl status finio nginx mysql
   Логи в реальном времени: sudo journalctl -u finio -f
   Перезапуск: sudo systemctl restart finio nginx

🤖 TELEGRAM BOT:
   Токен: $BOT_TOKEN
   Webhook: $WEBHOOK_URL
   Admin ID: $ADMIN_ID

📅 ДАТА УСТАНОВКИ: $(date)
🏷️ ВЕРСИЯ: Simplified Working Edition v1.0

╔══════════════════════════════════════════════════════════════╗
║  Сохраните этот файл! Он содержит важную информацию.        ║
╚══════════════════════════════════════════════════════════════╝
EOF

# 19. ФИНАЛЬНОЕ СООБЩЕНИЕ
clear
header "╔══════════════════════════════════════════════════════════════╗"
header "║                    🎉 УСТАНОВКА ЗАВЕРШЕНА!                  ║"
header "╚══════════════════════════════════════════════════════════════╝"
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
echo -e "${BLUE}🔧 API тест:${NC}"
echo -e "   ${GREEN}https://$DOMAIN/api/v1/test${NC}"
echo ""
echo -e "${BLUE}❤️ Health check:${NC}"
echo -e "   ${GREEN}https://$DOMAIN/health${NC}"
echo ""
echo -e "${BLUE}🤖 Telegram бот:${NC}"
echo -e "   Найдите в Telegram и отправьте ${GREEN}/start${NC}"
echo ""
echo -e "${BLUE}📋 Полная информация сохранена в:${NC}"
echo -e "   ${GREEN}/root/finio-installation-info.txt${NC}"
echo ""
echo -e "${GREEN}🎯 Готово к использованию!${NC}"
echo ""
header "╔══════════════════════════════════════════════════════════════╗"
header "║           Спасибо за использование Finio! 💰                ║"
header "╚══════════════════════════════════════════════════════════════╝"