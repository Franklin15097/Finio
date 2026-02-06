# 🚀 Finio - Запуск проекта с нуля

Современное веб-приложение для управления финансами с Telegram ботом `FinanceStudio_bot`.

## ⚡ Быстрый запуск на хостинге

### 1. Клонируйте проект
```bash
git clone https://github.com/Franklin15097/Finio.git
cd Finio
```

### 2. Запустите автоматическую установку
```bash
chmod +x install.sh
sudo ./install.sh your-domain.com your-telegram-bot-token
```

**Замените:**
- `your-domain.com` - на ваш домен
- `your-telegram-bot-token` - на токен от @BotFather

### 3. Готово! 🎉

После установки доступно:
- 🌐 **Сайт**: https://your-domain.com
- 🔧 **API**: https://your-domain.com/api/v1/docs
- 🤖 **Telegram бот**: @FinanceStudio_bot

---

## 💻 Локальная разработка

### Вариант 1: Docker (рекомендуется)

```bash
# 1. Клонируйте проект
git clone https://github.com/Franklin15097/Finio.git
cd Finio

# 2. Запустите через Docker
docker-compose up -d

# 3. Примените миграции
docker-compose exec backend alembic upgrade head

# 4. Готово!
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Вариант 2: Ручная установка

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или venv\Scripts\activate  # Windows

pip install -r requirements.txt
cp .env.example .env
# Отредактируйте .env файл

# Запустите PostgreSQL (Docker)
docker run -d --name finio-postgres \
  -e POSTGRES_DB=finio \
  -e POSTGRES_USER=finio_user \
  -e POSTGRES_PASSWORD=finio_password \
  -p 5432:5432 postgres:15

# Примените миграции
alembic upgrade head

# Запустите сервер
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

---

## 🤖 Настройка Telegram бота

### 1. Получите токен бота

**Если бот уже создан:**
1. Найдите @BotFather в Telegram
2. Отправьте `/mybots`
3. Выберите `FinanceStudio_bot`
4. Нажмите "API Token"

**Если нужно создать:**
1. Найдите @BotFather в Telegram
2. Отправьте `/newbot`
3. Имя: `FinanceStudio`
4. Username: `FinanceStudio_bot`
5. Сохраните токен

### 2. Настройте команды бота

```bash
curl -X POST "https://api.telegram.org/botYOUR_TOKEN/setMyCommands" \
     -H "Content-Type: application/json" \
     -d '{
       "commands": [
         {"command": "start", "description": "Начать работу"},
         {"command": "help", "description": "Справка"},
         {"command": "balance", "description": "Баланс"},
         {"command": "stats", "description": "Статистика"},
         {"command": "link", "description": "Привязать аккаунт"}
       ]
     }'
```

---

## 🔄 Обновление проекта

```bash
cd Finio
sudo ./update.sh
```

---

## 🏗️ Архитектура

```
┌─────────────────┐     HTTPS/REST     ┌──────────────────────────────────┐
│   Frontend      │◄──────────────────►│     Backend API (FastAPI)        │
│   React SPA     │                    │  - REST API для фронтенда        │
│   (Static)      │                    │  - Webhook обработчик для бота   │
│                 │                    │  - Общая бизнес-логика           │
└─────────────────┘                    │  - JWT аутентификация            │
                                       └────────────┬─────────────────────┘
                                       ▲            │
                                       │            ▼
                                  Webhook     ┌─────────────┐
                                       │      │ PostgreSQL  │
                                       │      │  Database   │
                                       │      └─────────────┘
                                 ┌──────────┐
                                 │Telegram  │
                                 │  Bot     │
                                 │FinanceStudio_bot│
                                 └──────────┘
```

**Технологии:**
- **Backend**: FastAPI (Python) + PostgreSQL + Alembic
- **Frontend**: React + Axios + Chart.js
- **Bot**: Aiogram 3.x с webhook
- **Deploy**: Nginx + SSL + systemd

---

## 📋 Возможности

### Веб-приложение
- 📊 Интерактивный дашборд с графиками
- 💰 Учет доходов и расходов
- 📁 Управление категориями
- 📈 Детальная аналитика
- 🔐 JWT аутентификация
- 📱 Адаптивный дизайн

### Telegram Bot
- 🤖 Быстрое добавление транзакций
- 📊 Просмотр баланса и статистики
- 🔗 Синхронизация с веб-версией
- 📝 Управление через команды
- 🎯 Умные уведомления

---

## 🛠️ Устранение неполадок

### Проверка логов
```bash
# Backend
sudo journalctl -u finio -f
tail -f /var/log/finio/error.log

# Nginx
sudo tail -f /var/log/nginx/error.log

# Статус сервисов
sudo systemctl status finio
sudo systemctl status nginx
sudo systemctl status postgresql
```

### Проверка Telegram webhook
```bash
curl "https://api.telegram.org/botYOUR_TOKEN/getWebhookInfo"
```

### Перезапуск сервисов
```bash
sudo systemctl restart finio
sudo systemctl restart nginx
```

---

## 📁 Структура проекта

```
finio/
├── backend/                   # FastAPI приложение
│   ├── app/
│   │   ├── api/v1/           # REST API эндпоинты
│   │   ├── bot/              # Telegram bot handlers
│   │   ├── core/             # Конфигурация
│   │   ├── models/           # SQLAlchemy модели
│   │   ├── schemas/          # Pydantic схемы
│   │   ├── services/         # Бизнес-логика
│   │   └── main.py           # Точка входа
│   ├── alembic/              # Миграции БД
│   ├── requirements.txt      # Python зависимости
│   ├── .env.example          # Переменные окружения
│   └── Dockerfile            # Docker образ
├── frontend/                 # React приложение
│   ├── src/
│   │   ├── api/             # API клиент
│   │   ├── components/      # React компоненты
│   │   ├── contexts/        # Контексты
│   │   ├── pages/          # Страницы
│   │   └── App.js          # Главный компонент
│   ├── public/             # Статические файлы
│   └── package.json        # Node.js зависимости
├── install.sh              # Автоматическая установка
├── update.sh               # Скрипт обновления
├── docker-compose.yml      # Docker для разработки
└── README.md              # Эта инструкция
```

---

## 🔒 Безопасность

- 🔐 JWT аутентификация
- 🛡️ Валидация всех данных (Pydantic)
- 🔒 HTTPS обязателен в продакшене
- 🚫 Rate limiting для API
- 🔑 Безопасное хранение паролей (bcrypt)
- 🌐 CORS настройки
- 🛡️ Firewall (ufw)

---

## ⚡ Производительность

- Асинхронная обработка запросов (FastAPI + asyncpg)
- Кэширование статических файлов
- Сжатие ответов (gzip)
- Оптимизированные SQL запросы
- Connection pooling для БД

---

## 📞 Поддержка

При проблемах:
1. Проверьте логи приложения
2. Убедитесь, что все сервисы запущены
3. Проверьте конфигурацию Nginx
4. Убедитесь, что SSL сертификат действителен
5. Проверьте настройки Telegram webhook

**GitHub**: https://github.com/Franklin15097/Finio

---

## 📄 Лицензия

MIT License - используйте свободно для любых целей.