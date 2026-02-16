# 💰 Finio - Личный Финансовый Помощник

Современное веб-приложение и Telegram Mini App для управления личными финансами с аналитикой, прогнозированием и **real-time синхронизацией**.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-production-success)

## ✨ Новое в версии 2.0

### 🔄 Real-time синхронизация
- **WebSocket** - мгновенная синхронизация между веб-сайтом и Telegram
- Данные обновляются автоматически без перезагрузки страницы
- Уведомления о новых транзакциях в реальном времени

### 🚀 Производительность
- **Redis кэширование** - ускорение запросов в 10-20 раз
- **Индексы БД** - оптимизация запросов (200ms → 10-50ms)
- Кэширование часто запрашиваемых данных

### 🔐 Безопасность
- **Rate limiting** - защита от DDoS и brute-force атак
- **Zod валидация** - строгая проверка всех входных данных
- Надежное хранение токенов в Redis

### 📊 Улучшенная архитектура
- Модульная структура с валидаторами
- Глобальная обработка ошибок
- Улучшенное логирование

> 📖 **Подробнее об улучшениях:** [docs/IMPROVEMENTS.md](docs/IMPROVEMENTS.md)

## 🌟 Возможности

### 💳 Управление финансами
- Учёт доходов и расходов
- Множественные счета и карты
- Категории с иконками и цветами
- Быстрое добавление транзакций

### 📊 Аналитика и отчёты
- Интерактивные графики и диаграммы
- Тепловая карта расходов по дням и часам
- Сравнение периодов с процентными изменениями
- AI-прогнозирование баланса на 30 дней
- Экспорт данных в CSV, Excel, PDF

### 🤖 Telegram Bot
- Команда `/add` - быстрое добавление транзакций
- Команда `/balance` - просмотр баланса
- Инлайн-кнопки для интерактивного взаимодействия
- Интеграция с Mini App

### 🎨 UI/UX
- Адаптивный дизайн для всех устройств
- Тёмная тема с градиентами
- Круговые индикаторы финансового здоровья
- Плавные анимации и переходы
- Sparkline графики трендов

## 🚀 Быстрый старт

> 📖 **Полная инструкция:** [INSTALLATION.md](INSTALLATION.md)

### Требования
- Node.js 18+
- MySQL 8.0+
- **Redis 6+** (новое!)
- PM2 (для production)
- Telegram Bot Token (для бота)

### Установка

1. **Клонируйте репозиторий**
```bash
git clone https://github.com/Franklin15097/Finio.git
cd Finio
```

2. **Установите Redis**
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt install redis-server
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:alpine
```

3. **Настройте Backend**
```bash
cd backend
npm install
cp .env.example .env
# Отредактируйте .env файл (добавьте REDIS_URL)
npm run build
```

4. **Настройте Frontend**
```bash
cd frontend
npm install
npm run build
```

5. **Настройте базу данных**
```bash
# Используйте улучшенную схему с индексами
mysql -u root -p < backend/database/schema_improved.sql
```

6. **Запустите приложение**

Development:
```bash
# Terminal 1: Redis (если не запущен как сервис)
redis-server

# Terminal 2: Backend
cd backend
npm run dev

# Terminal 3: Frontend
cd frontend
npm run dev

# Terminal 4: Bot
cd backend
npm run bot
```

Production:
```bash
pm2 start backend/dist/index.js --name finio-backend
pm2 start backend/dist/bot.js --name finio-bot
```

## 📁 Структура проекта

```
Finio/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Middleware (auth, validation, rate limiting)
│   │   ├── validators/     # Zod validation schemas (новое!)
│   │   ├── socket.ts       # WebSocket server (новое!)
│   │   ├── redis.ts        # Redis client (новое!)
│   │   ├── bot.ts          # Telegram bot
│   │   ├── db.ts           # Database connection
│   │   └── index.ts        # Main server file
│   ├── database/           # SQL schemas
│   │   ├── schema.sql      # Базовая схема
│   │   └── schema_improved.sql  # Улучшенная схема с индексами (новое!)
│   └── package.json
│
├── frontend/               # Frontend React App
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   │   └── telegram/   # Telegram Mini App pages
│   │   ├── context/        # React contexts
│   │   ├── services/       # API services
│   │   │   ├── api.ts      # REST API
│   │   │   └── socket.ts   # WebSocket client (новое!)
│   │   ├── hooks/          # Custom hooks
│   │   │   └── useRealtimeSync.ts  # Real-time sync hook (новое!)
│   │   └── utils/          # Utilities
│   └── package.json
│
├── docs/                   # Documentation
│   ├── IMPROVEMENTS.md     # Документация улучшений (новое!)
│   ├── API.md             # API документация
│   └── DEPLOYMENT.md      # Deployment guide
│
├── scripts/                # Deployment scripts
│   └── deploy.sh          # Main deployment script
│
├── INSTALLATION.md        # Инструкция по установке (новое!)
└── README.md              # This file
```

## 🔧 Конфигурация

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=financial_db

# JWT
JWT_SECRET=your_secret_key

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token

# URLs
BACKEND_URL=https://api.studiofinance.ru
FRONTEND_URL=https://studiofinance.ru

# Redis (новое!)
REDIS_URL=redis://localhost:6379
```

### Frontend (.env)
```env
VITE_API_URL=https://api.studiofinance.ru
```

## 🚢 Деплой

### Автоматический деплой

Используйте единый скрипт деплоя:

```bash
# Полный деплой (frontend + backend + bot)
./scripts/deploy.sh full

# Только frontend
./scripts/deploy.sh frontend

# Только backend
./scripts/deploy.sh backend

# Только bot
./scripts/deploy.sh bot
```

### Ручной деплой

1. **Подключитесь к серверу**
```bash
ssh root@85.235.205.99
cd /var/www/studiofinance
```

2. **Обновите код**
```bash
git pull origin main
```

3. **Соберите frontend**
```bash
cd frontend
npm install
npm run build
cd ..
```

4. **Соберите backend**
```bash
cd backend
npm install
npm run build
cd ..
```

5. **Перезапустите сервисы**
```bash
pm2 restart finio-backend
pm2 restart finio-bot
```

## 📱 Telegram Bot

### Команды

- `/start` - Начать работу с Finio
- `/add [сумма] [описание]` - Добавить транзакцию
  - Пример: `/add 500 продукты`
- `/balance` - Посмотреть баланс
- `/app` - Открыть Mini App
- `/site` - Открыть сайт
- `/help` - Справка
- `/about` - О приложении

### Настройка бота

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен
3. Добавьте токен в `.env` файл
4. Настройте Mini App URL в BotFather
5. Запустите бота: `npm run bot`

## 🔐 Безопасность

- JWT токены для авторизации (срок действия 30 дней)
- HMAC валидация Telegram данных
- Bcrypt для хеширования паролей
- SQL injection защита через prepared statements
- CORS настроен для production домена

## 📊 API Endpoints

### Авторизация
- `POST /api/auth/telegram` - Telegram авторизация
- `POST /api/auth/telegram-widget` - Telegram Widget авторизация
- `GET /api/auth/me` - Получить текущего пользователя

### Транзакции
- `GET /api/transactions` - Список транзакций
- `POST /api/transactions` - Создать транзакцию
- `PUT /api/transactions/:id` - Обновить транзакцию
- `DELETE /api/transactions/:id` - Удалить транзакцию

### Категории
- `GET /api/categories` - Список категорий
- `POST /api/categories` - Создать категорию
- `PUT /api/categories/:id` - Обновить категорию
- `DELETE /api/categories/:id` - Удалить категорию

### Счета
- `GET /api/accounts` - Список счетов
- `POST /api/accounts` - Создать счёт
- `PUT /api/accounts/:id` - Обновить счёт
- `DELETE /api/accounts/:id` - Удалить счёт

### Аналитика
- `GET /api/analytics/categories` - Статистика по категориям
- `GET /api/analytics/heatmap` - Тепловая карта расходов
- `GET /api/analytics/compare-periods` - Сравнение периодов
- `GET /api/analytics/forecast` - Прогноз баланса
- `GET /api/analytics/top-expenses` - Топ расходов
- `GET /api/analytics/trends` - Анализ трендов
- `GET /api/analytics/export/csv` - Экспорт в CSV
- `GET /api/analytics/export/excel` - Экспорт в Excel
- `GET /api/analytics/export/pdf` - Экспорт в PDF

### Dashboard
- `GET /api/dashboard/stats` - Общая статистика

## 🛠️ Технологии

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- Recharts (графики)
- React Router
- Lucide Icons
- **Socket.io Client** (новое!)

### Backend
- Node.js
- Express
- TypeScript
- MySQL2
- JWT
- Bcrypt
- XLSX (Excel export)
- PDFKit (PDF export)
- **Socket.io** (новое!)
- **Redis (ioredis)** (новое!)
- **Zod** (новое!)
- **Express Rate Limit** (новое!)

### Инфраструктура
- PM2 (process manager)
- Nginx (reverse proxy)
- MySQL 8.0
- **Redis 6+** (новое!)
- Ubuntu Server

## 📈 Производительность

### До улучшений (v1.0)
- Frontend bundle: ~758 KB (gzipped: ~194 KB)
- Backend response time: ~200-500ms
- Database queries: без индексов
- Синхронизация: только при перезагрузке

### После улучшений (v2.0)
- Frontend bundle: ~820 KB (gzipped: ~210 KB)
- Backend response time: **~10-50ms** (улучшение в 10-20 раз!)
- Database queries: **оптимизированы с индексами**
- Синхронизация: **real-time (<100ms)**
- Кэширование: **Redis с TTL 60-300 секунд**
- Rate limiting: **защита от DDoS**

## 🐛 Отладка

### Просмотр логов

```bash
# Backend logs
pm2 logs finio-backend

# Bot logs
pm2 logs finio-bot

# Все логи
pm2 logs

# Последние 100 строк
pm2 logs --lines 100
```

### Перезапуск сервисов

```bash
# Перезапустить backend
pm2 restart finio-backend

# Перезапустить bot
pm2 restart finio-bot

# Перезапустить всё
pm2 restart all
```

### Проверка статуса

```bash
pm2 status
pm2 monit
```

## 📝 Разработка

### Запуск в dev режиме

```bash
# Backend с hot reload
cd backend
npm run dev

# Frontend с hot reload
cd frontend
npm run dev

# Bot
cd backend
npm run bot
```

### Сборка

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
```

### Проверка типов

```bash
# Frontend
cd frontend
npx tsc --noEmit

# Backend
cd backend
npx tsc --noEmit
```

## 🤝 Вклад в проект

1. Fork репозиторий
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE)

## 👥 Авторы

- **Franklin** - *Initial work* - [Franklin15097](https://github.com/Franklin15097)

## 🔗 Ссылки

- **Production:** https://studiofinance.ru
- **Telegram Bot:** [@FinanceStudio_bot](https://t.me/FinanceStudio_bot)
- **GitHub:** https://github.com/Franklin15097/Finio
- **Support:** support@studiofinance.ru

## 📞 Поддержка

Если у вас возникли вопросы или проблемы:

1. Проверьте [документацию](docs/)
2. Откройте [Issue](https://github.com/Franklin15097/Finio/issues)
3. Напишите на support@studiofinance.ru
4. Используйте `/help` в Telegram боте

## 🎯 Roadmap

### В разработке
- [ ] Telegram webhooks вместо polling
- [ ] Структурированное логирование (Winston/Pino)
- [ ] Unit тесты (Jest + Supertest)
- [ ] API версионирование (/api/v1/)
- [ ] Push-уведомления через Telegram
- [ ] Напоминания о регулярных платежах
- [ ] Виджеты для быстрого просмотра
- [ ] Drag-and-drop сортировка
- [ ] Кастомные темы оформления
- [ ] Мобильное приложение (iOS/Android)
- [ ] Интеграция с банками
- [ ] Совместное использование бюджетов

### Завершено (v2.0)
- [x] **Real-time синхронизация через WebSocket**
- [x] **Redis кэширование и хранение токенов**
- [x] **Валидация данных с Zod**
- [x] **Rate limiting для защиты от атак**
- [x] **Оптимизация БД с индексами**
- [x] **Улучшенная обработка ошибок**

### Завершено (v1.0)
- [x] Telegram Mini App
- [x] Telegram Bot с командами
- [x] Аналитика и отчёты
- [x] Экспорт данных (CSV, Excel, PDF)
- [x] Прогнозирование баланса
- [x] Тепловая карта расходов
- [x] Круговые индикаторы
- [x] Адаптивный дизайн

---

**Made with ❤️ by Finio Team**
