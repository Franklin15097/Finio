import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import pool from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register
router.post('/register',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    try {
      // Check if user exists
      const [existing]: any = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Create user
      const [result]: any = await pool.query(
        'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
        [email, password_hash, name]
      );

      const userId = result.insertId;

      // Create default account
      await pool.query(
        'INSERT INTO accounts (user_id, name, type, balance, color) VALUES (?, ?, ?, ?, ?)',
        [userId, 'Main Account', 'cash', 0, '#6366f1']
      );

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

      // Generate token
      const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });

      res.status(201).json({ token, user: { id: userId, email, name } });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// Login
router.post('/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const [users]: any = await pool.query(
        'SELECT id, email, name, password_hash FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = users[0];
      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

      res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// Get current user
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const [users]: any = await pool.query(
      'SELECT id, email, name, created_at FROM users WHERE id = ?',
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
