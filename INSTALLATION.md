# Руководство по установке Finio

Это руководство поможет вам развернуть проект Finio на хостинге с новой архитектурой (FastAPI + React + Telegram Bot).

## Требования к хостингу

### Минимальные требования
- **ОС**: Ubuntu 22.04 LTS или новее
- **RAM**: 2 GB (рекомендуется 4 GB)
- **Диск**: 20 GB SSD
- **CPU**: 2 ядра
- **Сеть**: Статический IP адрес
- **Домен**: Собственный домен с SSL сертификатом

### Рекомендуемые хостинг-провайдеры
1. **DigitalOcean** - от $12/месяц (Droplet 2GB RAM)
2. **Vultr** - от $10/месяц (Regular Performance 2GB)
3. **Linode** - от $12/месяц (Nanode 2GB)
4. **Hetzner** - от €4.15/месяц (CX21)
5. **AWS EC2** - от $15/месяц (t3.small)

## Пошаговая установка

### 1. Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка необходимых пакетов
sudo apt install -y python3 python3-pip python3-venv nginx postgresql postgresql-contrib certbot python3-certbot-nginx git curl

# Установка Node.js (для сборки фронтенда)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Создание пользователя для приложения
sudo adduser --system --group --home /var/www/finio finio
sudo mkdir -p /var/www/finio
sudo chown finio:finio /var/www/finio
```

### 2. Настройка PostgreSQL

```bash
# Переключение на пользователя postgres
sudo -u postgres psql

# В psql выполните:
CREATE DATABASE finio;
CREATE USER finio_user WITH PASSWORD 'your_strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE finio TO finio_user;
ALTER USER finio_user CREATEDB;
\q

# Настройка подключений (опционально)
sudo nano /etc/postgresql/14/main/pg_hba.conf
# Добавьте строку: local   finio   finio_user   md5

sudo systemctl restart postgresql
```

### 3. Клонирование и настройка проекта

```bash
# Переключение на пользователя finio
sudo -u finio -i

# Клонирование репозитория
cd /var/www/finio
git clone https://github.com/your-username/finio.git .

# Настройка backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Копирование и настройка переменных окружения
cp .env.example .env
nano .env
```

### 4. Настройка переменных окружения (.env)

```bash
# App settings
APP_NAME="Finio API"
APP_ENV=production
DEBUG=false
SECRET_KEY=your-very-long-secret-key-here-change-this

# JWT settings
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database settings
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finio
DB_USER=finio_user
DB_PASSWORD=your_strong_password_here

# Telegram Bot settings
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_WEBHOOK_URL=https://your-domain.com
TELEGRAM_ADMIN_IDS=123456789

# CORS settings
ALLOWED_HOSTS=https://your-domain.com,https://www.your-domain.com

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/finio/app.log
```

### 5. Инициализация базы данных

```bash
# Находясь в корне проекта с активированным venv
alembic upgrade head

# Или создание таблиц напрямую (если миграции не настроены)
python -c "
import asyncio
from app.core.database import init_db
asyncio.run(init_db())
"
```

### 6. Сборка фронтенда

```bash
# Переход в директорию фронтенда
cd /var/www/finio/frontend

# Установка зависимостей
npm install

# Создание production сборки
npm run build

# Копирование собранных файлов
sudo mkdir -p /var/www/finio/static
sudo cp -r build/* /var/www/finio/static/
sudo chown -R www-data:www-data /var/www/finio/static
```

### 7. Настройка Nginx

```bash
# Создание конфигурации Nginx
sudo nano /etc/nginx/sites-available/finio
```

Содержимое файла конфигурации:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL сертификаты (будут настроены позже)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Frontend (статичные файлы)
    location / {
        root /var/www/finio/static;
        try_files $uri $uri/ /index.html;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # Telegram Bot Webhook
    location /bot-webhook {
        proxy_pass http://127.0.0.1:8000/bot-webhook;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

Активация конфигурации:

```bash
# Активация сайта
sudo ln -s /etc/nginx/sites-available/finio /etc/nginx/sites-enabled/

# Удаление дефолтного сайта
sudo rm /etc/nginx/sites-enabled/default

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
```

### 8. Получение SSL сертификата

```bash
# Получение сертификата Let's Encrypt
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Автоматическое обновление сертификата
sudo crontab -e
# Добавьте строку:
0 12 * * * /usr/bin/certbot renew --quiet
```

### 9. Настройка systemd сервиса

```bash
# Создание сервиса
sudo nano /etc/systemd/system/finio.service
```

Содержимое файла сервиса:

```ini
[Unit]
Description=Finio Backend API
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=finio
Group=finio
WorkingDirectory=/var/www/finio
Environment="PATH=/var/www/finio/venv/bin"
EnvironmentFile=/var/www/finio/.env
ExecStart=/var/www/finio/venv/bin/gunicorn \
          app.main:app \
          --workers 4 \
          --worker-class uvicorn.workers.UvicornWorker \
          --bind 127.0.0.1:8000 \
          --timeout 120 \
          --access-logfile /var/log/finio/access.log \
          --error-logfile /var/log/finio/error.log
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Настройка логирования и запуск:

```bash
# Создание директории для логов
sudo mkdir -p /var/log/finio
sudo chown finio:finio /var/log/finio

# Активация и запуск сервиса
sudo systemctl daemon-reload
sudo systemctl enable finio
sudo systemctl start finio

# Проверка статуса
sudo systemctl status finio
```

### 10. Настройка Telegram бота

1. **Создание бота**:
   - Найдите @BotFather в Telegram
   - Отправьте `/newbot`
   - Следуйте инструкциям для создания бота
   - Сохраните полученный токен

2. **Настройка webhook**:
```bash
# Установка webhook (замените TOKEN на ваш токен)
curl -X POST "https://api.telegram.org/botTOKEN/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-domain.com/bot-webhook/"}'

# Проверка webhook
curl "https://api.telegram.org/botTOKEN/getWebhookInfo"
```

### 11. Настройка бэкапов

```bash
# Создание скрипта бэкапа
sudo nano /usr/local/bin/finio-backup.sh
```

Содержимое скрипта:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/finio"
DATE=$(date +%Y%m%d_%H%M%S)

# Создание директории для бэкапов
mkdir -p $BACKUP_DIR

# Бэкап базы данных
sudo -u postgres pg_dump finio > $BACKUP_DIR/finio_db_$DATE.sql

# Бэкап файлов приложения
tar -czf $BACKUP_DIR/finio_files_$DATE.tar.gz -C /var/www finio

# Удаление старых бэкапов (старше 7 дней)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Права на выполнение
sudo chmod +x /usr/local/bin/finio-backup.sh

# Добавление в cron (ежедневно в 2:00)
sudo crontab -e
# Добавьте строку:
0 2 * * * /usr/local/bin/finio-backup.sh
```

### 12. Проверка установки

1. **Проверка backend**:
```bash
curl https://your-domain.com/health
# Должен вернуть: {"status": "healthy", "app": "Finio API"}
```

2. **Проверка frontend**:
   - Откройте https://your-domain.com в браузере
   - Должна загрузиться главная страница

3. **Проверка Telegram бота**:
   - Найдите вашего бота в Telegram
   - Отправьте `/start`
   - Бот должен ответить

### 13. Обновление приложения

Создайте скрипт для обновления:

```bash
sudo nano /usr/local/bin/finio-update.sh
```

```bash
#!/bin/bash
cd /var/www/finio

# Остановка сервиса
sudo systemctl stop finio

# Обновление кода
sudo -u finio git pull origin main

# Обновление backend
sudo -u finio /var/www/finio/venv/bin/pip install -r requirements.txt
sudo -u finio /var/www/finio/venv/bin/alembic upgrade head

# Обновление frontend
cd frontend
npm install
npm run build
sudo cp -r build/* /var/www/finio/static/
sudo chown -R www-data:www-data /var/www/finio/static

# Запуск сервиса
sudo systemctl start finio

echo "Update completed"
```

```bash
sudo chmod +x /usr/local/bin/finio-update.sh
```

## Миграция данных

Если у вас есть данные из старой версии:

```bash
# Установка дополнительных зависимостей для миграции
pip install asyncpg mysql-connector-python

# Запуск скрипта миграции
python migrate_data.py
```

## Устранение неполадок

### Проблемы с backend
```bash
# Проверка логов
sudo journalctl -u finio -f

# Проверка логов приложения
tail -f /var/log/finio/error.log
```

### Проблемы с базой данных
```bash
# Проверка подключения
sudo -u finio psql -h localhost -U finio_user -d finio

# Проверка статуса PostgreSQL
sudo systemctl status postgresql
```

### Проблемы с Nginx
```bash
# Проверка конфигурации
sudo nginx -t

# Проверка логов
sudo tail -f /var/log/nginx/error.log
```

### Проблемы с Telegram ботом
```bash
# Проверка webhook
curl "https://api.telegram.org/botYOUR_TOKEN/getWebhookInfo"

# Проверка логов бота
grep "telegram" /var/log/finio/app.log
```

## Безопасность

1. **Firewall**:
```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
```

2. **Обновления безопасности**:
```bash
# Автоматические обновления
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

3. **Мониторинг**:
   - Настройте мониторинг доступности сайта
   - Используйте сервисы типа UptimeRobot
   - Настройте алерты на email/Telegram

## Поддержка

При возникновении проблем:
1. Проверьте логи приложения
2. Убедитесь, что все сервисы запущены
3. Проверьте конфигурацию Nginx
4. Убедитесь, что SSL сертификат действителен
5. Проверьте настройки Telegram webhook

Для получения помощи создайте issue в репозитории проекта с подробным описанием проблемы и логами.