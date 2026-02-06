#!/bin/bash

# Скрипт обновления Finio
# Использование: sudo ./update.sh

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

PROJECT_DIR="/var/www/finio"

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
    error "Запустите скрипт с правами root: sudo ./update.sh"
fi

log "🔄 Начинаем обновление Finio..."

# 1. Создание бэкапа
log "💾 Создание бэкапа..."
/usr/local/bin/finio-backup.sh

# 2. Остановка сервиса
log "⏹️ Остановка сервиса..."
systemctl stop finio

# 3. Обновление кода
log "📥 Обновление кода..."
cd $PROJECT_DIR
sudo -u finio git pull origin main

# 4. Обновление backend
log "🐍 Обновление backend..."
cd $PROJECT_DIR/backend
sudo -u finio $PROJECT_DIR/backend/venv/bin/pip install -r requirements.txt
sudo -u finio $PROJECT_DIR/backend/venv/bin/alembic upgrade head

# 5. Обновление frontend
log "⚛️ Обновление frontend..."
cd $PROJECT_DIR/frontend
npm install
npm run build
cp -r build/* /var/www/finio/static/
chown -R www-data:www-data /var/www/finio/static

# 6. Запуск сервиса
log "▶️ Запуск сервиса..."
systemctl start finio

# 7. Проверка
log "✅ Проверка обновления..."
sleep 5

if systemctl is-active --quiet finio; then
    log "✅ Сервис запущен успешно"
else
    error "❌ Ошибка запуска сервиса"
fi

if curl -f -s http://localhost:8000/health > /dev/null; then
    log "✅ API работает корректно"
else
    warn "❌ API не отвечает"
fi

echo ""
echo -e "${GREEN}🎉 ОБНОВЛЕНИЕ ЗАВЕРШЕНО!${NC}"
echo ""
echo -e "${BLUE}📊 Проверьте работу:${NC}"
echo -e "   🌐 Сайт: https://$(hostname -f)"
echo -e "   🔧 API: https://$(hostname -f)/api/v1/docs"
echo -e "   🤖 Telegram Bot"
echo ""
echo -e "${GREEN}✅ Готово!${NC}"