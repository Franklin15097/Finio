# Finio - Умный контроль финансов

Современное веб-приложение для управления личными финансами с интеграцией Telegram бота.

## Архитектура

- **Backend**: FastAPI (Python) с асинхронной поддержкой
- **Frontend**: React с современным UI
- **База данных**: PostgreSQL
- **Telegram Bot**: Aiogram 3.x
- **Веб-сервер**: Nginx
- **Развертывание**: Docker + systemd

## Структура проекта

```
finio/
├── app/                       # FastAPI backend
│   ├── api/v1/               # REST API endpoints
│   ├── bot/                  # Telegram bot handlers
│   ├── core/                 # Core configuration
│   ├── models/               # SQLAlchemy models
│   ├── schemas/              # Pydantic schemas
│   ├── services/             # Business logic
│   └── main.py              # Application entry point
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── api/             # API client
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/          # Page components
│   │   └── App.js          # Main app component
│   ├── public/             # Static files
│   └── package.json        # Node.js dependencies
├── alembic/                # Database migrations
├── requirements.txt        # Python dependencies
├── docker-compose.yml      # Docker development setup
├── Dockerfile             # Docker image
├── migrate_data.py         # Data migration script
├── INSTALLATION.md         # Production deployment guide
└── README.md              # This file
```

## Быстрый старт

### Разработка с Docker

1. **Клонирование репозитория**:
```bash
git clone https://github.com/your-username/finio.git
cd finio
```

2. **Запуск с Docker Compose**:
```bash
docker-compose up -d
```

3. **Применение миграций**:
```bash
docker-compose exec backend alembic upgrade head
```

4. **Доступ к приложению**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Локальная разработка

#### Backend

1. **Установка зависимостей**:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

2. **Настройка переменных окружения**:
```bash
cp .env.example .env
# Отредактируйте .env файл
```

3. **Запуск базы данных**:
```bash
# С Docker
docker run -d --name finio-postgres \
  -e POSTGRES_DB=finio \
  -e POSTGRES_USER=finio_user \
  -e POSTGRES_PASSWORD=finio_password \
  -p 5432:5432 postgres:15
```

4. **Применение миграций**:
```bash
alembic upgrade head
```

5. **Запуск сервера**:
```bash
uvicorn app.main:app --reload
```

#### Frontend

1. **Установка зависимостей**:
```bash
cd frontend
npm install
```

2. **Запуск dev сервера**:
```bash
npm start
```

## Возможности

### Веб-приложение
- 📊 Интерактивный дашборд с графиками
- 💰 Учет доходов и расходов
- 📁 Управление категориями
- 📈 Детальная аналитика
- 🔐 Безопасная аутентификация
- 📱 Адаптивный дизайн

### Telegram Bot
- 🤖 Быстрое добавление транзакций
- 📊 Просмотр баланса и статистики
- 🔗 Синхронизация с веб-версией
- 📝 Управление через команды
- 🎯 Умные уведомления

## API Документация

После запуска backend сервера, документация API доступна по адресам:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Основные эндпоинты

#### Аутентификация
- `POST /api/v1/auth/register` - Регистрация
- `POST /api/v1/auth/login` - Вход
- `GET /api/v1/users/me` - Текущий пользователь

#### Транзакции
- `GET /api/v1/transactions/` - Список транзакций
- `POST /api/v1/transactions/` - Создание транзакции
- `PUT /api/v1/transactions/{id}` - Обновление транзакции
- `DELETE /api/v1/transactions/{id}` - Удаление транзакции
- `GET /api/v1/transactions/stats` - Статистика

#### Категории
- `GET /api/v1/categories/` - Список категорий
- `POST /api/v1/categories/` - Создание категории
- `PUT /api/v1/categories/{id}` - Обновление категории
- `DELETE /api/v1/categories/{id}` - Удаление категории

## Telegram Bot

### Настройка бота

1. **Создание бота**:
   - Найдите @BotFather в Telegram
   - Создайте нового бота командой `/newbot`
   - Сохраните полученный токен

2. **Настройка webhook** (для продакшена):
```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-domain.com/bot-webhook/"}'
```

### Команды бота

- `/start` - Начать работу с ботом
- `/help` - Справка по командам
- `/balance` - Показать текущий баланс
- `/stats` - Показать статистику
- `/link` - Инструкции по привязке аккаунта

### Быстрые действия

- Отправьте число (например: `500`) для быстрого добавления расхода
- Используйте кнопки меню для навигации
- Все операции синхронизируются с веб-версией

## Развертывание в продакшене

Подробное руководство по развертыванию на сервере смотрите в [INSTALLATION.md](INSTALLATION.md).

### Краткий обзор

1. **Подготовка сервера** (Ubuntu 22.04+)
2. **Установка зависимостей** (Python, Node.js, PostgreSQL, Nginx)
3. **Настройка базы данных**
4. **Сборка и развертывание приложения**
5. **Настройка Nginx и SSL**
6. **Настройка systemd сервиса**
7. **Настройка Telegram webhook**

## Миграция данных

Если у вас есть данные из старой версии проекта:

```bash
pip install asyncpg mysql-connector-python python-dotenv
python migrate_data.py
```

## Тестирование

### Backend тесты
```bash
pytest
```

### Frontend тесты
```bash
cd frontend
npm test
```

## Мониторинг и логирование

### Логи приложения
```bash
# Системные логи
sudo journalctl -u finio -f

# Логи приложения
tail -f /var/log/finio/app.log

# Логи Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Health checks
- Backend: `GET /health`
- Database: Встроенные проверки в приложении

## Безопасность

- 🔐 JWT аутентификация
- 🛡️ Валидация всех входящих данных
- 🔒 HTTPS обязателен в продакшене
- 🚫 Rate limiting для API
- 🔑 Безопасное хранение паролей (bcrypt)
- 🌐 CORS настройки

## Производительность

- ⚡ Асинхронная обработка запросов
- 📦 Кэширование статических файлов
- 🗜️ Сжатие ответов (gzip)
- 📊 Оптимизированные SQL запросы
- 🔄 Connection pooling для БД

## Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Создайте Pull Request

## Лицензия

Этот проект распространяется под лицензией MIT. См. файл `LICENSE` для подробностей.

## Поддержка

- 📧 Email: support@finio.app
- 💬 Telegram: @finio_support
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/finio/issues)
- 📖 Документация: [Wiki](https://github.com/your-username/finio/wiki)

## Changelog

### v2.0.0 (2026-02-06)
- ✨ Полная переработка архитектуры
- 🚀 Миграция на FastAPI + React
- 🤖 Интеграция Telegram бота
- 📊 Улучшенная аналитика
- 🔐 Обновленная система безопасности
- 📱 Адаптивный дизайн

### v1.0.0
- 🎉 Первая версия проекта
- 💰 Базовый учет транзакций
- 📁 Система категорий