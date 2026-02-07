#!/bin/bash

# Скрипт исправления типичных проблем Finio
# Использование: sudo ./fix-issues.sh

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
    error "Запустите скрипт с правами root: sudo ./fix-issues.sh"
    exit 1
fi

echo "🔧 ИСПРАВЛЕНИЕ ПРОБЛЕМ FINIO"
echo "============================"

# 1. Остановка всех сервисов
log "1. Остановка сервисов..."
systemctl stop finio 2>/dev/null || true
systemctl stop nginx 2>/dev/null || true

# 2. Проверка и запуск MySQL
log "2. Проверка MySQL..."
if ! systemctl is-active --quiet mysql; then
    warn "MySQL не запущен, запускаем..."
    systemctl start mysql
    systemctl enable mysql
    sleep 5
fi

# 3. Проверка базы данных
log "3. Проверка базы данных..."
DB_PASSWORD=$(grep DB_PASSWORD $PROJECT_DIR/backend/.env | cut -d'=' -f2 2>/dev/null || echo "")

if [ -z "$DB_PASSWORD" ]; then
    error "Не найден пароль базы данных в .env файле"
    exit 1
fi

# Проверяем подключение к базе
if ! mysql -u finio_user -p"$DB_PASSWORD" -e "USE finio; SELECT 1;" >/dev/null 2>&1; then
    warn "Проблемы с базой данных, пересоздаем..."
    
    # Пересоздание базы данных
    mysql -u root << EOF
DROP DATABASE IF EXISTS finio;
CREATE DATABASE finio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON finio.* TO 'finio_user'@'localhost';
FLUSH PRIVILEGES;
EOF
    
    # Применение миграций
    log "Применение миграций..."
    cd $PROJECT_DIR/backend
    sudo -u finio $PROJECT_DIR/backend/venv/bin/alembic upgrade head
fi

# 4. Проверка виртуального окружения
log "4. Проверка Python окружения..."
if [ ! -d "$PROJECT_DIR/backend/venv" ]; then
    warn "Виртуальное окружение не найдено, создаем..."
    cd $PROJECT_DIR/backend
    sudo -u finio python3 -m venv venv
    sudo -u finio $PROJECT_DIR/backend/venv/bin/pip install --upgrade pip
    sudo -u finio $PROJECT_DIR/backend/venv/bin/pip install -r requirements.txt
fi

# 5. Проверка зависимостей
log "5. Обновление зависимостей..."
cd $PROJECT_DIR/backend
sudo -u finio $PROJECT_DIR/backend/venv/bin/pip install -r requirements.txt

# 6. Проверка прав доступа
log "6. Исправление прав доступа..."
chown -R finio:finio $PROJECT_DIR
chmod -R 755 $PROJECT_DIR
chmod 600 $PROJECT_DIR/backend/.env

# 7. Проверка логов
log "7. Создание директорий для логов..."
mkdir -p /var/log/finio
chown finio:finio /var/log/finio
chmod 755 /var/log/finio

# 8. Проверка frontend
log "8. Проверка frontend файлов..."
if [ ! -d "/var/www/finio/static" ] || [ -z "$(ls -A /var/www/finio/static)" ]; then
    warn "Frontend файлы не найдены, пересобираем..."
    cd $PROJECT_DIR/frontend
    
    # Очистка и установка зависимостей
    rm -rf node_modules package-lock.json 2>/dev/null || true
    npm cache clean --force 2>/dev/null || true
    npm install --legacy-peer-deps
    
    # Сборка
    REACT_APP_API_URL=https://$(hostname -f)/api/v1 npm run build
    
    # Копирование файлов
    mkdir -p /var/www/finio/static
    cp -r build/* /var/www/finio/static/
    chown -R www-data:www-data /var/www/finio/static
    chmod -R 755 /var/www/finio/static
fi

# 9. Проверка конфигурации Nginx
log "9. Проверка конфигурации Nginx..."
if ! nginx -t; then
    error "Ошибка в конфигурации Nginx"
    exit 1
fi

# 10. Запуск сервисов
log "10. Запуск сервисов..."
systemctl daemon-reload
systemctl start finio
systemctl start nginx
systemctl enable finio
systemctl enable nginx

# Ждем запуска
sleep 10

# 11. Проверка работы
log "11. Проверка работы сервисов..."
SERVICES_OK=true

if systemctl is-active --quiet finio; then
    log "✅ Finio backend: РАБОТАЕТ"
else
    error "❌ Finio backend: НЕ РАБОТАЕТ"
    warn "Логи backend:"
    journalctl -u finio -n 10 --no-pager
    SERVICES_OK=false
fi

if systemctl is-active --quiet nginx; then
    log "✅ Nginx: РАБОТАЕТ"
else
    error "❌ Nginx: НЕ РАБОТАЕТ"
    SERVICES_OK=false
fi

if systemctl is-active --quiet mysql; then
    log "✅ MySQL: РАБОТАЕТ"
else
    error "❌ MySQL: НЕ РАБОТАЕТ"
    SERVICES_OK=false
fi

# Проверка API
if curl -f -s http://localhost:8000/health >/dev/null; then
    log "✅ API: РАБОТАЕТ"
else
    error "❌ API: НЕ РАБОТАЕТ"
    SERVICES_OK=false
fi

# 12. Настройка Telegram webhook
log "12. Настройка Telegram webhook..."
BOT_TOKEN=$(grep TELEGRAM_BOT_TOKEN $PROJECT_DIR/backend/.env | cut -d'=' -f2)
DOMAIN=$(hostname -f)

if [ -n "$BOT_TOKEN" ]; then
    WEBHOOK_URL="https://$DOMAIN/bot-webhook/"
    
    WEBHOOK_RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" \
         -H "Content-Type: application/json" \
         -d "{\"url\": \"$WEBHOOK_URL\"}")
    
    if echo "$WEBHOOK_RESPONSE" | grep -q '"ok":true'; then
        log "✅ Telegram webhook настроен"
    else
        warn "⚠️ Проблемы с настройкой Telegram webhook"
        echo "Ответ: $WEBHOOK_RESPONSE"
    fi
fi

echo ""
echo "🔧 ИСПРАВЛЕНИЕ ЗАВЕРШЕНО"
echo ""

if [ "$SERVICES_OK" = true ]; then
    log "🎉 Все сервисы работают корректно!"
    echo ""
    info "🌐 Ваш сайт: https://$DOMAIN"
    info "🔧 API документация: https://$DOMAIN/api/v1/docs"
    info "🤖 Telegram бот готов к работе"
else
    warn "⚠️ Некоторые сервисы требуют дополнительного внимания"
    warn "Запустите диагностику: sudo ./diagnose.sh"
fi

echo ""
info "📝 Полезные команды:"
echo "   sudo systemctl status finio nginx mysql"
echo "   sudo journalctl -u finio -f"
echo "   sudo ./diagnose.sh"