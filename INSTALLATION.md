# 🚀 Установка и настройка Finio

## Быстрый старт

### 1. Установка зависимостей

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Установка Redis

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

**Docker:**
```bash
docker run -d --name redis -p 6379:6379 redis:alpine
```

**Проверка:**
```bash
redis-cli ping
# Должно вернуть: PONG
```

### 3. Настройка базы данных

```bash
# Создать БД
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS finio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Применить улучшенную схему с индексами
mysql -u root -p finio_db < backend/database/schema_improved.sql
```

### 4. Настройка переменных окружения

**Backend (.env):**
```bash
cd backend
cp .env.example .env
```

Отредактируйте `.env`:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=finio_db
JWT_SECRET=your-secret-key-change-in-production
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
REDIS_URL=redis://localhost:6379
```

**Frontend (.env):**
```bash
cd frontend
echo "VITE_API_URL=http://localhost:5000" > .env
```

### 5. Запуск

**Development:**
```bash
# Terminal 1: Redis (если не запущен как сервис)
redis-server

# Terminal 2: Backend
cd backend
npm run dev

# Terminal 3: Telegram Bot
cd backend
npm run bot

# Terminal 4: Frontend
cd frontend
npm run dev
```

**Production:**
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Разверните dist/ на веб-сервере
```

### 6. Проверка

Откройте браузер:
- Frontend: http://localhost:5173
- Backend Health: http://localhost:5000/api/health

Должен вернуться:
```json
{
  "status": "ok",
  "timestamp": "2024-02-16T10:00:00.000Z",
  "websocket": "enabled",
  "redis": "configured"
}
```

## 🔧 Настройка Telegram Bot

1. Создайте бота через [@BotFather](https://t.me/botfather)
2. Получите токен
3. Добавьте токен в `backend/.env`:
   ```env
   TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```
4. Настройте команды бота:
   ```bash
   /setcommands
   
   start - 🚀 Начать работу с Finio
   add - 💰 Добавить транзакцию
   balance - 💳 Посмотреть баланс
   app - 📱 Открыть приложение
   site - 🌐 Открыть сайт
   help - 📖 Помощь и информация
   about - ℹ️ О приложении
   ```

## 📦 Структура проекта

```
finio/
├── backend/
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth, validation, rate limiting
│   │   ├── validators/      # Zod schemas
│   │   ├── socket.ts        # WebSocket server
│   │   ├── redis.ts         # Redis client
│   │   ├── db.ts            # MySQL connection
│   │   ├── bot.ts           # Telegram bot
│   │   └── index.ts         # Express app
│   ├── database/
│   │   └── schema_improved.sql  # БД с индексами
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/           # React pages
│   │   ├── components/      # React components
│   │   ├── services/        # API & WebSocket
│   │   ├── hooks/           # Custom hooks
│   │   └── context/         # React context
│   └── package.json
└── docs/
    ├── IMPROVEMENTS.md      # Документация улучшений
    └── API.md              # API документация
```

## 🔐 Безопасность

### Production настройки

1. **Измените JWT_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

2. **Настройте CORS:**
   ```typescript
   // backend/src/index.ts
   app.use(cors({
     origin: 'https://yourdomain.com',
     credentials: true
   }));
   ```

3. **Используйте HTTPS:**
   - Настройте SSL сертификат (Let's Encrypt)
   - Обновите FRONTEND_URL и BACKEND_URL

4. **Защитите Redis:**
   ```bash
   # redis.conf
   requirepass your_redis_password
   bind 127.0.0.1
   ```

5. **Firewall:**
   ```bash
   # Разрешить только необходимые порты
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

## 🐛 Troubleshooting

### Redis не запускается
```bash
# Проверить статус
redis-cli ping

# Перезапустить
brew services restart redis  # macOS
sudo systemctl restart redis # Linux
```

### MySQL ошибки подключения
```bash
# Проверить статус
mysql -u root -p -e "SELECT 1"

# Проверить права
mysql -u root -p -e "SHOW GRANTS FOR 'root'@'localhost'"
```

### WebSocket не подключается
1. Проверьте CORS настройки
2. Проверьте firewall
3. Проверьте токен в localStorage
4. Откройте DevTools → Network → WS

### Медленные запросы
```sql
-- Проверить индексы
SHOW INDEX FROM transactions;

-- Анализ запроса
EXPLAIN SELECT * FROM transactions WHERE user_id = 1;
```

## 📊 Мониторинг

### Логи
```bash
# Backend логи
tail -f backend/logs/app.log

# Redis логи
tail -f /var/log/redis/redis-server.log

# MySQL логи
tail -f /var/log/mysql/error.log
```

### Метрики
```bash
# Redis статистика
redis-cli INFO stats

# MySQL статистика
mysql -u root -p -e "SHOW STATUS LIKE 'Threads_connected'"
```

## 🚀 Deployment

### Docker Compose (рекомендуется)
```yaml
version: '3.8'
services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
  
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: finio_db
    ports:
      - "3306:3306"
  
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - redis
      - mysql
    environment:
      REDIS_URL: redis://redis:6379
      DB_HOST: mysql
```

```bash
docker-compose up -d
```

## 📚 Дополнительно

- [Документация улучшений](docs/IMPROVEMENTS.md)
- [API документация](docs/API.md)
- [Deployment guide](docs/DEPLOYMENT.md)

## 💬 Поддержка

Если возникли проблемы:
1. Проверьте логи
2. Проверьте переменные окружения
3. Создайте issue в репозитории
