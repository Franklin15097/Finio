-- Таблица Активов/Счетов (Assets)
CREATE TABLE IF NOT EXISTS assets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL, -- Название (Сбер, Наличные)
    balance DECIMAL(15, 2) DEFAULT 0.00, -- Фактический баланс
    type ENUM('cash', 'card', 'deposit', 'investment', 'other') DEFAULT 'card',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица Правил Накоплений (Savings Rules)
-- Какую часть дохода отправлять в какой актив
CREATE TABLE IF NOT EXISTS savings_rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    asset_id INT NOT NULL, -- В какой актив копим
    percentage DECIMAL(5, 2) NOT NULL, -- Процент от дохода (0-100)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);
