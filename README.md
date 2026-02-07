# 💎 Finio - Умный контроль финансов

Современное финансовое приложение с веб-версией и Telegram Mini App для учета личных финансов.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Особенности

- 💰 **Учет доходов и расходов** - полный контроль над финансами
- 📊 **Аналитика и графики** - визуализация трат и доходов
- 💳 **Управление счетами** - несколько карт и счетов
- 🎯 **Категории** - гибкая система категоризации
- 📱 **Telegram Mini App** - доступ из мессенджера
- 🌐 **Веб-версия** - полноценный сайт
- 🎨 **Современный дизайн** - темная тема с градиентами

## 🚀 Быстрый старт

### Установка зависимостей

```bash
# Backend
cd server && npm install

# Website
cd ../website-frontend && npm install

# Mini App
cd ../mini-app-frontend && npm install
```

### Настройка

Создайте `.env` в папке `server`:

```env
PORT=3000
BOT_TOKEN=your_telegram_bot_token
JWT_SECRET=your_secret_key_change_this
```

### Запуск

```bash
# Backend
cd server && npm run dev

# Website (новый терминал)
cd website-frontend && npm run dev

# Mini App (новый терминал)
cd mini-app-frontend && npm run dev
```

📖 **Подробная инструкция**: [INSTALL.md](INSTALL.md)

## 🛠 Технологии

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite
- **Bot**: Telegraf
- **Auth**: JWT
- **Styling**: Custom CSS

## 📁 Структура проекта

```
finio/
├── server/              # Backend API
│   ├── api/            # API endpoints
│   ├── db/             # Database
│   ├── bot/            # Telegram bot
│   └── middleware/     # Auth middleware
├── website-frontend/    # Веб-версия
│   └── src/
├── mini-app-frontend/   # Telegram Mini App
│   └── src/
└── README.md
```

## 🎯 API

### Основные endpoints

```
POST   /api/transactions      # Создать транзакцию
GET    /api/transactions      # Получить транзакции
PUT    /api/transactions/:id  # Обновить
DELETE /api/transactions/:id  # Удалить

GET    /api/categories        # Категории
GET    /api/assets            # Счета
GET    /api/statistics/dashboard  # Статистика
```

## 🎨 Дизайн

Современная темная тема с акцентом на удобство:

- **Цвета**: Градиенты от #00D9A3 до #00F5B8
- **Шрифт**: Plus Jakarta Sans
- **Анимации**: Плавные переходы
- **Адаптив**: Оптимизировано для всех устройств

## 📱 Telegram Bot

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен
3. Добавьте в `.env`
4. Настройте Web App URL

## 🚀 Деплой

### Backend (Railway/Heroku)
```bash
git push heroku main
```

### Frontend (Vercel/Netlify)
```bash
npm run build
vercel deploy
```

## 🤝 Вклад

Приветствуются Pull Requests! Для больших изменений сначала откройте Issue.

## 📄 Лицензия

MIT © 2026

## 💬 Контакты

Вопросы? Создайте [Issue](../../issues)

---

Сделано с ❤️ для управления личными финансами
