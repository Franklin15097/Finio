# 💰 Finio - Личный Финансовый Помощник

Современное веб-приложение и Telegram Mini App для управления личными финансами с real-time синхронизацией, аналитикой и прогнозированием.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-production-success)

---

## 🌟 Возможности

### 💳 Управление финансами
- Учёт доходов и расходов
- Множественные счета и карты с процентным распределением
- Категории с иконками и цветами
- Быстрое добавление транзакций

### 📊 Аналитика и отчёты
- Интерактивные графики и диаграммы (Recharts)
- Тепловая карта расходов по дням и часам
- Сравнение периодов с процентными изменениями
- AI-прогнозирование баланса на 30 дней
- Экспорт данных в CSV, Excel, PDF

### 🔄 Real-time синхронизация (v2.0)
- WebSocket - мгновенная синхронизация между веб и Telegram
- Автоматическое обновление данных без перезагрузки
- Уведомления о новых транзакциях в реальном времени

### 🤖 Telegram Bot
- `/start` - Регистрация/вход
- `/add` - Быстрое добавление транзакций
- `/balance` - Просмотр баланса
- `/app` - Открыть Mini App
- Инлайн-кнопки для интерактивного взаимодействия

### 🎨 Современный UI/UX
- Адаптивный дизайн для всех устройств
- Тёмная тема с градиентами
- Плавные анимации и переходы
- Glass morphism эффекты
- Sparkline графики трендов

---

## 🛠️ Технологический стек

### Frontend
- **React 18.2** + **TypeScript 5.3**
- **Vite 5.0** - Сборщик
- **TailwindCSS 3.4** - Стилизация
- **Recharts 2.10** - Графики
- **Socket.io-client 4.7** - WebSocket

### Backend
- **Node.js 18+** + **Express 4.18**
- **TypeScript 5.3**
- **MySQL 8.0** - База данных
- **Redis 6+** - Кэширование (10-20x ускорение)
- **Socket.io 4.7** - WebSocket сервер
- **JWT** - Аутентификация
- **Zod** - Валидация
- **Winston** - Логирование

### Инфраструктура
- **Nginx** - Reverse proxy, SSL
- **PM2** - Process manager
- **Let's Encrypt** - SSL сертификаты
- **UFW + Fail2Ban** - Безопасность

---

## 🚀 Быстрая установка

### Автоматическая установка (рекомендуется)

```bash
# 1. Скачать скрипт установки
wget https://raw.githubusercontent.com/Franklin15097/Finio/main/scripts/full_server_setup.sh

# 2. Отредактировать конфигурацию
nano full_server_setup.sh
# Укажите: DOMAIN, API_DOMAIN, TELEGRAM_BOT_TOKEN, SSL_EMAIL

# 3. Запустить установку
chmod +x full_server_setup.sh
sudo ./full_server_setup.sh
```

Скрипт автоматически:
- Установит все зависимости (Node.js, MySQL, Redis, Nginx, PM2)
- Настроит базу данных
- Развернёт приложение
- Настроит SSL сертификаты
- Настроит firewall и безопасность
- Настроит автоматические бэкапы

**Время установки:** 15-30 минут

📖 **Подробная инструкция:** [docs/SERVER_SETUP_GUIDE.md](docs/SERVER_SETUP_GUIDE.md)

### Ручная установка

#### Требования
- Ubuntu Server 20.04+
- Node.js 18+
- MySQL 8.0+
- Redis 6+
- Nginx
- PM2

#### Установка зависимостей

```bash
# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# MySQL 8.0
sudo apt install -y mysql-server

# Redis
sudo apt install -y redis-server

# Nginx
sudo apt install -y nginx

# PM2
sudo npm install -g pm2

# Дополнительно
sudo apt install -y git certbot python3-certbot-nginx ufw fail2ban
```

#### Настройка проекта

```bash
# Клонирование
git clone https://github.com/Franklin15097/Finio.git
cd Finio

# Backend
cd backend
npm install
cp .env.example .env
nano .env  # Настройте переменные окружения
npm run build

# Frontend
cd ../frontend
npm install
npm run build

# База данных
mysql -u root -p < backend/database/schema_improved.sql

# Запуск
pm2 start backend/dist/index.js --name finio-backend
pm2 start backend/dist/bot.js --name finio-bot
pm2 save
```

📖 **Подробная инструкция:** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 📋 Переменные окружения

### Backend (.env)
```env
PORT=5000
NODE_ENV=production

DB_HOST=localhost
DB_USER=finio
DB_PASSWORD=your_secure_password
DB_NAME=financial_db

JWT_SECRET=your_long_random_secret_key
TELEGRAM_BOT_TOKEN=your_bot_token

BACKEND_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

REDIS_URL=redis://localhost:6379
```

### Frontend (.env)
```env
VITE_API_URL=https://api.yourdomain.com
```

---

## 🔧 Управление

### PM2 команды
```bash
pm2 status              # Статус процессов
pm2 logs                # Просмотр логов
pm2 restart all         # Перезапуск
pm2 monit               # Мониторинг
```

### Обновление приложения
```bash
cd /var/www/studiofinance
git pull
cd backend && npm install && npm run build
cd ../frontend && npm install && npm run build
pm2 restart all
```

### Автоматический деплой
```bash
# С локальной машины
./scripts/deploy.sh full
```

---

## 📊 API Endpoints

### Аутентификация
- `POST /api/auth/telegram` - Вход через Telegram
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход

### Транзакции
- `GET /api/transactions` - Список транзакций
- `POST /api/transactions` - Создать транзакцию
- `PUT /api/transactions/:id` - Обновить
- `DELETE /api/transactions/:id` - Удалить

### Категории
- `GET /api/categories` - Список категорий
- `POST /api/categories` - Создать категорию
- `PUT /api/categories/:id` - Обновить
- `DELETE /api/categories/:id` - Удалить

### Счета
- `GET /api/accounts` - Список счетов
- `POST /api/accounts` - Создать счёт
- `PUT /api/accounts/:id` - Обновить
- `DELETE /api/accounts/:id` - Удалить

### Аналитика
- `GET /api/analytics/overview` - Общая статистика
- `GET /api/analytics/trends` - Тренды
- `GET /api/analytics/forecast` - Прогноз
- `GET /api/analytics/export` - Экспорт данных

📖 **Полная документация:** [docs/API.md](docs/API.md)

---

## 🔄 WebSocket события

### События от сервера
- `transaction_created` - Новая транзакция
- `transaction_updated` - Обновление транзакции
- `transaction_deleted` - Удаление транзакции
- `category_updated` - Обновление категории
- `account_changed` - Изменение счёта
- `budget_modified` - Изменение бюджета

### Подключение
```typescript
import io from 'socket.io-client';

const socket = io('https://api.yourdomain.com', {
  auth: { token: 'your_jwt_token' }
});

socket.on('transaction_created', (data) => {
  console.log('Новая транзакция:', data);
});
```

---

## 📁 Структура проекта

```
Finio/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth, validation, rate limiting
│   │   ├── validators/     # Zod schemas
│   │   ├── bot.ts          # Telegram bot
│   │   ├── socket.ts       # WebSocket server
│   │   └── index.ts        # Entry point
│   ├── database/           # SQL schemas
│   └── package.json
│
├── frontend/               # Frontend React app
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API & WebSocket
│   │   ├── context/        # React context
│   │   └── hooks/          # Custom hooks
│   └── package.json
│
├── scripts/                # Deployment scripts
│   ├── deploy.sh           # Автоматический деплой
│   └── full_server_setup.sh # Полная установка
│
├── docs/                   # Документация
│   ├── API.md              # API документация
│   ├── DEPLOYMENT.md       # Руководство по развертыванию
│   ├── TECH_STACK.md       # Технологический стек
│   └── SERVER_SETUP_GUIDE.md # Автоматическая установка
│
├── docker-compose.yml      # Docker конфигурация
├── README.md               # Этот файл
└── CHANGELOG.md            # История изменений
```

---

## 🔒 Безопасность

- **JWT токены** - Аутентификация с 30-дневным сроком
- **Bcrypt** - Хеширование паролей
- **Rate limiting** - Защита от DDoS (100 req/15min)
- **Zod валидация** - Строгая проверка входных данных
- **SQL injection** - Защита через prepared statements
- **CORS** - Настроенная политика
- **Firewall (UFW)** - Только необходимые порты
- **Fail2Ban** - Защита от brute-force
- **SSL/TLS** - HTTPS обязателен

---

## ⚡ Производительность

### Оптимизации v2.0
- **Redis кэширование** - 10-20x ускорение запросов
- **Индексы БД** - Время ответа 10-50ms (было 200-500ms)
- **WebSocket** - <100ms latency для real-time обновлений
- **Gzip сжатие** - Уменьшение размера на 70%
- **Static caching** - 1 год для неизменяемых ресурсов

### Метрики
- Время ответа API: 10-50ms
- WebSocket latency: <100ms
- Одновременные подключения: 1000+
- Throughput: 100+ req/sec

---

## 💾 Резервное копирование

### Автоматические бэкапы
- **Расписание:** Ежедневно в 3:00
- **Директория:** `/var/backups/finio/`
- **Хранение:** 30 дней
- **Формат:** `backup_YYYYMMDD_HHMMSS.sql.gz`

### Ручной бэкап
```bash
/usr/local/bin/finio-backup.sh
```

### Восстановление
```bash
gunzip < /var/backups/finio/backup_20240101_030000.sql.gz | mysql -u finio -p financial_db
```

---

## 🐛 Устранение неполадок

### Проверка логов
```bash
# PM2 логи
pm2 logs --lines 100

# Nginx логи
tail -f /var/log/nginx/error.log

# MySQL логи
tail -f /var/log/mysql/error.log
```

### Перезапуск сервисов
```bash
pm2 restart all
systemctl restart nginx
systemctl restart mysql
systemctl restart redis-server
```

### Проверка подключений
```bash
# Redis
redis-cli ping

# MySQL
mysql -u finio -p -e "SELECT 1;"

# Порты
netstat -tlnp | grep -E ':(80|443|5000|3306|6379)'
```

---

## 📚 Документация

- [API.md](docs/API.md) - Полная API документация
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Ручное развертывание
- [TECH_STACK.md](docs/TECH_STACK.md) - Технологический стек
- [SERVER_SETUP_GUIDE.md](docs/SERVER_SETUP_GUIDE.md) - Автоматическая установка
- [CHANGELOG.md](CHANGELOG.md) - История изменений

---

## 🤝 Вклад в проект

Мы приветствуем вклад в проект! Пожалуйста:
1. Форкните репозиторий
2. Создайте ветку для вашей функции (`git checkout -b feature/AmazingFeature`)
3. Закоммитьте изменения (`git commit -m 'Add some AmazingFeature'`)
4. Запушьте в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

---

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

---

## 📞 Контакты

- **GitHub:** [Franklin15097/Finio](https://github.com/Franklin15097/Finio)
- **Issues:** [GitHub Issues](https://github.com/Franklin15097/Finio/issues)

---

## 🎯 Roadmap

### v2.1 (Планируется)
- [ ] Мобильное приложение (React Native)
- [ ] Поддержка нескольких валют
- [ ] Совместное использование бюджетов
- [ ] Уведомления о превышении бюджета
- [ ] Интеграция с банками

### v2.2 (Планируется)
- [ ] Машинное обучение для категоризации
- [ ] Голосовой ввод транзакций
- [ ] Сканирование чеков
- [ ] Финансовые цели и планирование

---

**Версия:** 2.0.0  
**Статус:** Production Ready ✅  
**Дата:** 2024

Made with ❤️ by Franklin15097
