#!/bin/bash

echo "🔧 ИСПРАВЛЕНИЕ ЦИКЛИЧЕСКОГО ПЕРЕНАПРАВЛЕНИЯ"
echo "=========================================="

if [ "$EUID" -ne 0 ]; then
    echo "❌ Запустите с правами root: sudo $0"
    exit 1
fi

cd /var/www/finio

echo "1. Остановка системного Nginx..."
systemctl stop nginx
systemctl disable nginx

echo "2. Удаление конфликтующих конфигураций..."
rm -f /etc/nginx/sites-enabled/finio
rm -f /etc/nginx/sites-available/finio

echo "3. Обновление Docker конфигурации..."
# Создаем правильную nginx конфигурацию для Docker
cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8000;
    }
    
    upstream frontend {
        server frontend:3000;
    }
    
    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name studiofinance.ru www.studiofinance.ru;
        return 301 https://$server_name$request_uri;
    }
    
    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name studiofinance.ru www.studiofinance.ru;
        
        # SSL certificates (mount from host)
        ssl_certificate /etc/letsencrypt/live/studiofinance.ru/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/studiofinance.ru/privkey.pem;
        
        # SSL settings
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        
        # API routes
        location /api/ {
            proxy_pass http://backend/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
        }
        
        # Bot webhook
        location /bot-webhook {
            proxy_pass http://backend/bot-webhook;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
        }
        
        # Health check
        location /health {
            proxy_pass http://backend/health;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
        
        # Mini App
        location /miniapp {
            proxy_pass http://backend/miniapp;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
        
        # Frontend
        location / {
            proxy_pass http://frontend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
        }
    }
}
EOF

echo "4. Обновление docker-compose для SSL..."
# Добавляем монтирование SSL сертификатов в nginx контейнер
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # MySQL база данных
  mysql:
    image: mysql:8.0
    container_name: finio_mysql
    environment:
      MYSQL_ROOT_PASSWORD: root_password_2024
      MYSQL_DATABASE: finio
      MYSQL_USER: finio_user
      MYSQL_PASSWORD: maks15097
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    command: --default-authentication-plugin=mysql_native_password --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci --bind-address=0.0.0.0
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-proot_password_2024"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s
    restart: unless-stopped
    networks:
      - finio_network

  # Backend API
  backend:
    build: ./backend
    container_name: finio_backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=mysql+aiomysql://finio_user:maks15097@mysql:3306/finio
      - TELEGRAM_BOT_TOKEN=8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34
      - TELEGRAM_WEBHOOK_URL=https://studiofinance.ru
      - SECRET_KEY=dev-secret-key-change-in-production-2024
      - APP_DEBUG=false
    depends_on:
      mysql:
        condition: service_healthy
    volumes:
      - ./backend:/app
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1
    restart: unless-stopped
    networks:
      - finio_network

  # Frontend
  frontend:
    image: node:18-alpine
    container_name: finio_frontend
    working_dir: /app
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: sh -c "npm install && npm run build && npx serve -s build -l 3000"
    environment:
      - REACT_APP_API_URL=https://studiofinance.ru
      - GENERATE_SOURCEMAP=false
      - WATCHPACK_POLLING=true
    restart: unless-stopped
    networks:
      - finio_network

  # Nginx reverse proxy with SSL
  nginx:
    image: nginx:alpine
    container_name: finio_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - backend
      - frontend
    restart: unless-stopped
    networks:
      - finio_network

volumes:
  mysql_data:

networks:
  finio_network:
    driver: bridge
EOF

echo "5. Перезапуск контейнеров..."
docker-compose down
docker-compose up -d --build

echo "6. Ожидание запуска..."
sleep 30

echo "7. Проверка работы..."
if curl -f -s https://studiofinance.ru/health >/dev/null 2>&1; then
    echo "✅ HTTPS работает!"
    echo "🎉 Сайт исправлен: https://studiofinance.ru"
else
    echo "❌ Все еще есть проблемы"
    echo "📋 Логи nginx:"
    docker-compose logs nginx
fi

echo ""
echo "🔍 Проверьте сайт: https://studiofinance.ru"