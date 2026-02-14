import { Router } from 'express';
import pool from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color FROM budgets b JOIN categories c ON b.category_id = c.id WHERE b.user_id = ?',
      [req.userId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { category_id, limit_amount, month, year } = req.body;
  try {
    const [result]: any = await pool.query(
      'INSERT INTO budgets (user_id, category_id, limit_amount, month, year) VALUES (?, ?, ?, ?, ?)',
      [req.userId, category_id, limit_amount, month, year]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

export default router;
