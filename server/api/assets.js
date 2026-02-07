import { Router } from 'express';
import { db } from '../db/database.js';

export const assetsRouter = Router();

// Get all assets
assetsRouter.get('/', async (req, res) => {
  try {
    const { userId } = req.user;
    const assets = await db.all(
      'SELECT * FROM assets WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(assets);
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// Create asset
assetsRouter.post('/', async (req, res) => {
  try {
    const { userId } = req.user;
    const { name, balance, type } = req.body;

    if (!name || balance === undefined || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await db.run(
      'INSERT INTO assets (user_id, name, balance, type) VALUES (?, ?, ?, ?)',
      [userId, name, balance, type]
    );

    res.json({ id: result.lastID, message: 'Asset created' });
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

// Update asset
assetsRouter.put('/:id', async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const { name, balance, type } = req.body;

    await db.run(
      'UPDATE assets SET name = ?, balance = ?, type = ? WHERE id = ? AND user_id = ?',
      [name, balance, type, id, userId]
    );

    res.json({ message: 'Asset updated' });
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({ error: 'Failed to update asset' });
  }
});

// Delete asset
assetsRouter.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    await db.run('DELETE FROM assets WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Asset deleted' });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});
