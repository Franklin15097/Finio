# Studio Finance Project

Проект включает:
- Backend сервер (Node.js + Express)
- Telegram бот с Mini App
- Frontend для сайта (React)
- Frontend для Mini App (React)

## Структура проекта

```
├── server/                 # Backend
│   ├── bot/               # Telegram бот
│   ├── mini-app/          # API для mini app
│   ├── website/           # API для сайта
│   └── shared/            # Общая логика (БД)
├── mini-app-frontend/     # React для mini app
├── website-frontend/      # React для сайта
```

## Установка

```bash
# Установка зависимостей для всех проектов
cd server && npm install
cd ../mini-app-frontend && npm install
cd ../website-frontend && npm install
```

## Запуск

```bash
# Backend + Bot
cd server && npm run dev

# Mini App Frontend
cd mini-app-frontend && npm run dev

# Website Frontend
cd website-frontend && npm run dev
```

## Конфигурация

Настройки в `server/.env`:
- BOT_TOKEN - токен Telegram бота
- MINI_APP_URL - URL mini app
- DB_* - настройки PostgreSQL

## Telegram Bot

Команды:
- /start - Приветствие и кнопка для открытия Mini App
- /app - Открыть Mini App
