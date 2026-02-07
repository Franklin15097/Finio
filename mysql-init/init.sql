-- Создание базы данных и пользователя
CREATE DATABASE IF NOT EXISTS finio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Создание пользователя (если не существует)
CREATE USER IF NOT EXISTS 'finio_user'@'%' IDENTIFIED BY 'maks15097';

-- Предоставление прав
GRANT ALL PRIVILEGES ON finio.* TO 'finio_user'@'%';
FLUSH PRIVILEGES;

-- Использование базы данных
USE finio;

-- Создание таблиц будет выполнено автоматически через SQLAlchemy