#!/bin/bash

echo "🐳 УСТАНОВКА FINIO С DOCKER"
echo "============================"

# Проверка прав root
if [[ $EUID -ne 0 ]]; then
   echo "❌ Запустите с sudo"
   exit 1
fi

# Обновление системы
echo "🔄 Обновление системы..."
apt-get update && apt-get upgrade -y

# Установка Docker
echo "🐳 Установка Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    
    # Установка Docker Compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo "✅ Docker уже установлен"
fi

# Установка Nginx
echo "🌐 Установка Nginx..."
apt-get install -y nginx certbot python3-certbot-nginx

# Клонирование проекта
echo "📥 Клонирование проекта..."
cd /opt
if [ -d "Finio" ]; then
    cd Finio
    git pull origin main
else
    git clone https://github.com/Franklin15097/Finio.git
    cd Finio
fi

# Создание .env файла
echo "📝 Создание .env..."
cat > .env << EOF
BOT_TOKEN=8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34
JWT_SECRET=$(openssl rand -base64 32)
EOF

# Сборка и запуск
echo "🔨 Сборка и запуск..."
docker-compose up -d --build

# Ожидание запуска
echo "⏳ Ожидание запуска..."
sleep 15

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
        
        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

ln -sf /etc/nginx/sites-available/finio /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверка и перезагрузка Nginx
nginx -t && systemctl reload nginx

# Настройка SSL
echo "🔒 Настройка SSL..."
certbot --nginx -d studiofinance.ru -d www.studiofinance.ru --non-interactive --agree-tos --email maks50kucherenko@gmail.com --redirect || true

# Настройка автообновления SSL
systemctl enable certbot.timer
systemctl start certbot.timer

# Настройка файрвола
echo "🔥 Настройка файрвола..."
ufw --force enable
ufw allow ssh
ufw allow 'Nginx Full'

# Проверка статуса
echo ""
echo "🔍 Проверка статуса..."
docker-compose ps
curl -f http://localhost:3000/health

echo ""
echo "🎉 УСТАНОВКА ЗАВЕРШЕНА!"
echo "======================"
echo ""
echo "🌐 Сайт: https://studiofinance.ru"
echo "📊 Статус: docker-compose ps"
echo "📋 Логи: docker-compose logs -f app"
echo "🔄 Обновление: ./deploy.sh"
echo ""
echo "📝 Полезные команды:"
echo "  docker-compose ps              - статус контейнеров"
echo "  docker-compose logs -f app     - логи приложения"
echo "  docker-compose restart app     - перезапуск приложения"
echo "  docker-compose down            - остановка всех контейнеров"
echo "  docker-compose up -d           - запуск контейнеров"
