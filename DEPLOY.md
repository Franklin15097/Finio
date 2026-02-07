# Инструкция по деплою Studio Finance

## Быстрый старт на сервере

### 1. Подключитесь к серверу
```bash
ssh root@85.235.205.99
```

### 2. Установите необходимые зависимости

```bash
# Обновление системы
apt update && apt upgrade -y

# Установка Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Установка PM2 для управления процессами
npm install -g pm2

# Установка Nginx
apt install -y nginx

# Установка Git
apt install -y git
```

### 3. Клонируйте репозиторий

```bash
cd /var/www
git clone https://github.com/Franklin15097/Finio.git studiofinance
cd studiofinance
```

### 4. Запустите установку

```bash
chmod +x install.sh
./install.sh
```

### 5. Настройте Nginx

Создайте файл `/etc/nginx/sites-available/studiofinance`:

```nginx
# Mini App
server {
    listen 80;
    server_name studiofinance.ru;
    
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 3000;
    server_name studiofinance.ru;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Активируйте конфигурацию:
```bash
ln -s /etc/nginx/sites-available/studiofinance /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 6. Запустите проект

```bash
# Запуск Backend через PM2
cd /var/www/studiofinance/server
pm2 start index.js --name studiofinance-backend
pm2 save
pm2 startup

# Запуск Mini App Frontend
cd /var/www/studiofinance/mini-app-frontend
pm2 start "npm run dev" --name studiofinance-miniapp

# Запуск Website Frontend
cd /var/www/studiofinance/website-frontend
pm2 start "npm run dev" --name studiofinance-website

pm2 save
```

### 7. Настройте Telegram Bot

1. Откройте @BotFather в Telegram
2. Отправьте команду `/setmenubutton`
3. Выберите вашего бота
4. Укажите URL: `http://studiofinance.ru`
5. Укажите текст кнопки: "Открыть приложение"

### 8. Проверка

```bash
# Проверка статуса сервисов
pm2 status

# Просмотр логов
pm2 logs studiofinance-backend
pm2 logs studiofinance-miniapp
pm2 logs studiofinance-website

# Проверка портов
netstat -tulpn | grep -E '3000|5173|5174'
```

## Одной командой (после установки зависимостей)

```bash
cd /var/www && \
git clone https://github.com/Franklin15097/Finio.git studiofinance && \
cd studiofinance && \
chmod +x install.sh && \
./install.sh && \
cd server && pm2 start index.js --name studiofinance-backend && \
cd ../mini-app-frontend && pm2 start "npm run dev" --name studiofinance-miniapp && \
cd ../website-frontend && pm2 start "npm run dev" --name studiofinance-website && \
pm2 save && \
echo "✅ Проект развернут!"
```

## Управление проектом

```bash
# Перезапуск всех сервисов
pm2 restart all

# Остановка всех сервисов
pm2 stop all

# Просмотр логов
pm2 logs

# Обновление из Git
cd /var/www/studiofinance
git pull
./install.sh
pm2 restart all
```

## Проверка работы

- Backend API: http://85.235.205.99:3000/health
- Mini App: http://studiofinance.ru
- Telegram Bot: @FranklinFAT (команда /start)

## База данных

Подключение уже настроено в `server/.env`:
- Host: 85.235.205.99
- Database: finio
- User: finio_user
- Password: maks15097
