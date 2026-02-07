#!/bin/bash

# НОВЫЙ ПРОСТОЙ УСТАНОВЩИК FINIO
# Использование: sudo ./install-new.sh

set -e

if [ "$EUID" -ne 0 ]; then
    echo "Запустите с правами root: sudo ./install-new.sh"
    exit 1
fi

echo "🚀 УСТАНОВКА НОВОГО FINIO"
echo "========================"

PROJECT_DIR="/var/www/finio"
DOMAIN="studiofinance.ru"

# 1. Очистка
echo "1. Очистка старых файлов..."
systemctl stop finio 2>/dev/null || true
systemctl disable finio 2>/dev/null || true
rm -f /etc/systemd/system/finio.service
rm -rf $PROJECT_DIR
userdel -r finio 2>/dev/null || true
systemctl daemon-reload

# 2. Обновление системы
echo "2. Обновление системы..."
apt update -qq
apt install -y python3 python3-pip python3-venv nginx nodejs npm git

# 3. Создание пользователя
echo "3. Создание пользователя..."
adduser --system --group --home $PROJECT_DIR --shell /bin/bash finio
mkdir -p $PROJECT_DIR/backend $PROJECT_DIR/frontend
mkdir -p /var/lib/finio /var/log/finio
chown -R finio:finio $PROJECT_DIR /var/lib/finio /var/log/finio

# 4. Клонирование проекта
echo "4. Получение кода..."
git clone https://github.com/Franklin15097/Finio.git /tmp/finio
cp -r /tmp/finio/* $PROJECT_DIR/
rm -rf /tmp/finio
chown -R finio:finio $PROJECT_DIR

# 5. Настройка backend
echo "5. Настройка backend..."
cd $PROJECT_DIR/backend
sudo -u finio python3 -m venv venv
sudo -u finio $PROJECT_DIR/backend/venv/bin/pip install --upgrade pip
sudo -u finio $PROJECT_DIR/backend/venv/bin/pip install -r requirements.txt

# Тест приложения
echo "6. Тест backend..."
if sudo -u finio timeout 10s $PROJECT_DIR/backend/venv/bin/python main.py &>/dev/null; then
    echo "✅ Backend тестируется успешно"
else
    echo "⚠️ Backend тест не прошел, но продолжаем..."
fi

# 7. Настройка frontend
echo "7. Настройка frontend..."
cd $PROJECT_DIR/frontend
npm install --production
npm run build

# Копирование статики
mkdir -p /var/www/html
cp -r build/* /var/www/html/
chown -R www-data:www-data /var/www/html

# 8. Создание systemd сервиса
echo "8. Создание сервиса..."
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
ExecStart=$PROJECT_DIR/backend/venv/bin/python main.py
Restart=always
RestartSec=3
StandardOutput=append:/var/log/finio/app.log
StandardError=append:/var/log/finio/error.log

[Install]
WantedBy=multi-user.target
EOF

# 9. Настройка Nginx
echo "9. Настройка Nginx..."
cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    root /var/www/html;
    index index.html;
    
    server_name _;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        proxy_set_header Host $host;
    }
    
    location /bot-webhook/ {
        proxy_pass http://127.0.0.1:8000/bot-webhook/;
        proxy_set_header Host $host;
    }
}
EOF

# 10. Запуск сервисов
echo "10. Запуск сервисов..."
systemctl daemon-reload
systemctl enable finio
systemctl start finio
systemctl restart nginx

# 11. Проверка
echo "11. Проверка..."
sleep 10

if systemctl is-active --quiet finio; then
    echo "✅ Finio сервис работает"
else
    echo "❌ Finio сервис не работает"
    journalctl -u finio -n 10 --no-pager
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
echo "🎉 УСТАНОВКА ЗАВЕРШЕНА!"
echo ""
echo "Проверьте:"
echo "  🌐 http://$DOMAIN - React приложение"
echo "  🔧 http://$DOMAIN/api - API документация"
echo "  ❤️ http://$DOMAIN/health - Проверка здоровья"
echo ""
echo "Логи: sudo journalctl -u finio -f"
echo "Статус: sudo systemctl status finio"