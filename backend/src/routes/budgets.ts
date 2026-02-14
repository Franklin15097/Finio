import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT b.*, c.name as category_name FROM budgets b JOIN categories c ON b.category_id = c.id'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

router.post('/', async (req, res) => {
  const { category_id, limit_amount, month, year } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO budgets (category_id, limit_amount, month, year) VALUES (?, ?, ?, ?)',
      [category_id, limit_amount, month, year]
    );
    res.status(201).json({ id: (result as any).insertId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

export default router;
