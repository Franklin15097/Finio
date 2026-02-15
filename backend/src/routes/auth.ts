import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import pool from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

// Store for one-time auth tokens (in production use Redis)
const authTokens = new Map<string, { telegramId: number; expiresAt: number }>();

// Clean expired tokens every minute
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of authTokens.entries()) {
    if (data.expiresAt < now) {
      authTokens.delete(token);
    }
  }
}, 60000);

// Validate Telegram Web App data
function validateTelegramWebAppData(initData: string): any {
  console.log('=== Telegram Validation Start ===');
  console.log('Bot Token configured:', !!TELEGRAM_BOT_TOKEN && TELEGRAM_BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE');
  console.log('Init Data length:', initData.length);
  
  // Skip validation in development if no token
  if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
    console.warn('⚠️  Telegram validation skipped - no bot token configured');
    // Try to parse user data anyway for development
    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get('user');
    if (userParam) {
      const user = JSON.parse(userParam);
      console.log('Development mode - user:', user);
      return user;
    }
    throw new Error('No user data in initData');
  }

  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  
  console.log('Hash present:', !!hash);
  console.log('URL params:', Array.from(urlParams.keys()));
  
  if (!hash) {
    throw new Error('No hash in initData');
  }
  
  urlParams.delete('hash');
  
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  console.log('Data check string:', dataCheckString.substring(0, 100) + '...');
  
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(TELEGRAM_BOT_TOKEN).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  
  console.log('Calculated hash:', calculatedHash);
  console.log('Received hash:', hash);
  console.log('Hashes match:', calculatedHash === hash);
  
  if (calculatedHash !== hash) {
    console.error('Hash mismatch!');
    throw new Error('Invalid hash');
  }
  
  const userParam = urlParams.get('user');
  if (!userParam) {
    throw new Error('No user data');
  }
  
  const user = JSON.parse(userParam);
  console.log('Validated user:', user);
  console.log('=== Telegram Validation End ===');
  
  return user;
}

// Generate one-time auth token for Telegram bot
router.post('/generate-auth-token', async (req, res) => {
  const { telegramId } = req.body;
  
  if (!telegramId) {
    return res.status(400).json({ error: 'Telegram ID required' });
  }
  
  // Generate random token
  const authToken = crypto.randomBytes(32).toString('hex');
  
  // Store token with 5 minute expiration
  authTokens.set(authToken, {
    telegramId: parseInt(telegramId),
    expiresAt: Date.now() + 5 * 60 * 1000
  });
  
  console.log('Generated auth token for telegram ID:', telegramId);
  
  res.json({ authToken });
});

// Exchange one-time token for JWT
router.post('/exchange-token', async (req, res) => {
  const { authToken } = req.body;
  
  if (!authToken) {
    return res.status(400).json({ error: 'Auth token required' });
  }
  
  const tokenData = authTokens.get(authToken);
  
  if (!tokenData) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  if (tokenData.expiresAt < Date.now()) {
    authTokens.delete(authToken);
    return res.status(401).json({ error: 'Token expired' });
  }
  
  // Delete token (one-time use)
  authTokens.delete(authToken);
  
  const telegramId = tokenData.telegramId;
  
  try {
    // Check if user exists
    let [users]: any = await pool.query('SELECT * FROM users WHERE telegram_id = ?', [telegramId]);
    
    let userId;
    if (users.length > 0) {
      userId = users[0].id;
    } else {
      // Create new user
      const [result]: any = await pool.query(
        'INSERT INTO users (telegram_id, name, email) VALUES (?, ?, ?)',
        [telegramId, `User${telegramId}`, `tg${telegramId}@telegram.user`]
      );
      userId = result.insertId;
      
      // Create default accounts
      const defaultAccounts = [
        ['Основной счёт', 'checking', 70, 'wallet'],
        ['Подушка безопасности', 'emergency', 20, 'savings'],
        ['Накопления', 'savings', 10, 'bank'],
      ];
      
      for (const [name, type, percentage, icon] of defaultAccounts) {
        await pool.query(
          'INSERT INTO accounts (user_id, name, type, percentage, icon) VALUES (?, ?, ?, ?, ?)',
          [userId, name, type, percentage, icon]
        );
      }
      
      // Create default categories
      const defaultCategories = [
        ['Salary', 'income', '💰', '#10b981'],
        ['Freelance', 'income', '💼', '#3b82f6'],
        ['Groceries', 'expense', '🛒', '#ef4444'],
        ['Utilities', 'expense', '⚡', '#f59e0b'],
        ['Entertainment', 'expense', '🎬', '#8b5cf6'],
        ['Transportation', 'expense', '🚗', '#06b6d4'],
        ['Healthcare', 'expense', '🏥', '#ec4899'],
      ];
      
      for (const [name, type, icon, color] of defaultCategories) {
        await pool.query(
          'INSERT INTO categories (user_id, name, type, icon, color) VALUES (?, ?, ?, ?, ?)',
          [userId, name, type, icon, color]
        );
      }
    }
    
    // Get user
    [users] = await pool.query('SELECT id, email, name, telegram_id, telegram_username FROM users WHERE id = ?', [userId]);
    const user = users[0];
    
    // Generate JWT
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
    
    console.log('Token exchanged successfully for user:', userId);
    res.json({ token, user });
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Telegram Login Widget (for website)
router.post('/telegram-widget', async (req, res) => {
  console.log('=== Telegram Widget Auth Start ===');
  console.log('Request body:', req.body);
  
  const { id, first_name, last_name, username, photo_url, auth_date, hash } = req.body;
  
  if (!id || !hash) {
    console.error('Missing id or hash');
    return res.status(400).json({ error: 'Invalid data' });
  }
  
  try {
    // Validate hash
    const checkData = Object.keys(req.body)
      .filter(key => key !== 'hash')
      .sort()
      .map(key => `${key}=${req.body[key]}`)
      .join('\n');
    
    console.log('Check data:', checkData);
    
    const secretKey = crypto.createHash('sha256').update(TELEGRAM_BOT_TOKEN).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(checkData).digest('hex');
    
    console.log('Calculated hash:', calculatedHash);
    console.log('Received hash:', hash);
    
    if (calculatedHash !== hash) {
      console.error('Widget hash mismatch');
      return res.status(401).json({ error: 'Invalid hash' });
    }
    
    const telegramId = parseInt(id);
    const name = `${first_name || ''} ${last_name || ''}`.trim() || username || `User${telegramId}`;
    
    console.log('Telegram widget auth:', { telegramId, username, name });
    
    // Check if user exists
    let [users]: any = await pool.query('SELECT * FROM users WHERE telegram_id = ?', [telegramId]);
    
    let userId;
    if (users.length > 0) {
      // User exists
      userId = users[0].id;
      await pool.query(
        'UPDATE users SET name = ?, telegram_username = ? WHERE id = ?',
        [name, username || '', userId]
      );
    } else {
      // Create new user
      const [result]: any = await pool.query(
        'INSERT INTO users (telegram_id, telegram_username, name, email) VALUES (?, ?, ?, ?)',
        [telegramId, username || '', name, `tg${telegramId}@telegram.user`]
      );
      userId = result.insertId;
      
      // Create default accounts
      const defaultAccounts = [
        ['Основной счёт', 'checking', 70, 'wallet'],
        ['Подушка безопасности', 'emergency', 20, 'savings'],
        ['Накопления', 'savings', 10, 'bank'],
      ];
      
      for (const [name, type, percentage, icon] of defaultAccounts) {
        await pool.query(
          'INSERT INTO accounts (user_id, name, type, percentage, icon) VALUES (?, ?, ?, ?, ?)',
          [userId, name, type, percentage, icon]
        );
      }
      
      // Create default categories
      const defaultCategories = [
        ['Salary', 'income', '💰', '#10b981'],
        ['Freelance', 'income', '💼', '#3b82f6'],
        ['Groceries', 'expense', '🛒', '#ef4444'],
        ['Utilities', 'expense', '⚡', '#f59e0b'],
        ['Entertainment', 'expense', '🎬', '#8b5cf6'],
        ['Transportation', 'expense', '🚗', '#06b6d4'],
        ['Healthcare', 'expense', '🏥', '#ec4899'],
      ];
      
      for (const [name, type, icon, color] of defaultCategories) {
        await pool.query(
          'INSERT INTO categories (user_id, name, type, icon, color) VALUES (?, ?, ?, ?, ?)',
          [userId, name, type, icon, color]
        );
      }
    }
    
    // Get user
    [users] = await pool.query('SELECT id, email, name, telegram_id, telegram_username FROM users WHERE id = ?', [userId]);
    const user = users[0];
    
    console.log('User retrieved:', user);
    
    // Generate token
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
    
    console.log('Token generated, sending response');
    console.log('=== Telegram Widget Auth Success ===');
    res.json({ token, user });
  } catch (error) {
    console.error('Telegram widget auth error:', error);
    console.log('=== Telegram Widget Auth Failed ===');
    res.status(401).json({ error: 'Authentication failed' });
  }
});

// Telegram Login (ONLY auth method)
router.post('/telegram', async (req, res) => {
  const { initData } = req.body;
  
  if (!initData) {
    return res.status(400).json({ error: 'Init data required' });
  }
  
  try {
    const telegramUser = validateTelegramWebAppData(initData);
    const telegramId = telegramUser.id;
    const firstName = telegramUser.first_name || '';
    const lastName = telegramUser.last_name || '';
    const username = telegramUser.username || '';
    const name = `${firstName} ${lastName}`.trim() || username || `User${telegramId}`;
    
    console.log('Telegram auth attempt:', { telegramId, username, name });
    
    // Check if user exists by telegram_id
    let [users]: any = await pool.query('SELECT * FROM users WHERE telegram_id = ?', [telegramId]);
    
    let userId;
    if (users.length > 0) {
      // User exists, update info
      userId = users[0].id;
      await pool.query(
        'UPDATE users SET name = ?, telegram_username = ? WHERE id = ?',
        [name, username, userId]
      );
      console.log('Existing Telegram user logged in:', userId);
    } else {
      // Create new user
      const [result]: any = await pool.query(
        'INSERT INTO users (telegram_id, telegram_username, name, email) VALUES (?, ?, ?, ?)',
        [telegramId, username, name, `tg${telegramId}@telegram.user`]
      );
      userId = result.insertId;
      console.log('New Telegram user created:', userId);
      
      // Create default accounts
      const defaultAccounts = [
        ['Основной счёт', 'checking', 70, 'wallet'],
        ['Подушка безопасности', 'emergency', 20, 'savings'],
        ['Накопления', 'savings', 10, 'bank'],
      ];
      
      for (const [name, type, percentage, icon] of defaultAccounts) {
        await pool.query(
          'INSERT INTO accounts (user_id, name, type, percentage, icon) VALUES (?, ?, ?, ?, ?)',
          [userId, name, type, percentage, icon]
        );
      }
      
      // Create default categories
      const defaultCategories = [
        ['Salary', 'income', '💰', '#10b981'],
        ['Freelance', 'income', '💼', '#3b82f6'],
        ['Groceries', 'expense', '🛒', '#ef4444'],
        ['Utilities', 'expense', '⚡', '#f59e0b'],
        ['Entertainment', 'expense', '🎬', '#8b5cf6'],
        ['Transportation', 'expense', '🚗', '#06b6d4'],
        ['Healthcare', 'expense', '🏥', '#ec4899'],
      ];
      
      for (const [name, type, icon, color] of defaultCategories) {
        await pool.query(
          'INSERT INTO categories (user_id, name, type, icon, color) VALUES (?, ?, ?, ?, ?)',
          [userId, name, type, icon, color]
        );
      }
    }
    
    // Get updated user
    [users] = await pool.query('SELECT id, email, name, telegram_id, telegram_username FROM users WHERE id = ?', [userId]);
    const user = users[0];
    
    // Generate token
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
    
    console.log('Telegram auth successful:', { userId, email: user.email });
    res.json({ token, user });
  } catch (error) {
    console.error('Telegram auth error:', error);
    res.status(401).json({ error: 'Telegram authentication failed', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const [users]: any = await pool.query(
      'SELECT id, email, name, telegram_id, telegram_username, created_at FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Test endpoint to check if backend is working
router.get('/test', async (req, res) => {
  res.json({ 
    status: 'ok',
    telegram_bot_configured: !!TELEGRAM_BOT_TOKEN && TELEGRAM_BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE',
    timestamp: new Date().toISOString()
  });
});

export default router;
