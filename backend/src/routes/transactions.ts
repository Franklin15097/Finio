import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT t.*, c.name as category_name FROM transactions t JOIN categories c ON t.category_id = c.id ORDER BY t.transaction_date DESC'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.post('/', async (req, res) => {
  const { category_id, amount, description, transaction_date } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO transactions (category_id, amount, description, transaction_date) VALUES (?, ?, ?, ?)',
      [category_id, amount, description, transaction_date]
    );
    res.status(201).json({ id: (result as any).insertId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

export default router;
