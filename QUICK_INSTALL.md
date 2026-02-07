# ⚡ Быстрая установка зависимостей

## Для Windows

### Вариант 1: Автоматическая установка (PowerShell)

Скопируйте и вставьте в PowerShell:

```powershell
# Backend
cd server
npm install
cd ..

# Website
cd website-frontend
npm install
cd ..

# Mini App
cd mini-app-frontend
npm install
cd ..

Write-Host "✓ Все зависимости установлены!" -ForegroundColor Green
```

### Вариант 2: Ручная установка

Откройте 3 терминала и выполните:

**Терминал 1:**
```bash
cd server
npm install
```

**Терминал 2:**
```bash
cd website-frontend
npm install
```

**Терминал 3:**
```bash
cd mini-app-frontend
npm install
```

## Для Linux/Mac

```bash
# Установка всех зависимостей одной командой
(cd server && npm install) && \
(cd website-frontend && npm install) && \
(cd mini-app-frontend && npm install) && \
echo "✓ Все зависимости установлены!"
```

## 🔧 Настройка

Создайте файл `server/.env`:

```env
PORT=3000
BOT_TOKEN=your_bot_token_here
JWT_SECRET=change_this_secret_key
```

## 🚀 Запуск

### Windows (3 терминала)

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

### Linux/Mac (один терминал)

```bash
# Установите tmux или screen для фоновых процессов
npm run dev --prefix server &
npm run dev --prefix website-frontend &
npm run dev --prefix mini-app-frontend &
```

## ✅ Проверка

После запуска откройте:

- Backend: http://localhost:3000/health
- Website: http://localhost:5173
- Mini App: http://localhost:5174

## 🐛 Если что-то не работает

### Ошибка "npm not found"
Установите Node.js: https://nodejs.org/

### Ошибка "Cannot find module"
```bash
# Удалите node_modules и переустановите
rm -rf node_modules package-lock.json
npm install
```

### Порт занят
Измените PORT в `.env` или убейте процесс:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

## 📦 Список зависимостей

### Backend (server/)
- express
- cors
- dotenv
- telegraf
- sqlite3
- sqlite
- jsonwebtoken

### Frontend (оба)
- react
- react-dom
- vite

Все зависимости установятся автоматически при `npm install`.
