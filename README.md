# Studio Finance Mini App

Минимальный сайт с frontend и backend + Telegram бот с Mini App.

## Стек

- **Backend:** Node.js + Express
- **Bot:** Telegraf (библиотека для Telegram ботов)
- **Mini App:** Node.js + Telegram Mini Apps SDK
- **Frontend:** Vanilla JS (для мини-аппа и сайта)
- **Database:** PostgreSQL

## Установка

```bash
npm install
```

## Запуск

### Backend сервер:
```bash
npm start
```

### Telegram бот:
```bash
npm run bot
```

### Development режим:
```bash
npm run dev        # сервер с автоперезагрузкой
npm run dev:bot    # бот с автоперезагрузкой
```

## Конфигурация

Все настройки в файле `.env`:
- `BOT_TOKEN` - токен Telegram бота
- `WEBAPP_URL` - URL веб-приложения
- `DB_*` - настройки базы данных PostgreSQL

## Структура

- `server.js` - Express сервер (backend)
- `bot.js` - Telegram бот на Telegraf
- `public/` - Frontend файлы
  - `index.html` - главная страница
  - `style.css` - стили
  - `app.js` - JavaScript для Mini App

## База данных

PostgreSQL:
- База: finio
- Пользователь: finio_user
- Пароль: maks15097
