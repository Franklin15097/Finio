import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import pool from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

// Validate Telegram Web App data
function validateTelegramWebAppData(initData: string): any {
  // Skip validation in development if no token
  if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
    console.warn('⚠️  Telegram validation skipped - no bot token configured');
    // Try to parse user data anyway for development
    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get('user');
    if (userParam) {
      return JSON.parse(userParam);
    }
    throw new Error('No user data in initData');
  }

  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  
  if (!hash) {
    throw new Error('No hash in initData');
  }
  
  urlParams.delete('hash');
  
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(TELEGRAM_BOT_TOKEN).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  
  if (calculatedHash !== hash) {
    console.error('Hash mismatch:', { calculated: calculatedHash, received: hash });
    throw new Error('Invalid hash');
  }
  
  const userParam = urlParams.get('user');
  if (!userParam) {
    throw new Error('No user data');
  }
  
  return JSON.parse(userParam);
}

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

export default router;
