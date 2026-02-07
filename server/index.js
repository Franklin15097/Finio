import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { bot } from './bot/bot.js';
import { websiteRouter } from './website/routes.js';
import { miniAppRouter } from './mini-app/routes.js';
import { initDatabase } from './db/database.js';
import { authenticateToken } from './middleware/auth.js';
import { transactionsRouter } from './api/transactions.js';
import { categoriesRouter } from './api/categories.js';
import { assetsRouter } from './api/assets.js';
import { statisticsRouter } from './api/statistics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize database
await initDatabase();

// Public routes
app.use('/api/website', websiteRouter);
app.use('/api/mini-app', miniAppRouter);

// Protected API routes
app.use('/api/transactions', authenticateToken, transactionsRouter);
app.use('/api/categories', authenticateToken, categoriesRouter);
app.use('/api/assets', authenticateToken, assetsRouter);
app.use('/api/statistics', authenticateToken, statisticsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Start bot
bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
