# 🚀 Deployment Guide

Полное руководство по деплою Finio на production сервер.

## Требования

- Ubuntu Server 20.04+
- Node.js 18+
- MySQL 8.0+
- Nginx
- PM2
- Git
- SSH доступ к серверу

## Первоначальная настройка сервера

### 1. Установка зависимостей

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Установка MySQL
sudo apt install -y mysql-server

# Установка Nginx
sudo apt install -y nginx

# Установка PM2
sudo npm install -g pm2

# Установка Git
sudo apt install -y git
```

### 2. Настройка MySQL

```bash
# Запуск MySQL secure installation
sudo mysql_secure_installation

# Создание базы данных
sudo mysql -u root -p
```

```sql
CREATE DATABASE financial_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'finio'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON financial_db.* TO 'finio'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Клонирование проекта

```bash
# Создание директории
sudo mkdir -p /var/www
cd /var/www

# Клонирование репозитория
sudo git clone https://github.com/Franklin15097/Finio.git studiofinance
cd studiofinance

# Установка прав
sudo chown -R $USER:$USER /var/www/studiofinance
```

### 4. Настройка Backend

```bash
cd /var/www/studiofinance/backend

# Установка зависимостей
npm install

# Создание .env файла
cp .env.example .env
nano .env
```

Содержимое `.env`:
```env
PORT=5000
NODE_ENV=production

DB_HOST=localhost
DB_USER=finio
DB_PASSWORD=your_secure_password
DB_NAME=financial_db

JWT_SECRET=your_very_long_random_secret_key_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

BACKEND_URL=https://api.studiofinance.ru
FRONTEND_URL=https://studiofinance.ru
```

```bash
# Импорт схемы базы данных
mysql -u finio -p financial_db < database/schema.sql

# Сборка
npm run build
```

### 5. Настройка Frontend

```bash
cd /var/www/studiofinance/frontend

# Установка зависимостей
npm install

# Сборка
npm run build
```

### 6. Настройка Nginx

```bash
sudo nano /etc/nginx/sites-available/studiofinance
```

Содержимое конфигурации:
```nginx
# Frontend
server {
    listen 80;
    server_name studiofinance.ru www.studiofinance.ru;
    
    root /var/www/studiofinance/frontend/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Cache static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Активация конфигурации
sudo ln -s /etc/nginx/sites-available/studiofinance /etc/nginx/sites-enabled/

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
```

### 7. Настройка SSL (Let's Encrypt)

```bash
# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получение сертификата
sudo certbot --nginx -d studiofinance.ru -d www.studiofinance.ru

# Автоматическое обновление
sudo certbot renew --dry-run
```

### 8. Запуск приложения с PM2

```bash
cd /var/www/studiofinance

# Запуск backend
pm2 start backend/dist/index.js --name finio-backend

# Запуск bot
pm2 start backend/dist/bot.js --name finio-bot

# Сохранение конфигурации PM2
pm2 save

# Автозапуск при перезагрузке
pm2 startup
```

## Автоматический деплой

### Использование скрипта деплоя

```bash
# Полный деплой
./scripts/deploy.sh full

# Только frontend
./scripts/deploy.sh frontend

# Только backend
./scripts/deploy.sh backend

# Только bot
./scripts/deploy.sh bot
```

### Что делает скрипт:

1. Проверяет наличие uncommitted изменений
2. Push изменений в GitHub
3. Подключается к серверу по SSH
4. Pull последних изменений
5. Устанавливает зависимости
6. Собирает проект
7. Перезапускает сервисы
8. Проверяет статус

## Ручной деплой

### 1. Подключение к серверу

```bash
ssh root@85.235.205.99
cd /var/www/studiofinance
```

### 2. Обновление кода

```bash
git pull origin main
```

### 3. Обновление Frontend

```bash
cd frontend
npm install
npm run build
cd ..
```

### 4. Обновление Backend

```bash
cd backend
npm install
npm run build
cd ..
```

### 5. Перезапуск сервисов

```bash
pm2 restart finio-backend
pm2 restart finio-bot
```

### 6. Проверка статуса

```bash
pm2 status
pm2 logs finio-backend --lines 50
pm2 logs finio-bot --lines 50
```

## Мониторинг

### PM2 команды

```bash
# Статус всех процессов
pm2 status

# Логи
pm2 logs
pm2 logs finio-backend
pm2 logs finio-bot

# Мониторинг в реальном времени
pm2 monit

# Информация о процессе
pm2 info finio-backend

# Перезапуск
pm2 restart finio-backend
pm2 restart finio-bot
pm2 restart all

# Остановка
pm2 stop finio-backend
pm2 stop all

# Удаление
pm2 delete finio-backend
```

### Логи Nginx

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### Логи MySQL

```bash
# Error log
sudo tail -f /var/log/mysql/error.log

# Slow query log
sudo tail -f /var/log/mysql/mysql-slow.log
```

## Резервное копирование

### База данных

```bash
# Создание бэкапа
mysqldump -u finio -p financial_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление
mysql -u finio -p financial_db < backup_20260216_120000.sql
```

### Автоматический бэкап (cron)

```bash
# Редактирование crontab
crontab -e
```

Добавить:
```cron
# Ежедневный бэкап в 3:00
0 3 * * * mysqldump -u finio -p'password' financial_db > /var/backups/finio_$(date +\%Y\%m\%d).sql

# Удаление старых бэкапов (старше 30 дней)
0 4 * * * find /var/backups -name "finio_*.sql" -mtime +30 -delete
```

## Обновление зависимостей

### Backend

```bash
cd /var/www/studiofinance/backend
npm update
npm audit fix
npm run build
pm2 restart finio-backend
```

### Frontend

```bash
cd /var/www/studiofinance/frontend
npm update
npm audit fix
npm run build
```

## Откат изменений

### Откат к предыдущему коммиту

```bash
cd /var/www/studiofinance

# Просмотр истории
git log --oneline -10

# Откат к конкретному коммиту
git reset --hard <commit-hash>

# Пересборка и перезапуск
cd frontend && npm run build && cd ..
cd backend && npm run build && cd ..
pm2 restart all
```

## Troubleshooting

### Backend не запускается

```bash
# Проверка логов
pm2 logs finio-backend --lines 100

# Проверка порта
sudo netstat -tulpn | grep 5000

# Проверка .env файла
cat backend/.env

# Проверка подключения к БД
mysql -u finio -p financial_db
```

### Frontend не отображается

```bash
# Проверка Nginx
sudo nginx -t
sudo systemctl status nginx

# Проверка логов Nginx
sudo tail -f /var/log/nginx/error.log

# Проверка прав на файлы
ls -la /var/www/studiofinance/frontend/dist
```

### Bot не отвечает

```bash
# Проверка логов
pm2 logs finio-bot --lines 100

# Проверка токена
echo $TELEGRAM_BOT_TOKEN

# Перезапуск
pm2 restart finio-bot
```

### База данных недоступна

```bash
# Проверка статуса MySQL
sudo systemctl status mysql

# Перезапуск MySQL
sudo systemctl restart mysql

# Проверка подключения
mysql -u finio -p financial_db
```

## Безопасность

### Firewall (UFW)

```bash
# Установка UFW
sudo apt install -y ufw

# Разрешение SSH
sudo ufw allow 22/tcp

# Разрешение HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Включение firewall
sudo ufw enable

# Проверка статуса
sudo ufw status
```

### Fail2Ban

```bash
# Установка
sudo apt install -y fail2ban

# Настройка
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Запуск
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

## Производительность

### PM2 Cluster Mode

```bash
# Запуск в cluster mode (использует все CPU)
pm2 start backend/dist/index.js --name finio-backend -i max

# Или указать количество инстансов
pm2 start backend/dist/index.js --name finio-backend -i 4
```

### Nginx Caching

Добавить в конфигурацию Nginx:
```nginx
# Cache zone
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;

# В location /api
proxy_cache api_cache;
proxy_cache_valid 200 5m;
proxy_cache_bypass $http_cache_control;
add_header X-Cache-Status $upstream_cache_status;
```

## Контакты

- **Email:** support@studiofinance.ru
- **GitHub:** https://github.com/Franklin15097/Finio
- **Server:** 85.235.205.99
