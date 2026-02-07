#!/bin/bash

echo "🔥 ПОЛНАЯ ПЕРЕУСТАНОВКА ПРОЕКТА FINIO"
echo "======================================"

# Останавливаем старый процесс
echo "⏹️  Останавливаем старый сервер..."
pm2 stop finio 2>/dev/null || true
pm2 delete finio 2>/dev/null || true

# Переходим в директорию проекта
cd /opt/Finio || exit 1

# Обновляем код
echo "📥 Обновляем код из GitHub..."
git fetch --all
git reset --hard origin/main
git pull origin main

# Устанавливаем зависимости сервера
echo "📦 Устанавливаем зависимости сервера..."
cd server
npm install

# Инициализируем базу данных
echo "🗄️  Инициализируем базу данных PostgreSQL..."
cd /opt/Finio
chmod +x init-database.sh

# Выполняем SQL напрямую
PGPASSWORD=maks15097 psql -h 85.235.205.99 -p 5432 -U finio_user -d finio << 'EOSQL'

-- Удаляем старые таблицы
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS recurring_expenses CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS asset_categories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Создаем таблицу пользователей
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  telegram_id TEXT UNIQUE,
  username TEXT,
  first_name TEXT,
  email TEXT UNIQUE,
  password_hash TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создаем дефолтного пользователя
INSERT INTO users (id, username, first_name, email) 
VALUES (1, 'default_user', 'Default User', 'user@finio.app');

-- Категории транзакций
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Транзакции (доходы и расходы)
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  amount DECIMAL(12, 2) NOT NULL,
  title TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  transaction_date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Обязательные ежемесячные расходы
CREATE TABLE recurring_expenses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Категории счетов
CREATE TABLE asset_categories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Счета (активы)
CREATE TABLE assets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  balance DECIMAL(12, 2) DEFAULT 0,
  actual_balance DECIMAL(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'RUB' CHECK(currency IN ('RUB', 'USDT', 'USD', 'EUR')),
  savings_percentage DECIMAL(5, 2) DEFAULT 0,
  category_id INTEGER REFERENCES asset_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_recurring_expenses_user_id ON recurring_expenses(user_id);
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_asset_categories_user_id ON asset_categories(user_id);

-- Дефолтные категории
INSERT INTO categories (user_id, name, type) VALUES
(1, 'Зарплата', 'income'),
(1, 'Фриланс', 'income'),
(1, 'Инвестиции', 'income'),
(1, 'Другое', 'income'),
(1, 'Еда', 'expense'),
(1, 'Транспорт', 'expense'),
(1, 'Развлечения', 'expense'),
(1, 'Здоровье', 'expense'),
(1, 'Коммунальные', 'expense'),
(1, 'Другое', 'expense');

-- Дефолтные категории счетов
INSERT INTO asset_categories (user_id, name) VALUES
(1, 'Накопления'),
(1, 'Инвестиции'),
(1, 'Резервный фонд');

SELECT 'Database OK!' as status;

EOSQL

echo "✅ База данных инициализирована"

# Собираем фронтенд
echo "🏗️  Собираем фронтенд..."
cd /opt/Finio/website-frontend
npm install
npm run build

# Запускаем сервер
echo "🚀 Запускаем сервер..."
cd /opt/Finio/server
pm2 start index-simple.js --name finio --time
pm2 save

echo ""
echo "✅ УСТАНОВКА ЗАВЕРШЕНА!"
echo "======================================"
echo "🌐 Сайт: http://studiofinance.ru"
echo "📊 Логи: pm2 logs finio"
echo "🔍 Статус: pm2 status"
echo ""
echo "Проверь работу сайта!"
