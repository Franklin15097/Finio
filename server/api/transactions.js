import { Router } from 'express';
import { db } from '../db/database.js';

export const transactionsRouter = Router();

// Get all transactions with filters
transactionsRouter.get('/', async (req, res) => {
  try {
    const { userId } = req.user;
    const { type, category_id, date, search } = req.query;

    let query = 'SELECT t.*, c.name as category_name FROM transactions t LEFT JOIN categories c ON t.category_id = c.id WHERE t.user_id = ?';
    const params = [userId];

    if (type) {
      query += ' AND t.type = ?';
      params.push(type);
    }

    if (category_id) {
      query += ' AND t.category_id = ?';
      params.push(category_id);
    }

    if (date) {
      if (date.length === 7) { // YYYY-MM
        query += ' AND strftime("%Y-%m", t.transaction_date) = ?';
        params.push(date);
      } else if (date.length === 4) { // YYYY
        query += ' AND strftime("%Y", t.transaction_date) = ?';
        params.push(date);
      } else { // Full date
        query += ' AND DATE(t.transaction_date) = ?';
        params.push(date);
      }
    }

    if (search) {
      query += ' AND t.title LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY t.transaction_date DESC, t.id DESC';

    const transactions = await db.all(query, params);
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Create transaction
transactionsRouter.post('/', async (req, res) => {
  try {
    const { userId } = req.user;
    const { type, amount, title, category_id, transaction_date } = req.body;

    if (!type || !amount || !title || !transaction_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await db.run(
      'INSERT INTO transactions (user_id, type, amount, title, category_id, transaction_date) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, type, amount, title, category_id || null, transaction_date]
    );

    res.json({ id: result.lastID, message: 'Transaction created' });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Update transaction
transactionsRouter.put('/:id', async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const { type, amount, title, category_id, transaction_date } = req.body;

    await db.run(
      'UPDATE transactions SET type = ?, amount = ?, title = ?, category_id = ?, transaction_date = ? WHERE id = ? AND user_id = ?',
      [type, amount, title, category_id || null, transaction_date, id, userId]
    );

    res.json({ message: 'Transaction updated' });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Delete transaction
transactionsRouter.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    await db.run('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});
