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

## 🚀 Установка (Docker - Рекомендуется)

**Одна команда для установки с Docker:**

```bash
curl -fsSL https://raw.githubusercontent.com/Franklin15097/Finio/main/install-docker.sh | sudo bash
```

### Преимущества Docker установки:
- ✅ Изолированная среда
- ✅ Автоматические обновления без даунтайма
- ✅ Легкий откат к предыдущей версии
- ✅ Не конфликтует с другими приложениями
- ✅ PostgreSQL в контейнере

## 🔄 Обновление

```bash
cd /opt/Finio && ./deploy.sh
```

## 📊 Управление

```bash
# Статус
docker-compose ps

# Логи
docker-compose logs -f app

# Перезапуск
docker-compose restart app

# Остановка
docker-compose down

# Запуск
docker-compose up -d
```

## 🚀 Установка на хостинге (старый способ)

**Одна команда для полной установки:**

```bash
git clone https://github.com/Franklin15097/Finio.git && cd Finio && chmod +x install.sh && ./install.sh
```

## ⚙️ Настройка

После установки отредактируйте `server/.env`:

```env
PORT=3000
BOT_TOKEN=your_telegram_bot_token
JWT_SECRET=your_secret_key
NODE_ENV=production
```

Затем перезапустите:
```bash
./install.sh
```

## 🏃 Разработка

Для разработки откройте 3 терминала:

```bash
# Терминал 1 - API сервер
cd server && npm run dev

# Терминал 2 - Веб-сайт
cd website-frontend && npm run dev

# Терминал 3 - Mini App
cd mini-app-frontend && npm run dev
```

## 📱 Доступ

- **Веб-сайт:** http://localhost:3000
- **Mini App:** http://localhost:3000/mini-app
- **API:** http://localhost:3000/api

## 🛠 Управление

```bash
# Остановка
kill $(cat app.pid)

# Просмотр логов
tail -f app.log

# Проверка статуса
ps -p $(cat app.pid)

# Переустановка
./install.sh
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
