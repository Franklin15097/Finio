import { Router } from 'express';
import pool from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/stats', authenticate, async (req: AuthRequest, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Total balance across all accounts
    const [balanceResult]: any = await pool.query(
      'SELECT COALESCE(SUM(balance), 0) as total_balance FROM accounts WHERE user_id = ?',
      [req.userId]
    );

    // Income this month
    const [incomeResult]: any = await pool.query(
      `SELECT COALESCE(SUM(t.amount), 0) as total_income 
       FROM transactions t 
       JOIN categories c ON t.category_id = c.id 
       WHERE t.user_id = ? AND c.type = 'income' 
       AND MONTH(t.transaction_date) = ? AND YEAR(t.transaction_date) = ?`,
      [req.userId, currentMonth, currentYear]
    );

    // Expenses this month
    const [expenseResult]: any = await pool.query(
      `SELECT COALESCE(SUM(t.amount), 0) as total_expense 
       FROM transactions t 
       JOIN categories c ON t.category_id = c.id 
       WHERE t.user_id = ? AND c.type = 'expense' 
       AND MONTH(t.transaction_date) = ? AND YEAR(t.transaction_date) = ?`,
      [req.userId, currentMonth, currentYear]
    );

    // Expenses by category this month
    const [categoryExpenses]: any = await pool.query(
      `SELECT c.name, c.icon, c.color, COALESCE(SUM(t.amount), 0) as total 
       FROM categories c 
       LEFT JOIN transactions t ON c.id = t.category_id 
         AND MONTH(t.transaction_date) = ? AND YEAR(t.transaction_date) = ?
       WHERE c.user_id = ? AND c.type = 'expense'
       GROUP BY c.id, c.name, c.icon, c.color
       ORDER BY total DESC
       LIMIT 10`,
      [currentMonth, currentYear, req.userId]
    );

    // Recent transactions
    const [recentTransactions]: any = await pool.query(
      `SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color,
              a.name as account_name, c.type as transaction_type
       FROM transactions t 
       JOIN categories c ON t.category_id = c.id 
       JOIN accounts a ON t.account_id = a.id
       WHERE t.user_id = ?
       ORDER BY t.transaction_date DESC, t.created_at DESC
       LIMIT 5`,
      [req.userId]
    );

    // Monthly trend (last 6 months)
    const [monthlyTrend]: any = await pool.query(
      `SELECT 
         DATE_FORMAT(t.transaction_date, '%Y-%m') as month,
         c.type,
         SUM(t.amount) as total
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = ? AND t.transaction_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY month, c.type
       ORDER BY month`,
      [req.userId]
    );

    res.json({
      totalBalance: parseFloat(balanceResult[0].total_balance),
      monthlyIncome: parseFloat(incomeResult[0].total_income),
      monthlyExpense: parseFloat(expenseResult[0].total_expense),
      categoryExpenses,
      recentTransactions,
      monthlyTrend
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
