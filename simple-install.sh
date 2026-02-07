#!/bin/bash

# ПРОСТОЙ УСТАНОВЩИК FINIO
# Использование: sudo ./simple-install.sh

set -e

if [ "$EUID" -ne 0 ]; then
    echo "Запустите с правами root: sudo ./simple-install.sh"
    exit 1
fi

echo "🚀 ПРОСТАЯ УСТАНОВКА FINIO"
echo "========================="

PROJECT_DIR="/var/www/finio"
DOMAIN="studiofinance.ru"

# 1. Очистка
echo "1. Очистка..."
systemctl stop finio 2>/dev/null || true
systemctl disable finio 2>/dev/null || true
rm -f /etc/systemd/system/finio.service
rm -rf $PROJECT_DIR
userdel -r finio 2>/dev/null || true
systemctl daemon-reload

# 2. Создание пользователя и директорий
echo "2. Создание пользователя..."
adduser --system --group --home $PROJECT_DIR --shell /bin/bash finio
mkdir -p $PROJECT_DIR/backend/app
mkdir -p /var/log/finio
chown -R finio:finio $PROJECT_DIR /var/log/finio

# 3. Установка Python зависимостей
echo "3. Установка Python..."
apt update -qq
apt install -y python3 python3-pip python3-venv nginx

# 4. Создание простого приложения
echo "4. Создание приложения..."
cd $PROJECT_DIR/backend

# Создание venv
sudo -u finio python3 -m venv venv
sudo -u finio $PROJECT_DIR/backend/venv/bin/pip install fastapi uvicorn

# Создание простого main.py
cat > app/main.py << 'EOF'
from fastapi import FastAPI

app = FastAPI(title="Finio API", version="1.0.0")

@app.get("/")
async def root():
    return {"message": "Finio API работает!", "status": "ok"}

@app.get("/health")
async def health():
    return {"status": "healthy", "app": "Finio API"}

@app.get("/api/v1/test")
async def test_api():
    return {"message": "API v1 работает", "status": "success"}

@app.post("/bot-webhook/")
async def bot_webhook():
    return {"status": "webhook received"}
EOF

# Создание __init__.py
touch app/__init__.py

chown -R finio:finio $PROJECT_DIR

# 5. Тест приложения
echo "5. Тест приложения..."
cd $PROJECT_DIR/backend
if sudo -u finio timeout 5s $PROJECT_DIR/backend/venv/bin/python -c "from app.main import app; print('OK')" 2>/dev/null; then
    echo "✅ Приложение загружается"
else
    echo "❌ Ошибка загрузки приложения"
    exit 1
fi

# 6. Создание systemd сервиса
echo "6. Создание сервиса..."
cat > /etc/systemd/system/finio.service << EOF
[Unit]
Description=Finio API
After=network.target

[Service]
Type=simple
User=finio
Group=finio
WorkingDirectory=$PROJECT_DIR/backend
Environment=PATH=$PROJECT_DIR/backend/venv/bin
Environment=PYTHONPATH=$PROJECT_DIR/backend
ExecStart=$PROJECT_DIR/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=3
StandardOutput=append:/var/log/finio/app.log
StandardError=append:/var/log/finio/error.log

[Install]
WantedBy=multi-user.target
EOF

# 7. Создание простого frontend
echo "7. Создание frontend..."
mkdir -p /var/www/html
cat > /var/www/html/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Finio API</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 50px; }
        .container { max-width: 600px; margin: 0 auto; text-align: center; }
        .btn { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px; }
        .status { padding: 20px; background: #d4edda; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Finio API</h1>
        <div class="status">
            ✅ Сервер работает!
        </div>
        <a href="/health" class="btn">Health Check</a>
        <a href="/api/v1/test" class="btn">Test API</a>
    </div>
</body>
</html>
EOF

# 8. Настройка Nginx
echo "8. Настройка Nginx..."
cat > /etc/nginx/sites-available/default << EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    root /var/www/html;
    index index.html;
    
    server_name _;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        proxy_set_header Host \$host;
    }
    
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
    }
    
    location /bot-webhook/ {
        proxy_pass http://127.0.0.1:8000/bot-webhook/;
        proxy_set_header Host \$host;
    }
}
EOF

# 9. Запуск сервисов
echo "9. Запуск сервисов..."
systemctl daemon-reload
systemctl enable finio
systemctl start finio
systemctl restart nginx

# 10. Проверка
echo "10. Проверка..."
sleep 5

if systemctl is-active --quiet finio; then
    echo "✅ Finio сервис работает"
else
    echo "❌ Finio сервис не работает"
    journalctl -u finio -n 5 --no-pager
fi

if systemctl is-active --quiet nginx; then
    echo "✅ Nginx работает"
else
    echo "❌ Nginx не работает"
fi

if curl -f -s http://localhost:8000/health >/dev/null 2>&1; then
    echo "✅ API отвечает"
else
    echo "❌ API не отвечает"
fi

echo ""
echo "🎉 УСТАНОВКА ЗАВЕРШЕНА"
echo ""
echo "Проверьте:"
echo "  🌐 http://$DOMAIN"
echo "  ❤️ http://$DOMAIN/health"
echo "  🔧 http://$DOMAIN/api/v1/test"
echo ""
echo "Логи: sudo journalctl -u finio -f"