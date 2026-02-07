# 🚀 Установка и запуск Finio

## Быстрый старт

### 1. Клонирование репозитория
```bash
git clone <your-repo-url>
cd finio
```

### 2. Установка зависимостей

#### Backend
```bash
cd server
npm install
```

#### Website Frontend
```bash
cd ../website-frontend
npm install
```

#### Mini App Frontend
```bash
cd ../mini-app-frontend
npm install
```

### 3. Настройка окружения

Создайте файл `.env` в папке `server`:

```env
PORT=3000
BOT_TOKEN=your_telegram_bot_token_here
JWT_SECRET=your_super_secret_key_change_this
NODE_ENV=production
```

### 4. Запуск

#### Разработка (Development)

Откройте 3 терминала:

**Терминал 1 - Backend:**
```bash
cd server
npm run dev
```

**Терминал 2 - Website:**
```bash
cd website-frontend
npm run dev
```

**Терминал 3 - Mini App:**
```bash
cd mini-app-frontend
npm run dev
```

#### Продакшн (Production)

**Backend:**
```bash
cd server
npm start
```

**Frontend (сборка):**
```bash
cd website-frontend
npm run build

cd ../mini-app-frontend
npm run build
```

## 📦 Зависимости

### Backend (server/)
- express - веб-фреймворк
- cors - CORS middleware
- dotenv - переменные окружения
- telegraf - Telegram Bot API
- sqlite3 - база данных
- sqlite - SQLite wrapper
- jsonwebtoken - JWT аутентификация

### Frontend (website-frontend/ и mini-app-frontend/)
- react - UI библиотека
- vite - сборщик

## 🔧 Команды

### Server
```bash
npm run dev    # Запуск с hot-reload
npm start      # Запуск продакшн
```

### Frontend
```bash
npm run dev    # Запуск dev сервера
npm run build  # Сборка для продакшн
npm run preview # Просмотр продакшн сборки
```

## 🌐 Порты

- Backend: `http://localhost:3000`
- Website: `http://localhost:5173`
- Mini App: `http://localhost:5174`

## 🐛 Решение проблем

### Ошибка "Cannot find module"
```bash
# Переустановите зависимости
rm -rf node_modules package-lock.json
npm install
```

### Ошибка порта занят
```bash
# Измените PORT в .env файле
PORT=3001
```

### База данных не создается
```bash
# Убедитесь что папка server/db существует
cd server
mkdir db
```

## 📱 Настройка Telegram Bot

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен
3. Добавьте токен в `.env` файл
4. Настройте Web App URL в BotFather:
   ```
   /newapp
   /setmenubutton
   ```

## 🚀 Деплой

### Heroku
```bash
heroku create your-app-name
git push heroku main
heroku config:set BOT_TOKEN=your_token
heroku config:set JWT_SECRET=your_secret
```

### Vercel (Frontend)
```bash
cd website-frontend
vercel
```

### Railway (Backend)
```bash
railway login
railway init
railway up
```

## 📝 Примечания

- SQLite база создается автоматически при первом запуске
- JWT токены действительны 30 дней
- Для продакшн обязательно измените JWT_SECRET
