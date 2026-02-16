import { Router } from 'express';
import pool from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Получить статистику по категориям за период
router.get('/categories', authenticate, async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    let query = `
      SELECT 
        c.id,
        c.name,
        c.icon,
        c.color,
        c.type,
        COUNT(t.id) as transaction_count,
        SUM(t.amount) as total_amount,
        AVG(t.amount) as avg_amount,
        MIN(t.amount) as min_amount,
        MAX(t.amount) as max_amount
      FROM categories c
      LEFT JOIN transactions t ON c.id = t.category_id AND t.user_id = ?
    `;
    
    const params: any[] = [req.userId];
    
    if (startDate && endDate) {
      query += ` AND t.transaction_date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }
    
    query += ` WHERE c.user_id = ?`;
    params.push(req.userId);
    
    if (type) {
      query += ` AND c.type = ?`;
      params.push(type);
    }
    
    query += ` GROUP BY c.id ORDER BY total_amount DESC`;
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch category analytics:', error);
    res.status(500).json({ error: 'Failed to fetch category analytics' });
  }
});

// Тепловая карта расходов по дням недели
router.get('/heatmap', authenticate, async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = `
      SELECT 
        DAYOFWEEK(t.transaction_date) as day_of_week,
        HOUR(t.created_at) as hour_of_day,
        COUNT(*) as transaction_count,
        SUM(t.amount) as total_amount
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ? AND c.type = 'expense'
    `;
    
    const params: any[] = [req.userId];
    
    if (startDate && endDate) {
      query += ` AND t.transaction_date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }
    
    query += ` GROUP BY day_of_week, hour_of_day ORDER BY day_of_week, hour_of_day`;
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch heatmap data:', error);
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
});

// Сравнение периодов
router.get('/compare-periods', authenticate, async (req: AuthRequest, res) => {
  try {
    const { period1Start, period1End, period2Start, period2End } = req.query;
    
    const query = `
      SELECT 
        'period1' as period,
        SUM(CASE WHEN c.type = 'income' THEN t.amount ELSE 0 END) as total_income,
        SUM(CASE WHEN c.type = 'expense' THEN t.amount ELSE 0 END) as total_expense,
        COUNT(DISTINCT t.id) as transaction_count,
        COUNT(DISTINCT t.category_id) as categories_used
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ? AND t.transaction_date BETWEEN ? AND ?
      
      UNION ALL
      
      SELECT 
        'period2' as period,
        SUM(CASE WHEN c.type = 'income' THEN t.amount ELSE 0 END) as total_income,
        SUM(CASE WHEN c.type = 'expense' THEN t.amount ELSE 0 END) as total_expense,
        COUNT(DISTINCT t.id) as transaction_count,
        COUNT(DISTINCT t.category_id) as categories_used
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ? AND t.transaction_date BETWEEN ? AND ?
    `;
    
    const [rows] = await pool.query(query, [
      req.userId, period1Start, period1End,
      req.userId, period2Start, period2End
    ]);
    
    res.json(rows);
  } catch (error) {
    console.error('Failed to compare periods:', error);
    res.status(500).json({ error: 'Failed to compare periods' });
  }
});

// Прогнозирование баланса (простой линейный прогноз)
router.get('/forecast', authenticate, async (req: AuthRequest, res) => {
  try {
    const { days = 30 } = req.query;
    
    // Получаем данные за последние 90 дней для прогноза
    const [rows]: any = await pool.query(`
      SELECT 
        DATE(t.transaction_date) as date,
        SUM(CASE WHEN c.type = 'income' THEN t.amount ELSE -t.amount END) as daily_change
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ? 
        AND t.transaction_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
      GROUP BY DATE(t.transaction_date)
      ORDER BY date
    `, [req.userId]);
    
    // Вычисляем средний дневной баланс
    const avgDailyChange = rows.reduce((sum: number, row: any) => 
      sum + parseFloat(row.daily_change), 0) / (rows.length || 1);
    
    // Получаем текущий баланс
    const [balanceRows]: any = await pool.query(`
      SELECT 
        SUM(CASE WHEN c.type = 'income' THEN t.amount ELSE -t.amount END) as current_balance
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
    `, [req.userId]);
    
    const currentBalance = parseFloat(balanceRows[0]?.current_balance || 0);
    
    // Генерируем прогноз
    const forecast = [];
    for (let i = 1; i <= Number(days); i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      forecast.push({
        date: date.toISOString().split('T')[0],
        predicted_balance: currentBalance + (avgDailyChange * i),
        confidence: Math.max(0, 100 - (i * 2)) // Уверенность снижается со временем
      });
    }
    
    res.json({
      current_balance: currentBalance,
      avg_daily_change: avgDailyChange,
      forecast
    });
  } catch (error) {
    console.error('Failed to generate forecast:', error);
    res.status(500).json({ error: 'Failed to generate forecast' });
  }
});

// Топ категорий по расходам
router.get('/top-expenses', authenticate, async (req: AuthRequest, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    
    let query = `
      SELECT 
        c.id,
        c.name,
        c.icon,
        c.color,
        COUNT(t.id) as transaction_count,
        SUM(t.amount) as total_amount,
        AVG(t.amount) as avg_amount,
        (SUM(t.amount) / (
          SELECT SUM(t2.amount) 
          FROM transactions t2 
          JOIN categories c2 ON t2.category_id = c2.id 
          WHERE t2.user_id = ? AND c2.type = 'expense'
    `;
    
    const params: any[] = [req.userId, req.userId];
    
    if (startDate && endDate) {
      query += ` AND t2.transaction_date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }
    
    query += `
        ) * 100) as percentage
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ? AND c.type = 'expense'
    `;
    
    params.push(req.userId);
    
    if (startDate && endDate) {
      query += ` AND t.transaction_date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }
    
    query += ` GROUP BY c.id ORDER BY total_amount DESC LIMIT ?`;
    params.push(Number(limit));
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch top expenses:', error);
    res.status(500).json({ error: 'Failed to fetch top expenses' });
  }
});

// Экспорт данных в CSV
router.get('/export/csv', authenticate, async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = `
      SELECT 
        t.transaction_date as 'Дата',
        COALESCE(c.name, 'Без категории') as 'Категория',
        c.type as 'Тип',
        t.amount as 'Сумма',
        t.description as 'Описание'
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
    `;
    
    const params: any[] = [req.userId];
    
    if (startDate && endDate) {
      query += ` AND t.transaction_date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }
    
    query += ` ORDER BY t.transaction_date DESC`;
    
    const [rows]: any = await pool.query(query, params);
    
    // Формируем CSV
    const headers = Object.keys(rows[0] || {});
    const csv = [
      headers.join(','),
      ...rows.map((row: any) => 
        headers.map(header => {
          const value = row[header];
          // Экранируем запятые и кавычки
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="transactions_${Date.now()}.csv"`);
    res.send('\uFEFF' + csv); // BOM для корректного отображения кириллицы
  } catch (error) {
    console.error('Failed to export CSV:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// Анализ трендов
router.get('/trends', authenticate, async (req: AuthRequest, res) => {
  try {
    const { period = 'month' } = req.query; // day, week, month
    
    let dateFormat = '%Y-%m-%d';
    let interval = 'DAY';
    
    if (period === 'week') {
      dateFormat = '%Y-%u';
      interval = 'WEEK';
    } else if (period === 'month') {
      dateFormat = '%Y-%m';
      interval = 'MONTH';
    }
    
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(t.transaction_date, ?) as period,
        SUM(CASE WHEN c.type = 'income' THEN t.amount ELSE 0 END) as income,
        SUM(CASE WHEN c.type = 'expense' THEN t.amount ELSE 0 END) as expense,
        SUM(CASE WHEN c.type = 'income' THEN t.amount ELSE -t.amount END) as balance
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
        AND t.transaction_date >= DATE_SUB(CURDATE(), INTERVAL 12 ${interval})
      GROUP BY period
      ORDER BY period
    `, [dateFormat, req.userId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

export default router;
