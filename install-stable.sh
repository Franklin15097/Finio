#!/bin/bash

echo "🚀 СТАБИЛЬНАЯ УСТАНОВКА FINIO"
echo "============================="

set -e

# Проверка прав root
if [[ $EUID -ne 0 ]]; then
   echo "❌ Запустите с sudo"
   exit 1
fi

# Остановка старых процессов
echo "⏹️ Остановка старых процессов..."
pkill -f "node.*index" || true
systemctl stop finio 2>/dev/null || true
systemctl disable finio 2>/dev/null || true

# Обновление системы
echo "🔄 Обновление системы..."
apt-get update

# Установка зависимостей
echo "📦 Установка зависимостей..."
apt-get install -y curl wget git nginx postgresql postgresql-contrib certbot python3-certbot-nginx

# Установка Node.js 20
echo "📦 Установка Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Установка PM2
echo "📦 Установка PM2..."
npm install -g pm2

echo "✅ Node.js: $(node --version)"
echo "✅ NPM: $(npm --version)"
echo "✅ PM2: $(pm2 --version)"

# Настройка PostgreSQL
echo "🗄️ Настройка PostgreSQL..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS finio;" 2>/dev/null || true
sudo -u postgres psql -c "DROP USER IF EXISTS finio_user;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE finio;"
sudo -u postgres psql -c "CREATE USER finio_user WITH PASSWORD 'maks15097';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE finio TO finio_user;"
sudo -u postgres psql -c "ALTER DATABASE finio OWNER TO finio_user;"

# Клонирование проекта
echo "📥 Клонирование проекта..."
cd /opt
if [ -d "Finio" ]; then
    cd Finio
    git fetch origin
    git reset --hard origin/main
    git pull origin main
else
    git clone https://github.com/Franklin15097/Finio.git
    cd Finio
fi

# Установка зависимостей сервера
echo "📦 Установка зависимостей сервера..."
cd server
npm install --production

# Установка зависимостей фронтенда
echo "📦 Установка зависимостей фронтенда..."
cd ../website-frontend
npm install
npm run build

cd ../mini-app-frontend
npm install
npm run build

# Создание .env
echo "📝 Создание .env..."
cd /opt/Finio/server
cat > .env << EOF
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finio
DB_USER=finio_user
DB_PASSWORD=maks15097
BOT_TOKEN=8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
EOF

# Настройка Nginx
echo "🌐 Настройка Nginx..."
cat > /etc/nginx/sites-available/finio << 'EOF'
server {
    listen 80;
    server_name studiofinance.ru www.studiofinance.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

ln -sf /etc/nginx/sites-available/finio /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx

# Запуск с PM2
echo "🚀 Запуск приложения с PM2..."
cd /opt/Finio/server
pm2 delete finio 2>/dev/null || true
pm2 start index-simple.js --name finio --time
pm2 save
pm2 startup systemd -u root --hp /root

# Настройка SSL
echo "🔒 Настройка SSL..."
certbot --nginx -d studiofinance.ru -d www.studiofinance.ru --non-interactive --agree-tos --email maks50kucherenko@gmail.com --redirect || echo "⚠️ SSL будет настроен позже"

# Настройка файрвола
echo "🔥 Настройка файрвола..."
ufw --force enable
ufw allow ssh
ufw allow 'Nginx Full'

# Проверка статуса
echo ""
echo "🔍 Проверка статуса..."
sleep 3
pm2 status
curl -f http://localhost:3000/health || echo "⚠️ Сервис еще запускается..."

echo ""
echo "🎉 УСТАНОВКА ЗАВЕРШЕНА!"
echo "======================"
echo ""
echo "🌐 Сайт: https://studiofinance.ru"
echo ""
echo "📋 Управление:"
echo "  pm2 status              - статус"
echo "  pm2 logs finio          - логи"
echo "  pm2 restart finio       - перезапуск"
echo "  pm2 stop finio          - остановка"
echo "  pm2 start finio         - запуск"
echo ""
echo "🔄 Обновление:"
echo "  cd /opt/Finio && git pull && cd server && pm2 restart finio"
