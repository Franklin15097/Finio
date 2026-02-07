const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = 8000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: ['https://studiofinance.ru', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Database connection
const dbConfig = {
  host: 'localhost',
  user: 'finio_user',
  password: 'maks15097',
  database: 'finio',
  charset: 'utf8mb4',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

let db;

async function connectDB() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database');
    
    // Initialize tables
    await initTables();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

async function initTables() {
  try {
    // Users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255),
        telegram_id VARCHAR(50) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Categories table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        type ENUM('INCOME', 'EXPENSE') NOT NULL,
        color VARCHAR(7) DEFAULT '#3B82F6',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Transactions table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        category_id INT,
        type ENUM('INCOME', 'EXPENSE') NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        transaction_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        INDEX idx_user_date (user_id, transaction_date),
        INDEX idx_type (type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Table initialization failed:', error);
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Finio API v2.0 - Ultra Fast ⚡',
    status: 'ok',
    version: '2.0.0',
    backend: 'Node.js + Express',
    database: 'MySQL 8+'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Telegram authentication
app.post('/api/auth/telegram', async (req, res) => {
  try {
    const { telegram_id, first_name, last_name } = req.body;
    
    // Check existing user
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE telegram_id = ?',
      [telegram_id]
    );

    let user = rows[0];
    
    if (!user) {
      // Create new user
      const full_name = `${first_name} ${last_name || ''}`.trim();
      const [result] = await db.execute(
        'INSERT INTO users (email, full_name, telegram_id) VALUES (?, ?, ?)',
        [`user_${telegram_id}@telegram.local`, full_name, telegram_id]
      );
      
      const userId = result.insertId;
      
      // Create default categories
      const categories = [
        [userId, 'Зарплата', 'INCOME', '#10B981'],
        [userId, 'Продукты', 'EXPENSE', '#EF4444'],
        [userId, 'Транспорт', 'EXPENSE', '#F59E0B']
      ];
      
      await db.execute(
        'INSERT INTO categories (user_id, name, type, color) VALUES ?',
        [categories]
      );
      
      user = { id: userId, telegram_id, full_name };
    }
    
    res.json({ user_id: user.id, status: 'authenticated' });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(400).json({ error: 'Authentication failed' });
  }
});

// Initialize demo data
app.post('/api/init-demo-data', async (req, res) => {
  try {
    // Check if demo user exists
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      ['demo@finio.local']
    );

    let demoUser = rows[0];
    
    if (!demoUser) {
      // Create demo user
      const [result] = await db.execute(
        'INSERT INTO users (email, full_name) VALUES (?, ?)',
        ['demo@finio.local', 'Демо пользователь']
      );
      
      const userId = result.insertId;
      
      // Create demo categories
      const [cat1] = await db.execute(
        'INSERT INTO categories (user_id, name, type, color) VALUES (?, ?, ?, ?)',
        [userId, 'Зарплата', 'INCOME', '#10B981']
      );
      
      const [cat2] = await db.execute(
        'INSERT INTO categories (user_id, name, type, color) VALUES (?, ?, ?, ?)',
        [userId, 'Продукты', 'EXPENSE', '#EF4444']
      );
      
      const [cat3] = await db.execute(
        'INSERT INTO categories (user_id, name, type, color) VALUES (?, ?, ?, ?)',
        [userId, 'Транспорт', 'EXPENSE', '#F59E0B']
      );
      
      // Create demo transactions
      const today = new Date().toISOString().split('T')[0];
      const transactions = [
        [userId, cat1.insertId, 'INCOME', 50000, 'Зарплата за январь', 'Основная работа', today],
        [userId, cat2.insertId, 'EXPENSE', 5000, 'Продукты на неделю', 'Покупки в супермаркете', today],
        [userId, cat3.insertId, 'EXPENSE', 2000, 'Проезд', 'Транспортная карта', today]
      ];
      
      await db.execute(
        'INSERT INTO transactions (user_id, category_id, type, amount, title, description, transaction_date) VALUES ?',
        [transactions]
      );
      
      demoUser = { id: userId };
    }
    
    res.json({ status: 'demo_data_initialized', user_id: demoUser.id });
  } catch (error) {
    console.error('Demo data error:', error);
    res.status(400).json({ error: 'Failed to initialize demo data' });
  }
});

// Get user stats
app.get('/api/users/:id/stats', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const [stats] = await db.execute(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) as total_expense,
        COUNT(*) as transactions_count
      FROM transactions 
      WHERE user_id = ?
    `, [userId]);
    
    const result = stats[0];
    const totalIncome = parseFloat(result.total_income);
    const totalExpense = parseFloat(result.total_expense);
    
    res.json({
      total_income: totalIncome,
      total_expense: totalExpense,
      balance: totalIncome - totalExpense,
      transactions_count: parseInt(result.transactions_count)
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(400).json({ error: 'Failed to get stats' });
  }
});

// Get user transactions
app.get('/api/users/:id/transactions', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const [rows] = await db.execute(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC, created_at DESC LIMIT 50',
      [userId]
    );
    
    const transactions = rows.map(t => ({
      id: t.id,
      user_id: t.user_id,
      category_id: t.category_id,
      type: t.type.toLowerCase(),
      amount: parseFloat(t.amount),
      title: t.title,
      description: t.description,
      date: t.transaction_date.toISOString().split('T')[0],
      created_at: t.created_at.toISOString()
    }));
    
    res.json(transactions);
  } catch (error) {
    console.error('Transactions error:', error);
    res.status(400).json({ error: 'Failed to get transactions' });
  }
});

// Mini App
app.get('/miniapp', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
    <meta name="theme-color" content="#2481cc" />
    <title>Finio</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background-color: var(--tg-theme-bg-color, #f8fafc);
            color: var(--tg-theme-text-color, #1e293b);
            padding: 16px;
            min-height: 100vh;
        }
        .container { max-width: 100%; }
        .header {
            background: var(--tg-theme-secondary-bg-color, white);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .message {
            background: var(--tg-theme-secondary-bg-color, white);
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .performance {
            color: #10B981;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💰 Finio</h1>
            <p id="user-info">Загрузка...</p>
        </div>
        
        <div class="message">
            <h2>⚡ Ultra Fast Backend</h2>
            <p class="performance">Node.js + Express + MySQL 8+</p>
            <p>Максимальная производительность!</p>
        </div>
    </div>
    
    <script>
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        tg.setHeaderColor('#2481cc');
        
        const user = tg.initDataUnsafe.user;
        if (user) {
            document.getElementById('user-info').textContent = \`Привет, \${user.first_name}! 👋\`;
        }
    </script>
</body>
</html>`;
  
  res.send(html);
});

// Bot webhook placeholder
app.post('/bot-webhook', (req, res) => {
  res.json({ status: 'webhook received' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
async function startServer() {
  await connectDB();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Finio Backend v2.0 running on port ${PORT}`);
    console.log(`⚡ Ultra Fast: Node.js + Express + MySQL 8+`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  });
}

startServer().catch(console.error);