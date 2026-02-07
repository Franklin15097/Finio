import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { bot } from './bot/bot.js';
import { websiteRouter } from './website/routes.js';
import { miniAppRouter } from './mini-app/routes.js';
import { initDatabase } from './db/postgres.js';
import { authenticateToken } from './middleware/auth.js';
import { transactionsRouter } from './api/transactions.js';
import { categoriesRouter } from './api/categories.js';
import { assetsRouter } from './api/assets.js';
import { statisticsRouter } from './api/statistics.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Serve static files from website-frontend
const websitePath = path.join(__dirname, '../website-frontend/dist');
app.use(express.static(websitePath));

// Serve mini-app static files
const miniAppPath = path.join(__dirname, '../mini-app-frontend/dist');
app.use('/mini-app', express.static(miniAppPath));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: 'postgresql' });
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(websitePath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database: PostgreSQL`);
});

// Start bot only if token is valid
if (process.env.BOT_TOKEN && process.env.BOT_TOKEN.length > 20) {
  try {
    bot.launch();
    console.log('Bot launched');
  } catch (error) {
    console.error('Bot launch error:', error.message);
  }
} else {
  console.log('Bot token not configured, skipping bot launch');
}

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
