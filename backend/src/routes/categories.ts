import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/:type', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories WHERE type = ?', [req.params.type]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
