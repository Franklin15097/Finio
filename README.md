# 💎 Finio - Финансовый трекер

Современное приложение для учета личных финансов с веб-версией и Telegram Mini App.

## 🚀 Установка на хостинге

```bash
git clone https://github.com/Franklin15097/Finio.git && cd Finio && chmod +x install.sh && ./install.sh
```

## ⚙️ Настройка

Создайте `server/.env`:

```env
PORT=3000
BOT_TOKEN=your_telegram_bot_token
JWT_SECRET=your_secret_key
```

## 🏃 Запуск

Откройте 3 терминала:

```bash
# Терминал 1
cd server && npm run dev

# Терминал 2
cd website-frontend && npm run dev

# Терминал 3
cd mini-app-frontend && npm run dev
```

## 📱 Доступ

- Backend: http://localhost:3000
- Website: http://localhost:5173
- Mini App: http://localhost:5174

## 🛠 Технологии

React + Node.js + Express + SQLite + Telegraf
