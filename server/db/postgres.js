import pg from 'pg';
const { Pool } = pg;

let pool;

export async function initDatabase() {
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'finio',
    user: process.env.DB_USER || 'finio_user',
    password: process.env.DB_PASSWORD || 'maks15097',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Create tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      telegram_id TEXT UNIQUE,
      username TEXT,
      first_name TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      amount DECIMAL(12, 2) NOT NULL,
      title TEXT NOT NULL,
      category_id INTEGER REFERENCES categories(id),
      transaction_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      balance DECIMAL(12, 2) DEFAULT 0,
      type TEXT NOT NULL CHECK(type IN ('card', 'cash', 'deposit', 'investment')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS savings_rules (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      asset_id INTEGER NOT NULL REFERENCES assets(id),
      percentage DECIMAL(5, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recurring_expenses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      amount DECIMAL(12, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
    CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
    CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
  `);

  // Insert default categories
  await pool.query(`
    INSERT INTO categories (user_id, name, type) VALUES
    (NULL, 'Зарплата', 'income'),
    (NULL, 'Фриланс', 'income'),
    (NULL, 'Инвестиции', 'income'),
    (NULL, 'Еда', 'expense'),
    (NULL, 'Транспорт', 'expense'),
    (NULL, 'Развлечения', 'expense'),
    (NULL, 'Здоровье', 'expense'),
    (NULL, 'Образование', 'expense'),
    (NULL, 'Коммунальные', 'expense')
    ON CONFLICT DO NOTHING
  `);

  console.log('PostgreSQL Database initialized');
  return pool;
}

export async function query(text, params) {
  return pool.query(text, params);
}

export { pool };
