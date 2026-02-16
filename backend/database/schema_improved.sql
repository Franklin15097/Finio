-- Улучшенная схема БД с индексами и оптимизациями

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  telegram_id BIGINT UNIQUE,
  telegram_username VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_telegram_id (telegram_id),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица счетов
CREATE TABLE IF NOT EXISTS accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  type ENUM('cash', 'bank', 'credit', 'investment', 'checking', 'savings', 'emergency') NOT NULL,
  percentage DECIMAL(5, 2) DEFAULT 0 COMMENT 'Percentage of income to allocate',
  planned_balance DECIMAL(15, 2) DEFAULT 0 COMMENT 'Calculated from income * percentage',
  actual_balance DECIMAL(15, 2) DEFAULT 0 COMMENT 'User-entered actual balance',
  currency VARCHAR(3) DEFAULT 'RUB',
  color VARCHAR(7) DEFAULT '#6366f1',
  icon VARCHAR(50) DEFAULT 'wallet',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица категорий
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  icon VARCHAR(50) DEFAULT '💰',
  color VARCHAR(7) DEFAULT '#6366f1',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_category (user_id, name),
  INDEX idx_user_type (user_id, type),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица транзакций
CREATE TABLE IF NOT EXISTS transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  category_id INT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description VARCHAR(255),
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_user_date (user_id, transaction_date DESC),
  INDEX idx_user_category (user_id, category_id),
  INDEX idx_transaction_date (transaction_date DESC),
  INDEX idx_created_at (created_at DESC),
  INDEX idx_amount (amount)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица бюджетов
CREATE TABLE IF NOT EXISTS budgets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  limit_amount DECIMAL(15, 2) NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE KEY unique_budget (user_id, category_id, month, year),
  INDEX idx_user_period (user_id, year, month),
  INDEX idx_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Добавляем индексы к существующим таблицам (если они уже созданы)
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_telegram_id (telegram_id);
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_email (email);

ALTER TABLE accounts ADD INDEX IF NOT EXISTS idx_user_id (user_id);
ALTER TABLE accounts ADD INDEX IF NOT EXISTS idx_type (type);

ALTER TABLE categories ADD INDEX IF NOT EXISTS idx_user_type (user_id, type);
ALTER TABLE categories ADD INDEX IF NOT EXISTS idx_type (type);

ALTER TABLE transactions ADD INDEX IF NOT EXISTS idx_user_date (user_id, transaction_date DESC);
ALTER TABLE transactions ADD INDEX IF NOT EXISTS idx_user_category (user_id, category_id);
ALTER TABLE transactions ADD INDEX IF NOT EXISTS idx_transaction_date (transaction_date DESC);
ALTER TABLE transactions ADD INDEX IF NOT EXISTS idx_created_at (created_at DESC);
ALTER TABLE transactions ADD INDEX IF NOT EXISTS idx_amount (amount);

ALTER TABLE budgets ADD INDEX IF NOT EXISTS idx_user_period (user_id, year, month);
ALTER TABLE budgets ADD INDEX IF NOT EXISTS idx_category (category_id);
