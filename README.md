# Finio - Finance Studio

Современное веб-приложение для управления личными финансами с интеграцией Telegram Mini App.

## 🚀 Особенности

- 💰 Учет доходов и расходов
- 📊 Визуализация финансовых данных
- 🏦 Управление счетами
- 📱 Telegram Mini App с отдельным мобильным дизайном
- 🌐 Полнофункциональная веб-версия
- 🔐 Авторизация через Telegram

## 🎨 Два дизайна в одном приложении

### Веб-версия (Desktop)
- Боковое меню навигации
- Темная фиолетовая тема с градиентами
- Анимированный фон
- Полноэкранные графики и аналитика

### Telegram Mini App (Mobile)
- Нижняя навигация (5 разделов)
- Светлая тема с цветными градиентами
- Компактные карточки
- Оптимизация для мобильных устройств
- Автоматическая адаптация к теме Telegram

## 🛠 Технологии

### Frontend
- React 18 + TypeScript
- Vite
- React Router
- Tailwind CSS
- Recharts (графики)
- Lucide React (иконки)

### Backend
- Node.js + Express
- TypeScript
- MySQL
- JWT авторизация
- Telegram Bot API

## 📦 Установка

### Требования
- Node.js 18+
- MySQL 8+
- PM2 (для продакшена)

### Локальная разработка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd finio
```

2. Установите зависимости:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Настройте переменные окружения:
```bash
# backend/.env
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=financial_db
JWT_SECRET=your_jwt_secret
TELEGRAM_BOT_TOKEN=your_bot_token
FRONTEND_URL=http://localhost:5173
```

4. Создайте базу данных:
```bash
mysql -u root -p < backend/database/schema.sql
mysql -u root -p < backend/database/telegram_migration.sql
```

5. Запустите приложение:
```bash
# Backend (в одном терминале)
cd backend
npm run dev

# Frontend (в другом терминале)
cd frontend
npm run dev
```

## 🚀 Развертывание

### Автоматическое развертывание

```bash
./update_telegram.sh
```

### Ручное развертывание

```bash
# На сервере
cd /var/www/finio
git pull

# Backend
cd backend
npm install
pm2 restart finio-api
pm2 restart finio-bot

# Frontend
cd ../frontend
npm install
npm run build
```

## 🤖 Telegram Bot

### Настройка бота

1. Создайте бота через @BotFather
2. Получите токен
3. Настройте Mini App:
   - Команда: `/newapp`
   - URL: `https://studiofinance.ru`
   - Название: `Finio`

### Команды бота

- `/start` - Приветствие и кнопки
- `/app` - Открыть Mini App
- `/site` - Получить ссылку с токеном авторизации
- `/help` - Помощь
- `/about` - О приложении

## 📱 Использование

### Веб-версия
Откройте в браузере: `https://studiofinance.ru`

### Telegram Mini App
1. Найдите бота: `@FinanceStudio_bot`
2. Нажмите `/start`
3. Выберите "📱 Открыть Mini App"

## 🏗 Архитектура

### Условный рендеринг

Приложение автоматически определяет платформу и показывает соответствующий дизайн:

```typescript
// В каждой странице
if (isTelegramWebApp()) {
  return <TelegramVersion />;
}
return <WebVersion />;
```

### Структура проекта

```
finio/
├── backend/
│   ├── src/
│   │   ├── bot.ts              # Telegram бот
│   │   ├── index.ts            # Express сервер
│   │   ├── routes/             # API маршруты
│   │   └── middleware/         # Middleware
│   └── database/               # SQL схемы
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx           # Веб layout
│   │   │   └── TelegramLayout.tsx   # Telegram layout
│   │   ├── pages/
│   │   │   ├── Balance.tsx          # Веб-версия
│   │   │   ├── Income.tsx
│   │   │   ├── Expenses.tsx
│   │   │   ├── Accounts.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── telegram/            # Telegram-версии
│   │   │       ├── TelegramBalance.tsx
│   │   │       ├── TelegramIncome.tsx
│   │   │       ├── TelegramExpenses.tsx
│   │   │       ├── TelegramAccounts.tsx
│   │   │       └── TelegramSettings.tsx
│   │   └── utils/
│   │       └── telegram.ts          # Telegram утилиты
│   └── public/
└── README.md
```

## 🎨 Дизайн-система

### Цвета (Telegram)
- 🔵 Главная: `#3390ec` (Telegram Blue)
- 🟢 Доходы: `green-500` to `emerald-600`
- 🔴 Расходы: `red-500` to `pink-600`
- 🟣 Счета: `purple-500` to `fuchsia-600`

### Цвета (Web)
- 🟣 Основной: `purple-900` to `slate-900`
- Градиенты с прозрачностью `/90`, `/80`, `/20`
- Анимированные фиолетовые шарики на фоне

## 🔧 API Endpoints

### Авторизация
- `POST /api/auth/telegram` - Авторизация через Telegram Mini App
- `POST /api/auth/generate-auth-token` - Генерация токена для бота
- `POST /api/auth/exchange-token` - Обмен токена на JWT

### Транзакции
- `GET /api/transactions` - Получить все транзакции
- `POST /api/transactions` - Создать транзакцию
- `PUT /api/transactions/:id` - Обновить транзакцию
- `DELETE /api/transactions/:id` - Удалить транзакцию

### Счета
- `GET /api/accounts` - Получить все счета
- `POST /api/accounts` - Создать счет
- `PUT /api/accounts/:id` - Обновить счет
- `DELETE /api/accounts/:id` - Удалить счет

### Категории
- `GET /api/categories` - Получить все категории
- `POST /api/categories` - Создать категорию
- `PUT /api/categories/:id` - Обновить категорию
- `DELETE /api/categories/:id` - Удалить категорию

### Статистика
- `GET /api/dashboard/stats` - Получить статистику

## 🐛 Отладка

### Логи PM2
```bash
pm2 logs finio-api
pm2 logs finio-bot
```

### Логи Nginx
```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Консоль браузера
Откройте DevTools (F12) и проверьте:
- Console - ошибки JavaScript
- Network - API запросы
- Application - LocalStorage, Cookies

## 📝 Конфигурация

### Сервер
- IP: `85.235.205.99`
- Domain: `studiofinance.ru`
- SSL: Let's Encrypt (автообновление)

### База данных
- MySQL 8.0
- Database: `financial_db`
- User: `app_user`

### PM2
- `finio-api` - Backend API (порт 3000)
- `finio-bot` - Telegram Bot

## 🤝 Вклад

1. Fork репозиторий
2. Создайте ветку: `git checkout -b feature/amazing-feature`
3. Commit изменения: `git commit -m 'Add amazing feature'`
4. Push в ветку: `git push origin feature/amazing-feature`
5. Откройте Pull Request

## 📄 Лицензия

Proprietary - Все права защищены

## 👥 Контакты

- Telegram Bot: [@FinanceStudio_bot](https://t.me/FinanceStudio_bot)
- Website: [studiofinance.ru](https://studiofinance.ru)

---

**Версия**: 2.0.0  
**Дата обновления**: 15 февраля 2026  
**Статус**: ✅ Production Ready
