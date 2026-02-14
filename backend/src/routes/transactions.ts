import { Router } from 'express';
import pool from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color, 
              a.name as account_name, a.color as account_color
       FROM transactions t 
       JOIN categories c ON t.category_id = c.id 
       JOIN accounts a ON t.account_id = a.id
       WHERE t.user_id = ?
       ORDER BY t.transaction_date DESC, t.created_at DESC
       LIMIT 100`,
      [req.userId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { account_id, category_id, amount, description, transaction_date } = req.body;
  try {
    const [result]: any = await pool.query(
      'INSERT INTO transactions (user_id, account_id, category_id, amount, description, transaction_date) VALUES (?, ?, ?, ?, ?, ?)',
      [req.userId, account_id, category_id, amount, description, transaction_date]
    );
    
    // Update account balance
    const [category]: any = await pool.query('SELECT type FROM categories WHERE id = ?', [category_id]);
    const balanceChange = category[0].type === 'income' ? amount : -amount;
    await pool.query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [balanceChange, account_id]);
    
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    // Get transaction details before deleting
    const [transactions]: any = await pool.query(
      'SELECT account_id, category_id, amount FROM transactions WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    
    if (transactions.length > 0) {
      const { account_id, category_id, amount } = transactions[0];
      
      // Reverse balance change
      const [category]: any = await pool.query('SELECT type FROM categories WHERE id = ?', [category_id]);
      const balanceChange = category[0].type === 'income' ? -amount : amount;
      await pool.query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [balanceChange, account_id]);
      
      // Delete transaction
      await pool.query('DELETE FROM transactions WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

export default router;
