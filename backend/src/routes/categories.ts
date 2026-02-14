import { Router } from 'express';
import pool from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM categories WHERE user_id = ? ORDER BY type, name',
      [req.userId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/:type', authenticate, async (req: AuthRequest, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM categories WHERE user_id = ? AND type = ? ORDER BY name',
      [req.userId, req.params.type]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { name, type, icon, color } = req.body;
  try {
    const [result]: any = await pool.query(
      'INSERT INTO categories (user_id, name, type, icon, color) VALUES (?, ?, ?, ?, ?)',
      [req.userId, name, type, icon || '💰', color || '#6366f1']
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  const { name, icon, color } = req.body;
  try {
    await pool.query(
      'UPDATE categories SET name = ?, icon = ?, color = ? WHERE id = ? AND user_id = ?',
      [name, icon, color, req.params.id, req.userId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
