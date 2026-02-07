#!/bin/bash

echo "🗄️ НАСТРОЙКА MYSQL 8+ ДЛЯ FINIO"
echo "==============================="

if [ "$EUID" -ne 0 ]; then
    echo "❌ Запустите с правами root: sudo $0"
    exit 1
fi

# Установка MySQL 8.0
echo "📦 Установка MySQL 8.0..."
apt-get update
apt-get install -y mysql-server-8.0

# Запуск MySQL
systemctl start mysql
systemctl enable mysql

echo "🔧 Настройка базы данных..."

# Создание базы данных и пользователя
mysql -u root << 'EOF'
CREATE DATABASE IF NOT EXISTS finio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'finio_user'@'localhost' IDENTIFIED BY 'maks15097';
GRANT ALL PRIVILEGES ON finio.* TO 'finio_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# Проверка подключения
if mysql -u finio_user -pmaks15097 finio -e "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ MySQL настроен успешно!"
    echo "📊 База данных: finio"
    echo "👤 Пользователь: finio_user"
    echo "🔑 Пароль: maks15097"
else
    echo "❌ Ошибка настройки MySQL"
    exit 1
fi

echo ""
echo "🎯 MySQL готов к использованию!"
echo "🔗 Подключение: mysql -u finio_user -pmaks15097 finio"