# 📝 Что делать после установки

Поздравляем с установкой Finio v2.0! Вот что нужно сделать дальше.

## ✅ Проверка установки

### 1. Проверьте все сервисы

```bash
# Redis
redis-cli ping
# Должно вернуть: PONG

# MySQL
mysql -u root -p -e "USE finio_db; SHOW TABLES;"
# Должно показать 5 таблиц

# Backend
curl http://localhost:5000/api/health
# Должно вернуть JSON с status: "ok"
```

### 2. Проверьте логи

```bash
# Development
# Смотрите консоль где запущен npm run dev

# Production
pm2 logs finio-backend --lines 50
```

Должны увидеть:
```
✅ Redis connected
🔌 WebSocket server initialized
🚀 Server running on port 5000
🛡️  Rate limiting enabled
```

### 3. Проверьте WebSocket

Откройте http://localhost:5173 и откройте DevTools Console.
Должны увидеть:
```
✅ WebSocket connected
WebSocket authenticated: {userId: 1, timestamp: "..."}
```

## 🔧 Настройка

### 1. Измените секретные ключи

**Сгенерируйте новый JWT_SECRET:**
```bash
openssl rand -base64 32
```

Добавьте в `backend/.env`:
```env
JWT_SECRET=ваш_новый_секрет
```

### 2. Настройте Telegram Bot

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен
3. Добавьте в `backend/.env`:
   ```env
   TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```
4. Настройте команды:
   ```
   /setcommands
   
   start - 🚀 Начать работу
   add - 💰 Добавить транзакцию
   balance - 💳 Посмотреть баланс
   app - 📱 Открыть приложение
   site - 🌐 Открыть сайт
   help - 📖 Помощь
   about - ℹ️ О приложении
   ```

### 3. Настройте домены (Production)

Обновите `backend/.env`:
```env
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

Обновите `frontend/.env`:
```env
VITE_API_URL=https://api.yourdomain.com
```

### 4. Настройте CORS (Production)

Отредактируйте `backend/src/index.ts`:
```typescript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

### 5. Настройте Nginx (если используется)

```nginx
# /etc/nginx/sites-available/finio

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket timeout
        proxy_read_timeout 86400;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/finio/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Активируйте конфигурацию:
```bash
sudo ln -s /etc/nginx/sites-available/finio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Настройте SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

## 🔐 Безопасность

### 1. Защитите Redis

Отредактируйте `/etc/redis/redis.conf`:
```conf
# Установите пароль
requirepass your_strong_password

# Слушайте только localhost
bind 127.0.0.1

# Отключите опасные команды
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG ""
```

Перезапустите Redis:
```bash
sudo systemctl restart redis
```

Обновите `backend/.env`:
```env
REDIS_URL=redis://:your_strong_password@localhost:6379
```

### 2. Настройте Firewall

```bash
# Разрешить только необходимые порты
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable

# Проверить статус
sudo ufw status
```

### 3. Настройте MySQL

```sql
-- Создать отдельного пользователя для приложения
CREATE USER 'finio'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON finio_db.* TO 'finio'@'localhost';
FLUSH PRIVILEGES;
```

Обновите `backend/.env`:
```env
DB_USER=finio
DB_PASSWORD=strong_password
```

## 📊 Мониторинг

### 1. Настройте PM2

```bash
# Установить PM2 глобально
npm install -g pm2

# Запустить приложение
pm2 start backend/dist/index.js --name finio-backend
pm2 start backend/dist/bot.js --name finio-bot

# Настроить автозапуск
pm2 startup
pm2 save

# Мониторинг
pm2 monit
```

### 2. Настройте логирование

```bash
# Просмотр логов
pm2 logs finio-backend
pm2 logs finio-bot

# Ротация логов
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 3. Настройте мониторинг Redis

```bash
# Статистика
redis-cli INFO stats

# Мониторинг в реальном времени
redis-cli --stat

# Медленные запросы
redis-cli SLOWLOG GET 10
```

### 4. Настройте мониторинг MySQL

```sql
-- Включить slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow-query.log';

-- Проверить медленные запросы
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;
```

## 🧪 Тестирование

### 1. Проверьте API endpoints

```bash
# Health check
curl http://localhost:5000/api/health

# Авторизация (замените на реальные данные)
curl -X POST http://localhost:5000/api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"initData":"..."}'

# Транзакции (замените TOKEN)
curl http://localhost:5000/api/transactions \
  -H "Authorization: Bearer TOKEN"
```

### 2. Проверьте WebSocket

Откройте DevTools Console на http://localhost:5173:
```javascript
// Проверить подключение
window.socketService?.isConnected()

// Отправить ping
window.socketService?.socket?.emit('ping')
```

### 3. Проверьте Telegram Bot

1. Найдите бота в Telegram
2. Отправьте `/start`
3. Попробуйте `/add 100 тест`
4. Проверьте `/balance`

## 📈 Оптимизация

### 1. Настройте кэширование

Отредактируйте `backend/src/redis.ts` для изменения TTL:
```typescript
// Увеличить TTL для кэша
await cache.set(key, data, 600); // 10 минут вместо 60 секунд
```

### 2. Оптимизируйте MySQL

```sql
-- Проверить использование индексов
EXPLAIN SELECT * FROM transactions WHERE user_id = 1;

-- Анализ таблиц
ANALYZE TABLE transactions;
ANALYZE TABLE categories;
ANALYZE TABLE accounts;

-- Оптимизация таблиц
OPTIMIZE TABLE transactions;
```

### 3. Настройте Node.js

```bash
# Увеличить лимит памяти
NODE_OPTIONS="--max-old-space-size=4096" pm2 start backend/dist/index.js
```

## 📚 Следующие шаги

1. ✅ Прочитайте [документацию улучшений](docs/IMPROVEMENTS.md)
2. ✅ Изучите [примеры использования WebSocket](docs/WEBSOCKET_USAGE.md)
3. ✅ Настройте резервное копирование БД
4. ✅ Настройте мониторинг (Grafana, Prometheus)
5. ✅ Добавьте свои категории и счета
6. ✅ Пригласите пользователей!

## 🎯 Полезные команды

```bash
# Перезапуск всех сервисов
pm2 restart all

# Просмотр логов
pm2 logs --lines 100

# Мониторинг ресурсов
pm2 monit

# Проверка Redis
redis-cli ping

# Проверка MySQL
mysql -u root -p -e "SHOW PROCESSLIST"

# Очистка кэша Redis
redis-cli FLUSHDB

# Резервная копия БД
mysqldump -u root -p finio_db > backup_$(date +%Y%m%d).sql
```

## 💬 Поддержка

Если возникли проблемы:

1. Проверьте логи: `pm2 logs`
2. Проверьте сервисы: `redis-cli ping`, `mysql -u root -p -e "SELECT 1"`
3. Проверьте документацию: [docs/](docs/)
4. Создайте issue: https://github.com/Franklin15097/Finio/issues
5. Напишите: support@studiofinance.ru

## 🎉 Готово!

Теперь ваш Finio полностью настроен и готов к использованию!

Наслаждайтесь улучшенной производительностью и real-time синхронизацией! 🚀
