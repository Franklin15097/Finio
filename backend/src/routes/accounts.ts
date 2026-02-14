import { Router } from 'express';
import pool from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get all accounts for user with calculated planned balance
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    // Get total income
    const [incomeResult]: any = await pool.query(
      `SELECT COALESCE(SUM(t.amount), 0) as total_income 
       FROM transactions t 
       JOIN categories c ON t.category_id = c.id 
       WHERE t.user_id = ? AND c.type = 'income'`,
      [req.userId]
    );
    
    const totalIncome = parseFloat(incomeResult[0].total_income);

    // Get accounts
    const [accounts]: any = await pool.query(
      'SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at ASC',
      [req.userId]
    );

    // Calculate planned balance for each account
    const accountsWithPlanned = accounts.map((acc: any) => ({
      ...acc,
      planned_balance: (totalIncome * parseFloat(acc.percentage)) / 100
    }));

    res.json(accountsWithPlanned);
  } catch (error) {
    console.error('Failed to fetch accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Create account
router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { name, type, percentage, currency, color, icon } = req.body;
  try {
    const [result]: any = await pool.query(
      'INSERT INTO accounts (user_id, name, type, percentage, currency, color, icon) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.userId, name, type, percentage || 0, currency || 'USD', color || '#6366f1', icon || 'wallet']
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('Failed to create account:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Update account
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  const { name, type, percentage, actual_balance, currency, color, icon } = req.body;
  try {
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (type !== undefined) { updates.push('type = ?'); values.push(type); }
    if (percentage !== undefined) { updates.push('percentage = ?'); values.push(percentage); }
    if (actual_balance !== undefined) { updates.push('actual_balance = ?'); values.push(actual_balance); }
    if (currency !== undefined) { updates.push('currency = ?'); values.push(currency); }
    if (color !== undefined) { updates.push('color = ?'); values.push(color); }
    if (icon !== undefined) { updates.push('icon = ?'); values.push(icon); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.params.id, req.userId);

    await pool.query(
      `UPDATE accounts SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update account:', error);
    res.status(500).json({ error: 'Failed to update account' });
  }
});

// Delete account
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    await pool.query('DELETE FROM accounts WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
