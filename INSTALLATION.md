# 🚀 Полное руководство по установке Finio

**Проект готов к деплою!** Это руководство поможет развернуть Finio на хостинге с архитектурой FastAPI + React + Telegram Bot.

## ✅ Что уже готово в проекте

- ✅ **Backend**: FastAPI с полной структурой согласно ТЗ
- ✅ **Frontend**: React приложение с современным UI  
- ✅ **Telegram Bot**: Aiogram 3.x с webhook интеграцией
- ✅ **База данных**: PostgreSQL модели и миграции
- ✅ **Docker**: Готовая конфигурация для разработки
- ✅ **Nginx**: Настройки для продакшена
- ✅ **SSL**: Поддержка Let's Encrypt
- ✅ **Systemd**: Сервисы для автозапуска
- ✅ **Бэкапы**: Автоматические скрипты

## 🎯 Архитектура проекта

```
┌─────────────────┐     HTTPS/REST     ┌──────────────────────────────────┐
│   Frontend      │◄──────────────────►│     Backend API (FastAPI)        │
│   React SPA     │                    │  - REST API для фронтенда        │
│   (Static)      │                    │  - Webhook обработчик для бота   │
│                 │                    │  - Общая бизнес-логика           │
└─────────────────┘                    │  - JWT аутентификация            │
                                       └────────────┬─────────────────────┘
                                       ▲            │
                                       │            ▼
                                  Webhook     ┌─────────────┐
                                       │      │ PostgreSQL  │
                                       │      │  Database   │
                                       │      └─────────────┘
                                 ┌──────────┐
                                 │Telegram  │
                                 │  Bot     │
                                 │(FinanceStudio_bot)│
                                 └──────────┘
```

## 📋 Требования к хостингу

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

## 🚀 Быстрая установка (рекомендуется)

### Шаг 1: Клонирование проекта

```bash
# На вашем хостинге выполните:
git clone https://github.com/Franklin15097/Finio.git
cd Finio
```

### Шаг 2: Автоматическая установка

```bash
# Сделайте скрипт исполняемым
chmod +x install.sh

# Запустите автоматическую установку
sudo ./install.sh your-domain.com your-telegram-bot-token
```

**Готово!** Скрипт автоматически:
- Установит все зависимости
- Настроит PostgreSQL
- Соберет frontend
- Настроит Nginx с SSL
- Запустит все сервисы
- Настроит Telegram webhook

---

## 📖 Ручная установка (пошагово)

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
sudo nano /etc/postgresql/14/main/pg_hba.conf              !
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

### Шаг 4: Настройка переменных окружения (.env)

**Важно!** Отредактируйте файл `.env` в директории `backend/`:

```bash
cd /var/www/finio/backend
sudo nano .env
```

Обязательно измените следующие параметры:

```bash
# Telegram Bot settings (ОБЯЗАТЕЛЬНО!)
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz  # Токен вашего FinanceStudio_bot
TELEGRAM_WEBHOOK_URL=https://your-domain.com
TELEGRAM_ADMIN_IDS=123456789  # Ваш Telegram ID (получите у @userinfobot)

# App settings
SECRET_KEY=your-very-long-secret-key-here-change-this  # Сгенерируйте новый!

# Database settings (автоматически заполнены)
DB_PASSWORD=your_generated_password  # Уже установлен автоматически
```

**Как получить токен бота:**
1. Найдите @BotFather в Telegram
2. Отправьте `/mybots`
3. Выберите `FinanceStudio_bot`
4. Нажмите "API Token"
5. Скопируйте токен в `.env` файл

### 5. Инициализация базы данных

```bash
# Находясь в backend/ с активированным venv
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
WorkingDirectory=/var/www/finio/backend
Environment="PATH=/var/www/finio/backend/venv/bin"
EnvironmentFile=/var/www/finio/backend/.env
ExecStart=/var/www/finio/backend/venv/bin/gunicorn \
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

## 🔧 Обновление проекта

Для обновления проекта используйте готовый скрипт:

```bash
cd /path/to/Finio
sudo ./update.sh
```

Скрипт автоматически:
- Создаст бэкап
- Обновит код из GitHub
- Применит миграции БД
- Пересоберет frontend
- Перезапустит сервисы

## 🤖 Настройка Telegram бота FinanceStudio_bot

### Получение токена бота

1. **Если бот уже создан:**
   - Найдите @BotFather в Telegram
   - Отправьте `/mybots`
   - Выберите `FinanceStudio_bot`
   - Нажмите "API Token"

2. **Если нужно создать нового бота:**
   - Найдите @BotFather в Telegram
   - Отправьте `/newbot`
   - Введите имя: `FinanceStudio`
   - Введите username: `FinanceStudio_bot`
   - Сохраните полученный токен

### Настройка команд бота

После установки настройте команды бота:

```bash
# Замените YOUR_BOT_TOKEN на реальный токен
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setMyCommands" \
     -H "Content-Type: application/json" \
     -d '{
       "commands": [
         {"command": "start", "description": "Начать работу с ботом"},
         {"command": "help", "description": "Справка по командам"},
         {"command": "balance", "description": "Показать текущий баланс"},
         {"command": "stats", "description": "Показать статистику"},
         {"command": "link", "description": "Привязать аккаунт к сайту"}
       ]
     }'
```

### Проверка работы бота

1. Найдите вашего бота в Telegram: `@FinanceStudio_bot`
2. Отправьте `/start`
3. Бот должен ответить приветственным сообщением
4. Проверьте webhook: `curl "https://api.telegram.org/botYOUR_TOKEN/getWebhookInfo"`

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