#!/bin/bash

# Скрипт диагностики проблем Finio
# Использование: sudo ./diagnose.sh

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

echo "🔍 ДИАГНОСТИКА FINIO"
echo "===================="

# 1. Проверка сервисов
info "1. Статус сервисов:"
echo ""

if systemctl is-active --quiet finio; then
    log "✅ Finio backend: РАБОТАЕТ"
else
    error "❌ Finio backend: НЕ РАБОТАЕТ"
    warn "Последние логи Finio:"
    journalctl -u finio -n 10 --no-pager
    echo ""
fi

if systemctl is-active --quiet nginx; then
    log "✅ Nginx: РАБОТАЕТ"
else
    error "❌ Nginx: НЕ РАБОТАЕТ"
fi

if systemctl is-active --quiet mysql; then
    log "✅ MySQL: РАБОТАЕТ"
else
    error "❌ MySQL: НЕ РАБОТАЕТ"
fi

echo ""

# 2. Проверка портов
info "2. Проверка портов:"
if netstat -tlnp | grep -q ":8000"; then
    log "✅ Порт 8000 (backend): ОТКРЫТ"
else
    error "❌ Порт 8000 (backend): ЗАКРЫТ"
fi

if netstat -tlnp | grep -q ":80\|:443"; then
    log "✅ Порт 80/443 (nginx): ОТКРЫТ"
else
    error "❌ Порт 80/443 (nginx): ЗАКРЫТ"
fi

if netstat -tlnp | grep -q ":3306"; then
    log "✅ Порт 3306 (mysql): ОТКРЫТ"
else
    error "❌ Порт 3306 (mysql): ЗАКРЫТ"
fi

echo ""

# 3. Проверка подключения к MySQL
info "3. Проверка MySQL:"
DB_PASSWORD=$(grep DB_PASSWORD /var/www/finio/backend/.env | cut -d'=' -f2)

if mysql -u finio_user -p"$DB_PASSWORD" -e "USE finio; SELECT COUNT(*) FROM users;" >/dev/null 2>&1; then
    log "✅ Подключение к MySQL: РАБОТАЕТ"
    USER_COUNT=$(mysql -u finio_user -p"$DB_PASSWORD" -e "USE finio; SELECT COUNT(*) FROM users;" -s -N 2>/dev/null)
    info "   Пользователей в базе: $USER_COUNT"
else
    error "❌ Подключение к MySQL: НЕ РАБОТАЕТ"
fi

echo ""

# 4. Проверка API
info "4. Проверка API:"
if curl -f -s http://localhost:8000/health >/dev/null; then
    log "✅ API health check: РАБОТАЕТ"
    API_RESPONSE=$(curl -s http://localhost:8000/health)
    info "   Ответ: $API_RESPONSE"
else
    error "❌ API health check: НЕ РАБОТАЕТ"
fi

echo ""

# 5. Проверка файлов
info "5. Проверка файлов:"
if [ -f "/var/www/finio/backend/.env" ]; then
    log "✅ Файл .env: СУЩЕСТВУЕТ"
else
    error "❌ Файл .env: НЕ НАЙДЕН"
fi

if [ -d "/var/www/finio/static" ]; then
    log "✅ Frontend файлы: СУЩЕСТВУЮТ"
    STATIC_FILES=$(find /var/www/finio/static -name "*.js" -o -name "*.css" | wc -l)
    info "   Статических файлов: $STATIC_FILES"
else
    error "❌ Frontend файлы: НЕ НАЙДЕНЫ"
fi

echo ""

# 6. Проверка логов
info "6. Последние ошибки в логах:"
echo ""

warn "=== FINIO BACKEND ERRORS ==="
journalctl -u finio -p err -n 5 --no-pager || echo "Нет ошибок"

echo ""
warn "=== NGINX ERRORS ==="
tail -n 5 /var/log/nginx/error.log 2>/dev/null || echo "Нет ошибок"

echo ""

# 7. Проверка Telegram webhook
info "7. Проверка Telegram webhook:"
BOT_TOKEN=$(grep TELEGRAM_BOT_TOKEN /var/www/finio/backend/.env | cut -d'=' -f2)
if [ -n "$BOT_TOKEN" ]; then
    WEBHOOK_INFO=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo")
    if echo "$WEBHOOK_INFO" | grep -q '"ok":true'; then
        log "✅ Telegram webhook: НАСТРОЕН"
        WEBHOOK_URL=$(echo "$WEBHOOK_INFO" | grep -o '"url":"[^"]*' | cut -d'"' -f4)
        info "   URL: $WEBHOOK_URL"
    else
        error "❌ Telegram webhook: НЕ НАСТРОЕН"
    fi
else
    warn "⚠️ Telegram bot token не найден"
fi

echo ""
echo "🔍 ДИАГНОСТИКА ЗАВЕРШЕНА"
echo ""

# Рекомендации
info "💡 РЕКОМЕНДАЦИИ:"
echo ""

if ! systemctl is-active --quiet finio; then
    warn "1. Перезапустите backend: sudo systemctl restart finio"
fi

if ! curl -f -s http://localhost:8000/health >/dev/null; then
    warn "2. Проверьте логи backend: sudo journalctl -u finio -f"
fi

if ! systemctl is-active --quiet mysql; then
    warn "3. Запустите MySQL: sudo systemctl start mysql"
fi

warn "4. Для детальной диагностики: sudo journalctl -u finio -n 50"
warn "5. Для перезапуска всех сервисов: sudo systemctl restart finio nginx mysql"

echo ""
info "📞 Если проблемы остались, отправьте вывод этого скрипта разработчику"