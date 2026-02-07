#!/bin/bash

echo "🚀 ПОЛНАЯ УСТАНОВКА FINIO НА UBUNTU 24.04"
echo "=========================================="

# Проверка прав root
if [[ $EUID -ne 0 ]]; then
   echo "❌ Этот скрипт должен запускаться с правами root (sudo)"
   echo "Используйте: curl -fsSL https://raw.githubusercontent.com/Franklin15097/Finio/main/ubuntu-install.sh | sudo bash"
   exit 1
fi

# Обновление системы
echo "🔄 Обновление системы..."
apt-get update && apt-get upgrade -y

# Установка необходимых пакетов
echo "📦 Установка системных зависимостей..."
apt-get install -y curl wget git build-essential python3 python3-pip nginx ufw certbot python3-certbot-nginx postgresql postgresql-contrib

# Установка Node.js 20.x (LTS)
echo "📦 Установка Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Проверка версий
echo "✅ Проверка установленных версий:"
echo "   Node.js: $(node --version)"
echo "   NPM: $(npm --version)"
echo "   Git: $(git --version)"

# Клонирование репозитория
echo "📥 Клонирование репозитория..."
cd /opt
if [ -d "Finio" ]; then
    echo "🔄 Обновление существующего репозитория..."
    cd Finio
    git pull origin main
else
    git clone https://github.com/Franklin15097/Finio.git
    cd Finio
fi

# Установка зависимостей
echo "📦 Установка зависимостей проекта..."
npm install

echo "📦 Установка зависимостей сервера..."
cd server && npm install && cd ..

echo "📦 Установка зависимостей веб-сайта..."
cd website-frontend && npm install && cd ..

echo "📦 Установка зависимостей мини-приложения..."
cd mini-app-frontend && npm install && cd ..

# Сборка фронтенда
echo "🔨 Сборка фронтенда..."
cd website-frontend && npm run build && cd ..
cd mini-app-frontend && npm run build && cd ..

# Настройка PostgreSQL
echo "🗄️ Настройка PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE finio;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE USER finio_user WITH PASSWORD 'maks15097';" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE finio TO finio_user;" 2>/dev/null || true
sudo -u postgres psql -c "ALTER DATABASE finio OWNER TO finio_user;" 2>/dev/null || true

# Перезапуск сервиса для применения изменений
echo "🔄 Перезапуск сервиса..."
systemctl restart finio

# Создание .env файла
echo "⚙️  Создание конфигурации..."
cat > server/.env << EOF
PORT=3000
BOT_TOKEN=8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finio
DB_USER=finio_user
DB_PASSWORD=maks15097
ADMIN_EMAIL=maks50kucherenko@gmail.com
DOMAIN=studiofinance.ru
EOF
echo "📝 Создан server/.env с настройками"

# Создание пользователя для приложения
echo "👤 Создание пользователя finio..."
if ! id "finio" &>/dev/null; then
    useradd -r -s /bin/false finio
fi

# Настройка прав доступа
echo "🔐 Настройка прав доступа..."
chown -R finio:finio /opt/Finio
chmod +x /opt/Finio/install.sh

# Создание systemd сервиса
echo "🔧 Создание systemd сервиса..."
cat > /etc/systemd/system/finio.service << EOF
[Unit]
Description=Finio Financial Tracker
After=network.target

[Service]
Type=simple
User=finio
WorkingDirectory=/opt/Finio/server
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Настройка Nginx
echo "🌐 Настройка Nginx..."
cat > /etc/nginx/sites-available/finio << EOF
server {
    listen 80;
    server_name studiofinance.ru www.studiofinance.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Активация конфигурации Nginx
ln -sf /etc/nginx/sites-available/finio /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверка конфигурации Nginx
nginx -t

# Настройка SSL сертификата
echo "🔒 Настройка SSL сертификата..."
certbot --nginx -d studiofinance.ru -d www.studiofinance.ru --non-interactive --agree-tos --email maks50kucherenko@gmail.com --redirect

# Автообновление SSL
systemctl enable certbot.timer
systemctl start certbot.timer

# Настройка файрвола
echo "🔥 Настройка файрвола..."
ufw --force enable
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 3000

# Перезагрузка и запуск сервисов
echo "🔄 Запуск сервисов..."
systemctl daemon-reload
systemctl enable finio
systemctl start finio
systemctl restart nginx

# Ожидание запуска
echo "⏳ Ожидание запуска приложения..."
sleep 5

# Проверка статуса
echo "🔍 Проверка статуса сервисов..."
if systemctl is-active --quiet finio; then
    echo "✅ Finio сервис запущен"
else
    echo "❌ Ошибка запуска Finio сервиса"
    systemctl status finio --no-pager
fi

if systemctl is-active --quiet nginx; then
    echo "✅ Nginx запущен"
else
    echo "❌ Ошибка запуска Nginx"
    systemctl status nginx --no-pager
fi

# Получение IP адреса
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

echo ""
echo "🎉 УСТАНОВКА ЗАВЕРШЕНА!"
echo "======================"
echo ""
echo "📍 Доступные адреса:"
echo "   🌐 Веб-сайт:     https://studiofinance.ru"
echo "   🌐 Альтернатива: https://www.studiofinance.ru"
echo "   📱 Mini App:     https://studiofinance.ru/mini-app"
echo "   🔧 API:          https://studiofinance.ru/api"
echo ""
echo "🤖 Telegram бот уже настроен с токеном!"
echo "   Бот готов к работе: @FranklinFATБот"
echo ""
echo "📋 Управление сервисом:"
echo "   Статус:      systemctl status finio"
echo "   Остановка:   systemctl stop finio"
echo "   Запуск:      systemctl start finio"
echo "   Перезапуск:  systemctl restart finio"
echo "   Логи:        journalctl -u finio -f"
echo ""
echo "🔧 Файлы проекта: /opt/Finio"
echo "🔧 Конфигурация:  /opt/Finio/server/.env"
echo "🔒 SSL сертификат настроен и будет автоматически обновляться"
echo ""
echo "🚀 КОМАНДА ДЛЯ БЫСТРОЙ УСТАНОВКИ:"
echo "curl -fsSL https://raw.githubusercontent.com/Franklin15097/Finio/main/ubuntu-install.sh | sudo bash"
