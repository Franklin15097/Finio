#!/bin/bash

# Создание рабочего сервиса Finio
# Использование: sudo ./create-service.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; }

PROJECT_DIR="/var/www/finio"

if [ "$EUID" -ne 0 ]; then
    error "Запустите с правами root: sudo ./create-service.sh"
    exit 1
fi

echo "🔧 СОЗДАНИЕ РАБОЧЕГО СЕРВИСА FINIO"
echo "================================="

# 1. Остановка и удаление старого сервиса
log "1. Удаление старого сервиса..."
systemctl stop finio 2>/dev/null || true
systemctl disable finio 2>/dev/null || true
rm -f /etc/systemd/system/finio.service
systemctl daemon-reload

# 2. Создание пользователя
log "2. Создание пользователя finio..."
if ! id "finio" &>/dev/null; then
    adduser --system --group --home $PROJECT_DIR --shell /bin/bash finio
fi

# 3. Создание директорий
log "3. Создание директорий..."
mkdir -p /var/log/finio
mkdir -p $PROJECT_DIR/backend
chown -R finio:finio /var/log/finio $PROJECT_DIR
chmod -R 755 /var/log/finio $PROJECT_DIR

# 4. Проверка Python окружения
log "4. Проверка Python окружения..."
cd $PROJECT_DIR/backend

if [ ! -d "venv" ]; then
    warn "Создание виртуального окружения..."
    sudo -u finio python3 -m venv venv
fi

# Установка минимальных зависимостей
sudo -u finio $PROJECT_DIR/backend/venv/bin/pip install --upgrade pip
sudo -u finio $PROJECT_DIR/backend/venv/bin/pip install fastapi uvicorn python-dotenv

# 5. Тест запуска приложения
log "5. Тест запуска приложения..."
cd $PROJECT_DIR/backend

# Проверяем, что приложение загружается
if sudo -u finio timeout 5s $PROJECT_DIR/backend/venv/bin/python -c "
import sys
sys.path.append('.')
from app.main import app
print('✅ Приложение загружается успешно')
" 2>/dev/null; then
    log "✅ Приложение загружается без ошибок"
else
    error "❌ Ошибка загрузки приложения"
    warn "Проверим импорты..."
    sudo -u finio $PROJECT_DIR/backend/venv/bin/python -c "
import sys
sys.path.append('.')
try:
    from app.main import app
    print('OK: app.main импортируется')
except Exception as e:
    print(f'ERROR: {e}')
"
fi

# 6. Создание systemd сервиса
log "6. Создание systemd сервиса..."
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

# 7. Запуск сервиса
log "7. Запуск сервиса..."
systemctl daemon-reload
systemctl enable finio
systemctl start finio

# Ждем запуска
sleep 5

# 8. Проверка
log "8. Проверка работы..."
if systemctl is-active --quiet finio; then
    log "✅ Сервис finio запущен"
    
    # Проверяем API
    sleep 3
    if curl -f -s http://localhost:8000/health >/dev/null 2>&1; then
        log "✅ API отвечает на запросы"
        API_RESPONSE=$(curl -s http://localhost:8000/health)
        echo "   Ответ API: $API_RESPONSE"
    else
        warn "⚠️ API пока не отвечает, проверьте логи"
    fi
else
    error "❌ Сервис finio не запустился"
    warn "Логи сервиса:"
    journalctl -u finio -n 10 --no-pager
fi

# 9. Проверка Nginx
log "9. Проверка Nginx..."
if systemctl is-active --quiet nginx; then
    log "✅ Nginx работает"
else
    warn "⚠️ Nginx не запущен, запускаем..."
    systemctl start nginx
fi

echo ""
echo "🔧 СОЗДАНИЕ СЕРВИСА ЗАВЕРШЕНО"
echo ""

if systemctl is-active --quiet finio; then
    log "🎉 Сервис работает!"
    echo ""
    echo "📊 Проверьте работу:"
    echo "   🌐 Сайт: https://studiofinance.ru"
    echo "   🔧 API: https://studiofinance.ru/api/v1/test"
    echo "   ❤️ Health: https://studiofinance.ru/health"
    echo ""
    echo "📝 Мониторинг:"
    echo "   sudo systemctl status finio"
    echo "   sudo journalctl -u finio -f"
    echo "   curl http://localhost:8000/health"
else
    error "❌ Сервис не запустился"
    echo ""
    echo "🔍 Диагностика:"
    echo "   sudo journalctl -u finio -n 20"
    echo "   sudo systemctl status finio"
fi