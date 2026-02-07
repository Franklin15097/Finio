import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { bot } from './bot/bot.js';
import { websiteRouter } from './website/routes.js';
import { miniAppRouter } from './mini-app/routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/website', websiteRouter);
app.use('/api/mini-app', miniAppRouter);

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
