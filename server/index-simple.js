import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'finio',
  user: process.env.DB_USER || 'finio_user',
  password: process.env.DB_PASSWORD || 'maks15097',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Database connected:', res.rows[0].now);
  }
});

// Initialize database tables
async function initDatabase() {
  try {
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
        is_recurring BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS recurring_expenses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS asset_categories (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS assets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        balance DECIMAL(12, 2) DEFAULT 0,
        actual_balance DECIMAL(12, 2) DEFAULT 0,
        currency TEXT DEFAULT 'RUB' CHECK(currency IN ('RUB', 'USDT')),
        savings_percentage DECIMAL(5, 2) DEFAULT 0,
        category_id INTEGER REFERENCES asset_categories(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
      CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
    `);
    
    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
}

initDatabase();

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    database: 'postgresql',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.get('/api/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as balance
      FROM transactions
    `);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/transactions', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id,
        t.title,
        t.amount,
        t.type,
        t.transaction_date,
        c.name as category_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      ORDER BY t.transaction_date DESC
      LIMIT 50
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/transactions', async (req, res) => {
  const { title, amount, type, category_id, transaction_date } = req.body;
  
  try {
    const result = await pool.query(`
      INSERT INTO transactions (user_id, title, amount, type, category_id, transaction_date)
      VALUES (1, $1, $2, $3, $4, $5)
      RETURNING *
    `, [title, amount, type, category_id, transaction_date]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;
  const { title, amount, type, category_id, transaction_date } = req.body;
  
  try {
    const result = await pool.query(`
      UPDATE transactions 
      SET title = $1, amount = $2, type = $3, category_id = $4, transaction_date = $5
      WHERE id = $6
      RETURNING *
    `, [title, amount, type, category_id, transaction_date, id]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Recurring expenses
app.get('/api/recurring-expenses', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.id,
        r.title,
        r.amount,
        r.amount * 12 as yearly_amount,
        c.name as category_name
      FROM recurring_expenses r
      LEFT JOIN categories c ON r.category_id = c.id
      ORDER BY r.amount DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recurring expenses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/recurring-expenses', async (req, res) => {
  const { title, amount, category_id } = req.body;
  
  try {
    const result = await pool.query(`
      INSERT INTO recurring_expenses (user_id, title, amount, category_id)
      VALUES (1, $1, $2, $3)
      RETURNING *
    `, [title, amount, category_id]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating recurring expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/recurring-expenses/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query('DELETE FROM recurring_expenses WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting recurring expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assets
app.get('/api/assets', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.id,
        a.name,
        a.balance,
        a.actual_balance,
        a.currency,
        a.savings_percentage,
        ac.name as category_name
      FROM assets a
      LEFT JOIN asset_categories ac ON a.category_id = ac.id
      ORDER BY a.balance DESC
    `);
    
    // Calculate total balance
    const totalResult = await pool.query(`
      SELECT 
        SUM(CASE WHEN currency = 'RUB' THEN balance ELSE 0 END) as total_rub,
        SUM(CASE WHEN currency = 'USDT' THEN balance ELSE 0 END) as total_usdt
      FROM assets
    `);
    
    res.json({
      assets: result.rows,
      totals: totalResult.rows[0]
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/assets', async (req, res) => {
  const { name, balance, actual_balance, currency, savings_percentage, category_id } = req.body;
  
  try {
    const result = await pool.query(`
      INSERT INTO assets (user_id, name, balance, actual_balance, currency, savings_percentage, category_id)
      VALUES (1, $1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name, balance, actual_balance, currency, savings_percentage, category_id]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/assets/:id', async (req, res) => {
  const { id } = req.params;
  const { name, balance, actual_balance, currency, savings_percentage, category_id } = req.body;
  
  try {
    const result = await pool.query(`
      UPDATE assets 
      SET name = $1, balance = $2, actual_balance = $3, currency = $4, savings_percentage = $5, category_id = $6
      WHERE id = $7
      RETURNING *
    `, [name, balance, actual_balance, currency, savings_percentage, category_id, id]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/assets/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query('DELETE FROM assets WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Asset categories
app.get('/api/asset-categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM asset_categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching asset categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/asset-categories', async (req, res) => {
  const { name } = req.body;
  
  try {
    const result = await pool.query(`
      INSERT INTO asset_categories (user_id, name)
      VALUES (1, $1)
      RETURNING *
    `, [name]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating asset category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Categories
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/categories', async (req, res) => {
  const { name, type } = req.body;
  
  try {
    const result = await pool.query(`
      INSERT INTO categories (user_id, name, type)
      VALUES (1, $1, $2)
      RETURNING *
    `, [name, type]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files
const websitePath = path.join(__dirname, '../website-frontend/dist');
app.use(express.static(websitePath));

const miniAppPath = path.join(__dirname, '../mini-app-frontend/dist');
app.use('/mini-app', express.static(miniAppPath));

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(websitePath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Database: PostgreSQL`);
  console.log(`🌐 Website: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});
