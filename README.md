# 💎 Finio - Финансовый трекер

Современное приложение для учета личных финансов с веб-версией и Telegram Mini App.

## 🌟 Особенности

- 📊 **Красивый дашборд** с аналитикой и графиками
- 💰 **Управление транзакциями** (доходы/расходы)
- 💳 **Управление счетами** и накоплениями
- 📱 **Telegram Mini App** для мобильного использования
- 🎨 **Современный дизайн** с темной темой
- 📈 **Визуализация данных** с Chart.js
- 🔐 **Авторизация** и безопасность

## 🚀 Быстрый запуск на хостинге

```bash
git clone https://github.com/Franklin15097/Finio.git
cd Finio
chmod +x deploy.sh
./deploy.sh
```

## ⚙️ Настройка

1. Создайте бота в [@BotFather](https://t.me/BotFather)
2. Отредактируйте `server/.env`:

```env
PORT=3000
BOT_TOKEN=your_telegram_bot_token
JWT_SECRET=your_secret_key
NODE_ENV=production
```

3. Перезапустите приложение:
```bash
./restart.sh
```

## 🏃 Разработка

### Локальный запуск

**Windows:**
```bash
start-dev.bat
```

**Linux/Mac:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Ручной запуск

Откройте 3 терминала:

```bash
# Терминал 1 - API сервер
cd server && npm run dev

# Терминал 2 - Веб-сайт
cd website-frontend && npm run dev

# Терминал 3 - Mini App
cd mini-app-frontend && npm run dev
```

## 📱 Доступ

- **Веб-сайт:** http://localhost:5173 (разработка) / http://your-domain.com (продакшн)
- **Mini App:** http://localhost:5174 (разработка) / http://your-domain.com/mini-app (продакшн)
- **API:** http://localhost:3000

## 🛠 Управление на сервере

```bash
# Деплой/обновление
./deploy.sh

# Перезапуск
./restart.sh

# Остановка
./stop.sh

# Просмотр логов
tail -f app.log

# Статус
ps aux | grep node
```

## 📁 Структура проекта

```
Finio/
├── server/                 # Node.js API сервер
│   ├── api/               # API роуты
│   ├── bot/               # Telegram бот
│   ├── db/                # База данных
│   └── index.js           # Точка входа
├── website-frontend/       # React веб-приложение
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   └── styles/        # CSS стили
│   └── dist/              # Собранные файлы
├── mini-app-frontend/      # Telegram Mini App
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   └── styles/        # CSS стили
│   └── dist/              # Собранные файлы
└── старый сайт/           # Исходные файлы дизайна
```

## 🛠 Технологии

### Backend
- **Node.js** + Express
- **SQLite** база данных
- **Telegraf** для Telegram бота
- **JWT** авторизация

### Frontend
- **React** + Vite
- **Chart.js** для графиков
- **CSS Variables** для темизации
- **Plus Jakarta Sans** шрифт

### Дизайн
- 🎨 **Темная тема** с градиентами
- 💎 **Современный UI/UX**
- 📱 **Адаптивная верстка**
- ✨ **Анимации и переходы**

## 🔧 API Endpoints

```
GET  /api/statistics/dashboard    # Статистика дашборда
GET  /api/transactions           # Список транзакций
POST /api/transactions           # Создание транзакции
PUT  /api/transactions/:id       # Обновление транзакции
DELETE /api/transactions/:id     # Удаление транзакции
GET  /api/categories            # Категории
POST /api/categories            # Создание категории
GET  /api/assets               # Счета пользователя
POST /api/assets               # Создание счета
```

## 🤖 Telegram Mini App

1. Настройте бота с помощью [@BotFather](https://t.me/BotFather)
2. Добавьте Mini App URL: `https://your-domain.com/mini-app`
3. Установите команды бота:
   ```
   start - Запуск приложения
   app - Открыть Mini App
   help - Помощь
   ```

## 📝 Лицензия

MIT License - используйте свободно для личных и коммерческих проектов.

## 🤝 Поддержка

- 🐛 **Баги:** [GitHub Issues](https://github.com/Franklin15097/Finio/issues)
- 💡 **Идеи:** [GitHub Discussions](https://github.com/Franklin15097/Finio/discussions)
- 📧 **Email:** support@finio.app

---

**Сделано с ❤️ для управления личными финансами**
