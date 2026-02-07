import { Router } from 'express';
import { db } from '../db/database.js';

export const statisticsRouter = Router();

// Get dashboard stats
statisticsRouter.get('/dashboard', async (req, res) => {
  try {
    const { userId } = req.user;

    // Total balance from assets
    const balanceResult = await db.get(
      'SELECT COALESCE(SUM(balance), 0) as total FROM assets WHERE user_id = ?',
      [userId]
    );

    // Income this month
    const incomeResult = await db.get(
      `SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
       WHERE user_id = ? AND type = 'income' 
       AND strftime('%Y-%m', transaction_date) = strftime('%Y-%m', 'now')`,
      [userId]
    );

    // Expenses this month
    const expenseResult = await db.get(
      `SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
       WHERE user_id = ? AND type = 'expense' 
       AND strftime('%Y-%m', transaction_date) = strftime('%Y-%m', 'now')`,
      [userId]
    );

    res.json({
      balance: balanceResult.total,
      income: incomeResult.total,
      expense: expenseResult.total
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get timeline data for charts
statisticsRouter.get('/timeline', async (req, res) => {
  try {
    const { userId } = req.user;
    const { period = 'month' } = req.query;

    let dateFormat = '%Y-%m-%d';
    let dateFilter = "strftime('%Y-%m', transaction_date) = strftime('%Y-%m', 'now')";

    if (period === 'year') {
      dateFormat = '%Y-%m';
      dateFilter = "strftime('%Y', transaction_date) = strftime('%Y', 'now')";
    } else if (period === 'all') {
      dateFormat = '%Y-%m';
      dateFilter = '1=1';
    }

    const transactions = await db.all(
      `SELECT strftime('${dateFormat}', transaction_date) as date, type, SUM(amount) as total
       FROM transactions 
       WHERE user_id = ? AND ${dateFilter}
       GROUP BY date, type
       ORDER BY date`,
      [userId]
    );

    // Format data for chart
    const dates = [...new Set(transactions.map(t => t.date))].sort();
    const income = dates.map(date => {
      const t = transactions.find(tr => tr.date === date && tr.type === 'income');
      return t ? t.total : 0;
    });
    const expense = dates.map(date => {
      const t = transactions.find(tr => tr.date === date && tr.type === 'expense');
      return t ? t.total : 0;
    });

    res.json({ labels: dates, income, expense });
  } catch (error) {
    console.error('Get timeline error:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

// Get categories breakdown
statisticsRouter.get('/categories', async (req, res) => {
  try {
    const { userId } = req.user;
    const { type = 'expense' } = req.query;

    const categories = await db.all(
      `SELECT c.name, COALESCE(SUM(t.amount), 0) as total
       FROM categories c
       LEFT JOIN transactions t ON c.id = t.category_id AND t.user_id = ? AND t.type = ?
       WHERE c.user_id = ? OR c.user_id IS NULL
       GROUP BY c.id, c.name
       HAVING total > 0
       ORDER BY total DESC
       LIMIT 10`,
      [userId, type, userId]
    );

    res.json({
      labels: categories.map(c => c.name),
      values: categories.map(c => c.total)
    });
  } catch (error) {
    console.error('Get categories stats error:', error);
    res.status(500).json({ error: 'Failed to fetch category statistics' });
  }
});
