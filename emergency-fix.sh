#!/bin/bash

# Экстренное исправление проблем Finio
# Использование: sudo ./emergency-fix.sh

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; }
info() { echo -e "${BLUE}[i]${NC} $1"; }

PROJECT_DIR="/var/www/finio"

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
    error "Запустите скрипт с правами root: sudo ./emergency-fix.sh"
    exit 1
fi

echo "🚨 ЭКСТРЕННОЕ ИСПРАВЛЕНИЕ FINIO"
echo "==============================="

# 1. Остановка всех процессов
log "1. Остановка всех процессов..."
systemctl stop finio 2>/dev/null || true
systemctl stop nginx 2>/dev/null || true
pkill -f "gunicorn.*finio" 2>/dev/null || true
pkill -f "uvicorn.*finio" 2>/dev/null || true

# 2. Удаление старого сервиса
log "2. Удаление старого сервиса..."
systemctl disable finio 2>/dev/null || true
rm -f /etc/systemd/system/finio.service
systemctl daemon-reload

# 3. Проверка директории проекта
if [ ! -d "$PROJECT_DIR" ]; then
    error "Директория проекта не найдена: $PROJECT_DIR"
    info "Запустите сначала install.sh"
    exit 1
fi

# 4. Создание пользователя finio
log "3. Создание пользователя finio..."
if ! id "finio" &>/dev/null; then
    adduser --system --group --home $PROJECT_DIR --shell /bin/bash finio
fi
usermod -aG www-data finio

# 5. Исправление прав доступа
log "4. Исправление прав доступа..."
chown -R finio:finio $PROJECT_DIR
chmod -R 755 $PROJECT_DIR

# 6. Создание директорий для логов
log "5. Создание директорий для логов..."
mkdir -p /var/log/finio
chown -R finio:finio /var/log/finio
chmod -R 755 /var/log/finio

# 7. Проверка и создание .env файла
log "6. Проверка .env файла..."
if [ ! -f "$PROJECT_DIR/backend/.env" ]; then
    warn ".env файл не найден, создаем..."
    
    # Генерация паролей
    DB_ROOT_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    SECRET_KEY=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)
    
    cat > $PROJECT_DIR/backend/.env << EOF
# App settings
APP_NAME="Finio API"
APP_ENV=production
DEBUG=false
SECRET_KEY=$SECRET_KEY

# JWT settings
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database settings (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=finio
DB_USER=finio_user
DB_PASSWORD=$DB_PASSWORD

# Telegram Bot settings
TELEGRAM_BOT_TOKEN=8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34
TELEGRAM_WEBHOOK_URL=https://studiofinance.ru
TELEGRAM_ADMIN_IDS=1086679273

# CORS settings
ALLOWED_HOSTS=["https://studiofinance.ru","https://www.studiofinance.ru","http://studiofinance.ru","http://www.studiofinance.ru"]

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/finio/app.log
EOF
    
    chown finio:finio $PROJECT_DIR/backend/.env
    chmod 600 $PROJECT_DIR/backend/.env
    
    info "Создан новый .env файл с паролем БД: $DB_PASSWORD"
else
    log ".env файл существует"
fi

# 8. Настройка MySQL
log "7. Настройка MySQL..."
if ! systemctl is-active --quiet mysql; then
    systemctl start mysql
    systemctl enable mysql
    sleep 5
fi

# Получаем пароль из .env
DB_PASSWORD=$(grep DB_PASSWORD $PROJECT_DIR/backend/.env | cut -d'=' -f2)

# Настройка MySQL пользователя
mysql -u root << EOF || true
DROP USER IF EXISTS 'finio_user'@'localhost';
DROP DATABASE IF EXISTS finio;
CREATE DATABASE finio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'finio_user'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON finio.* TO 'finio_user'@'localhost';
FLUSH PRIVILEGES;
EOF

log "MySQL пользователь и база данных созданы"

# 9. Проверка виртуального окружения
log "8. Проверка Python окружения..."
cd $PROJECT_DIR/backend

if [ ! -d "venv" ]; then
    warn "Создание виртуального окружения..."
    sudo -u finio python3 -m venv venv
fi

# Установка зависимостей
sudo -u finio $PROJECT_DIR/backend/venv/bin/pip install --upgrade pip
sudo -u finio $PROJECT_DIR/backend/venv/bin/pip install -r requirements.txt

# 10. Применение миграций
log "9. Применение миграций..."
sudo -u finio $PROJECT_DIR/backend/venv/bin/alembic upgrade head

# 11. Создание systemd сервиса
log "10. Создание systemd сервиса..."
cat > /etc/systemd/system/finio.service << EOF
[Unit]
Description=Finio Backend API
After=network.target mysql.service
Requires=mysql.service
StartLimitIntervalSec=0

[Service]
Type=simple
User=finio
Group=finio
WorkingDirectory=$PROJECT_DIR/backend
Environment=PATH=$PROJECT_DIR/backend/venv/bin
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

# 12. Проверка frontend
log "11. Проверка frontend..."
if [ ! -d "/var/www/finio/static" ] || [ -z "$(ls -A /var/www/finio/static 2>/dev/null)" ]; then
    warn "Пересборка frontend..."
    cd $PROJECT_DIR/frontend
    
    # Установка Node.js если нужно
    if ! command -v npm &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt install -y nodejs
    fi
    
    # Сборка
    npm install --legacy-peer-deps
    REACT_APP_API_URL=https://studiofinance.ru/api/v1 npm run build
    
    # Копирование
    mkdir -p /var/www/finio/static
    cp -r build/* /var/www/finio/static/
    chown -R www-data:www-data /var/www/finio/static
    chmod -R 755 /var/www/finio/static
fi

# 13. Запуск сервисов
log "12. Запуск сервисов..."
systemctl daemon-reload
systemctl enable finio
systemctl start finio
systemctl start nginx

# Ждем запуска
sleep 15

# 14. Проверка
log "13. Проверка работы..."
if systemctl is-active --quiet finio; then
    log "✅ Finio backend: РАБОТАЕТ"
else
    error "❌ Finio backend: НЕ РАБОТАЕТ"
    warn "Логи:"
    journalctl -u finio -n 10 --no-pager
fi

if systemctl is-active --quiet nginx; then
    log "✅ Nginx: РАБОТАЕТ"
else
    error "❌ Nginx: НЕ РАБОТАЕТ"
fi

if curl -f -s http://localhost:8000/health >/dev/null; then
    log "✅ API: РАБОТАЕТ"
else
    error "❌ API: НЕ РАБОТАЕТ"
fi

# 15. Настройка Telegram webhook
log "14. Настройка Telegram webhook..."
BOT_TOKEN="8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34"
WEBHOOK_URL="https://studiofinance.ru/bot-webhook/"

WEBHOOK_RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" \
     -H "Content-Type: application/json" \
     -d "{\"url\": \"$WEBHOOK_URL\"}")

if echo "$WEBHOOK_RESPONSE" | grep -q '"ok":true'; then
    log "✅ Telegram webhook настроен"
else
    warn "⚠️ Проблемы с Telegram webhook"
fi

echo ""
echo "🚨 ЭКСТРЕННОЕ ИСПРАВЛЕНИЕ ЗАВЕРШЕНО"
echo ""

log "🎉 Проверьте работу:"
info "🌐 Сайт: https://studiofinance.ru"
info "🔧 API: https://studiofinance.ru/api/v1/docs"
info "🤖 Telegram бот готов"

echo ""
info "📝 Для мониторинга:"
echo "   sudo systemctl status finio"
echo "   sudo journalctl -u finio -f"