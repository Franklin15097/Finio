import { Router } from 'express';
import pool from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import { createTransactionSchema, updateTransactionSchema } from '../validators/transaction.js';
import { createLimiter } from '../middleware/rateLimit.js';
import { cache } from '../redis.js';
import type { Server } from 'socket.io';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    // Проверяем кэш
    const cacheKey = `transactions:${req.userId}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const [rows] = await pool.query(
      `SELECT t.*, 
              COALESCE(c.name, 'Без категории') as category_name, 
              COALESCE(c.icon, 'DollarSign') as category_icon, 
              COALESCE(c.color, '#6366f1') as category_color, 
              COALESCE(c.type, 
                CASE WHEN t.amount > 0 THEN 'income' ELSE 'expense' END
              ) as transaction_type
       FROM transactions t 
       LEFT JOIN categories c ON t.category_id = c.id 
       WHERE t.user_id = ?
       ORDER BY t.transaction_date DESC, t.created_at DESC
       LIMIT 100`,
      [req.userId]
    );
    
    // Сохраняем в кэш на 1 минуту
    await cache.set(cacheKey, rows, 60);
    
    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.post('/', authenticate, createLimiter, validate(createTransactionSchema), async (req: AuthRequest, res) => {
  const { category_id, amount, description, transaction_date } = req.body;
  
  console.log('Creating transaction:', { category_id, amount, description, transaction_date, userId: req.userId });
  
  try {
    // Validate category exists and belongs to user if provided
    let categoryType = null;
    if (category_id) {
      const [categoryRows]: any = await pool.query(
        'SELECT id, type FROM categories WHERE id = ? AND user_id = ?',
        [category_id, req.userId]
      );
      
      if (categoryRows.length === 0) {
        return res.status(400).json({ error: 'Invalid category' });
      }
      categoryType = categoryRows[0].type;
    }
    
    const [result]: any = await pool.query(
      'INSERT INTO transactions (user_id, category_id, amount, description, transaction_date) VALUES (?, ?, ?, ?, ?)',
      [req.userId, category_id || null, amount, description, transaction_date]
    );
    
    console.log('Transaction created successfully:', result.insertId);
    
    // Инвалидируем кэш
    await cache.delete(`transactions:${req.userId}`);
    await cache.invalidatePattern(`dashboard:${req.userId}*`);
    
    // Отправляем WebSocket уведомление
    const io: Server = req.app.get('io');
    if (io) {
      io.to(`user:${req.userId}`).emit('transaction:created', {
        id: result.insertId,
        amount,
        description,
        category_id,
        transaction_date,
        type: categoryType,
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

router.put('/:id', authenticate, validate(updateTransactionSchema), async (req: AuthRequest, res) => {
  const { category_id, amount, description, transaction_date } = req.body;
  try {
    const updates: string[] = [];
    const values: any[] = [];

    if (category_id !== undefined) { updates.push('category_id = ?'); values.push(category_id); }
    if (amount !== undefined) { updates.push('amount = ?'); values.push(amount); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (transaction_date !== undefined) { updates.push('transaction_date = ?'); values.push(transaction_date); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.params.id, req.userId);

    await pool.query(
      `UPDATE transactions SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );
    
    // Инвалидируем кэш
    await cache.delete(`transactions:${req.userId}`);
    await cache.invalidatePattern(`dashboard:${req.userId}*`);
    
    // Отправляем WebSocket уведомление
    const io: Server = req.app.get('io');
    if (io) {
      io.to(`user:${req.userId}`).emit('transaction:updated', {
        id: req.params.id,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    await pool.query('DELETE FROM transactions WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    
    // Инвалидируем кэш
    await cache.delete(`transactions:${req.userId}`);
    await cache.invalidatePattern(`dashboard:${req.userId}*`);
    
    // Отправляем WebSocket уведомление
    const io: Server = req.app.get('io');
    if (io) {
      io.to(`user:${req.userId}`).emit('transaction:deleted', {
        id: req.params.id,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

export default router;
