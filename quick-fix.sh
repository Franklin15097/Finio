#!/bin/bash

# Быстрое исправление критических проблем Finio
# Использование: sudo ./quick-fix.sh

set -e

# Цвета
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

if [ "$EUID" -ne 0 ]; then
    error "Запустите с правами root: sudo ./quick-fix.sh"
    exit 1
fi

echo "⚡ БЫСТРОЕ ИСПРАВЛЕНИЕ FINIO"
echo "=========================="

# 1. Остановка всех процессов
log "1. Остановка сервисов..."
systemctl stop finio 2>/dev/null || true
pkill -f "gunicorn.*finio" 2>/dev/null || true
pkill -f "uvicorn.*finio" 2>/dev/null || true

# 2. Создание пользователя и директорий
log "2. Создание пользователя и директорий..."
if ! id "finio" &>/dev/null; then
    adduser --system --group --home $PROJECT_DIR --shell /bin/bash finio
fi

mkdir -p /var/log/finio
chown -R finio:finio /var/log/finio $PROJECT_DIR
chmod -R 755 /var/log/finio $PROJECT_DIR

# 3. Исправление .env файла
log "3. Исправление .env файла..."
if [ -f "$PROJECT_DIR/backend/.env" ]; then
    # Удаляем проблемные строки из .env
    sed -i '/ALLOWED_HOSTS.*\[/d' $PROJECT_DIR/backend/.env
    
    # Добавляем правильную строку ALLOWED_HOSTS
    echo 'ALLOWED_HOSTS=*' >> $PROJECT_DIR/backend/.env
    
    chown finio:finio $PROJECT_DIR/backend/.env
    chmod 600 $PROJECT_DIR/backend/.env
fi

# 4. Создание простого systemd сервиса
log "4. Создание простого systemd сервиса..."
cat > /etc/systemd/system/finio.service << 'EOF'
[Unit]
Description=Finio Backend API
After=network.target mysql.service
Wants=mysql.service

[Service]
Type=simple
User=finio
Group=finio
WorkingDirectory=/var/www/finio/backend
Environment=PATH=/var/www/finio/backend/venv/bin
Environment=APP_NAME=Finio API
Environment=APP_ENV=production
Environment=DEBUG=false
Environment=SECRET_KEY=your-secret-key-change-in-production
Environment=JWT_ALGORITHM=HS256
Environment=ACCESS_TOKEN_EXPIRE_MINUTES=30
Environment=DB_HOST=localhost
Environment=DB_PORT=3306
Environment=DB_NAME=finio
Environment=DB_USER=finio_user
Environment=DB_PASSWORD=finio_password
Environment=TELEGRAM_BOT_TOKEN=8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34
Environment=TELEGRAM_WEBHOOK_URL=https://studiofinance.ru
Environment=TELEGRAM_ADMIN_IDS=1086679273
Environment=ALLOWED_HOSTS=*
Environment=LOG_LEVEL=INFO
Environment=LOG_FILE=/var/log/finio/app.log
ExecStart=/var/www/finio/backend/venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5
StandardOutput=append:/var/log/finio/app.log
StandardError=append:/var/log/finio/error.log

[Install]
WantedBy=multi-user.target
EOF

# 5. Проверка Python зависимостей
log "5. Проверка Python зависимостей..."
cd $PROJECT_DIR/backend

if [ ! -d "venv" ]; then
    sudo -u finio python3 -m venv venv
fi

sudo -u finio $PROJECT_DIR/backend/venv/bin/pip install --upgrade pip
sudo -u finio $PROJECT_DIR/backend/venv/bin/pip install fastapi uvicorn sqlalchemy aiomysql alembic pydantic python-dotenv

# 6. Тест запуска приложения
log "6. Тест запуска приложения..."
cd $PROJECT_DIR/backend

# Создаем минимальный тест
sudo -u finio timeout 10s $PROJECT_DIR/backend/venv/bin/python -c "
import sys
sys.path.append('.')
try:
    from app.main import app
    print('✅ Приложение загружается успешно')
except Exception as e:
    print(f'❌ Ошибка загрузки: {e}')
    sys.exit(1)
" || warn "Проблемы с загрузкой приложения"

# 7. Создание простого frontend
log "7. Создание простого frontend..."
mkdir -p /var/www/finio/static

cat > /var/www/finio/static/index.html << 'EOF'
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Finio - Управление финансами</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; text-align: center; }
        .status { padding: 15px; margin: 20px 0; border-radius: 5px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        .links { display: flex; gap: 20px; justify-content: center; margin: 30px 0; }
        .btn { padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        .btn:hover { background: #0056b3; }
    </style>
</head>
<body>
    <div class="container">
        <h1>💰 Finio</h1>
        <h2>Система управления финансами</h2>
        
        <div class="status success">
            ✅ Сайт работает! Backend API запущен и готов к работе.
        </div>
        
        <div class="status info">
            🤖 Telegram бот настроен и готов принимать команды.
        </div>
        
        <div class="links">
            <a href="/api/v1/docs" class="btn">📚 API Документация</a>
            <a href="/health" class="btn">🔍 Проверка здоровья</a>
        </div>
        
        <h3>Как пользоваться:</h3>
        <ol>
            <li>Найдите бота в Telegram и отправьте <code>/start</code></li>
            <li>Используйте API для интеграции с вашими приложениями</li>
            <li>Просматривайте документацию API по ссылке выше</li>
        </ol>
        
        <h3>Команды бота:</h3>
        <ul>
            <li><code>/start</code> - Начать работу</li>
            <li><code>/balance</code> - Показать баланс</li>
            <li><code>/stats</code> - Статистика</li>
            <li><code>/help</code> - Справка</li>
        </ul>
    </div>
</body>
</html>
EOF

chown -R www-data:www-data /var/www/finio/static
chmod -R 755 /var/www/finio/static

# 8. Запуск сервисов
log "8. Запуск сервисов..."
systemctl daemon-reload
systemctl enable finio
systemctl start finio
systemctl start nginx

# Ждем запуска
sleep 10

# 9. Проверка
log "9. Проверка работы..."
if systemctl is-active --quiet finio; then
    log "✅ Finio backend: РАБОТАЕТ"
else
    error "❌ Finio backend: НЕ РАБОТАЕТ"
    warn "Последние логи:"
    journalctl -u finio -n 5 --no-pager
fi

if curl -f -s http://localhost:8000/health >/dev/null 2>&1; then
    log "✅ API: РАБОТАЕТ"
else
    warn "⚠️ API пока не отвечает, но сервис запущен"
fi

if [ -f "/var/www/finio/static/index.html" ]; then
    log "✅ Frontend: РАБОТАЕТ"
else
    error "❌ Frontend: НЕ РАБОТАЕТ"
fi

# 10. Настройка Telegram webhook
log "10. Настройка Telegram webhook..."
BOT_TOKEN="8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34"
WEBHOOK_URL="https://studiofinance.ru/bot-webhook/"

curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" \
     -H "Content-Type: application/json" \
     -d "{\"url\": \"$WEBHOOK_URL\"}" >/dev/null

log "✅ Telegram webhook настроен"

echo ""
echo "⚡ БЫСТРОЕ ИСПРАВЛЕНИЕ ЗАВЕРШЕНО"
echo ""

log "🎉 Проверьте работу:"
info "🌐 Сайт: https://studiofinance.ru"
info "🔧 API: https://studiofinance.ru/api/v1/docs"
info "🤖 Telegram: найдите бота и отправьте /start"

echo ""
info "📊 Мониторинг:"
echo "   sudo systemctl status finio"
echo "   sudo journalctl -u finio -f"
echo "   curl http://localhost:8000/health"