import { Router } from 'express';
import pool from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get all accounts for user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Create account
router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { name, type, balance, currency, color, icon } = req.body;
  try {
    const [result]: any = await pool.query(
      'INSERT INTO accounts (user_id, name, type, balance, currency, color, icon) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.userId, name, type, balance || 0, currency || 'USD', color || '#6366f1', icon || 'wallet']
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Update account
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  const { name, type, balance, currency, color, icon } = req.body;
  try {
    await pool.query(
      'UPDATE accounts SET name = ?, type = ?, balance = ?, currency = ?, color = ?, icon = ? WHERE id = ? AND user_id = ?',
      [name, type, balance, currency, color, icon, req.params.id, req.userId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update account' });
  }
});

// Delete account
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    await pool.query('DELETE FROM accounts WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
