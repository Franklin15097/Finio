# ⚡ Быстрый старт Finio v2.0

Запустите Finio за 5 минут!

## 📋 Требования

- ✅ Node.js 18+
- ✅ MySQL 8.0+
- ✅ Redis 6+

## 🚀 Установка

### 1. Клонируйте репозиторий

```bash
git clone https://github.com/Franklin15097/Finio.git
cd Finio
```

### 2. Установите Redis

**macOS:**
```bash
brew install redis && brew services start redis
```

**Ubuntu:**
```bash
sudo apt install redis-server && sudo systemctl start redis
```

**Docker:**
```bash
docker run -d -p 6379:6379 redis:alpine
```

### 3. Настройте БД

```bash
# Создать БД
mysql -u root -p -e "CREATE DATABASE finio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Применить схему
mysql -u root -p finio_db < backend/database/schema_improved.sql
```

### 4. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Отредактируйте `.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=finio_db
JWT_SECRET=your_secret_key
TELEGRAM_BOT_TOKEN=your_bot_token
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

```bash
npm run build
```

### 5. Frontend

```bash
cd ../frontend
npm install
echo "VITE_API_URL=http://localhost:5000" > .env
```

### 6. Запуск

**Development:**
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Bot (опционально)
cd backend && npm run bot
```

**Production:**
```bash
cd backend && npm start
# Frontend: разверните dist/ на веб-сервере
```

## ✅ Проверка

1. **Backend:** http://localhost:5000/api/health
2. **Frontend:** http://localhost:5173
3. **Redis:** `redis-cli ping` → PONG

## 🎉 Готово!

Откройте http://localhost:5173 и начните использовать Finio!

## 📚 Дополнительно

- [Полная установка](INSTALLATION.md)
- [Миграция с v1.0](MIGRATION_GUIDE.md)
- [Документация улучшений](docs/IMPROVEMENTS.md)
- [Использование WebSocket](docs/WEBSOCKET_USAGE.md)

## 🐛 Проблемы?

```bash
# Проверить Redis
redis-cli ping

# Проверить MySQL
mysql -u root -p -e "SELECT 1"

# Проверить логи
pm2 logs  # production
# или смотрите консоль в development
```

## 💬 Поддержка

- GitHub Issues: https://github.com/Franklin15097/Finio/issues
- Email: support@studiofinance.ru
- Telegram: @FinanceStudio_bot
