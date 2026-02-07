import { Router } from 'express';
import { db } from '../db/database.js';

export const categoriesRouter = Router();

// Get all categories
categoriesRouter.get('/', async (req, res) => {
  try {
    const { userId } = req.user;
    const { type } = req.query;

    let query = 'SELECT * FROM categories WHERE user_id = ? OR user_id IS NULL';
    const params = [userId];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY name';

    const categories = await db.all(query, params);
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create category
categoriesRouter.post('/', async (req, res) => {
  try {
    const { userId } = req.user;
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await db.run(
      'INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)',
      [userId, name, type]
    );

    res.json({ id: result.lastID, message: 'Category created' });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Delete category
categoriesRouter.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    await db.run('DELETE FROM categories WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});
