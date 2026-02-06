# Развертывание Finio на хостинге

## 📁 Структура проекта (готова к деплою)

```
finio/
├── backend/                   # FastAPI приложение
│   ├── app/                  # Код приложения
│   │   ├── api/v1/          # REST API эндпоинты
│   │   ├── bot/             # Telegram bot
│   │   ├── core/            # Конфигурация
│   │   ├── models/          # SQLAlchemy модели
│   │   ├── schemas/         # Pydantic схемы
│   │   ├── services/        # Бизнес-логика
│   │   └── main.py          # Точка входа
│   ├── alembic/             # Миграции БД
│   ├── requirements.txt     # Python зависимости
│   ├── .env.example         # Переменные окружения
│   ├── Dockerfile           # Docker образ
│   └── migrate_data.py      # Скрипт миграции
├── frontend/                # React приложение
│   ├── src/                 # Исходный код
│   │   ├── api/            # API клиент
│   │   ├── components/     # React компоненты
│   │   ├── contexts/       # Контексты
│   │   └── pages/          # Страницы
│   ├── public/             # Статические файлы
│   └── package.json        # Node.js зависимости
├── docker-compose.yml      # Docker для разработки
├── INSTALLATION.md         # Подробная инструкция
└── README.md              # Документация
```

## 🚀 Команды для развертывания

### На хостинге (Ubuntu 22.04+):

```bash
# 1. Клонирование проекта
git clone https://github.com/Franklin15097/Finio.git
cd Finio

# 2. Следуйте инструкциям в INSTALLATION.md
# Все пошагово расписано для продакшена
```

### Локально для разработки:

```bash
# 1. Клонирование
git clone https://github.com/Franklin15097/Finio.git
cd Finio

# 2. Запуск через Docker
docker-compose up -d

# 3. Миграции
docker-compose exec backend alembic upgrade head

# 4. Готово!
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

## ✅ Что включено

- **Полный FastAPI backend** с асинхронностью
- **Полный React frontend** со всеми страницами
- **Telegram Bot** с Aiogram 3.x
- **PostgreSQL** модели и миграции
- **Docker** конфигурация
- **Nginx** настройки
- **SSL** поддержка
- **Systemd** сервисы
- **Автоматические бэкапы**
- **Подробная документация**

## 🎯 Готово к использованию

Проект полностью готов к развертыванию на любом хостинге:
- DigitalOcean
- Vultr  
- Linode
- Hetzner
- AWS EC2

Просто клонируйте репозиторий и следуйте INSTALLATION.md!