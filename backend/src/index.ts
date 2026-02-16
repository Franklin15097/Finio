import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env FIRST before any other imports
dotenv.config({ path: path.join(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import morgan from 'morgan';
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import categoryRoutes from './routes/categories.js';
import budgetRoutes from './routes/budgets.js';
import accountRoutes from './routes/accounts.js';
import dashboardRoutes from './routes/dashboard.js';
import analyticsRoutes from './routes/analytics.js';
import { setupSocket } from './socket.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { log, requestLogger, errorLogger, stream } from './logger.js';

log.info('Environment loaded:', {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  dbName: process.env.DB_NAME,
  telegramBotConfigured: !!process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  frontendUrl: process.env.FRONTEND_URL
});

const app = express();
const PORT = process.env.PORT || 5000;

// Создаем HTTP сервер для WebSocket
const server = createServer(app);

// Настраиваем WebSocket
const io = setupSocket(server);

// Делаем io доступным в routes через app
app.set('io', io);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(express.json());

// Логирование HTTP запросов
app.use(morgan('combined', { stream }));
app.use(requestLogger);

// Rate limiting для всех API запросов
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'finio-backend',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    websocket: 'enabled',
    redis: process.env.REDIS_URL ? 'configured' : 'not configured',
    database: process.env.DB_NAME ? 'configured' : 'not configured',
    telegramBot: !!process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE' ? 'configured' : 'not configured'
  };
  
  log.info('Health check requested', { ip: req.ip, userAgent: req.get('user-agent') });
  res.json(health);
});

// Расширенная метрика
app.get('/api/metrics', (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    system: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      memory: {
        rss: process.memoryUsage().rss,
        heapTotal: process.memoryUsage().heapTotal,
        heapUsed: process.memoryUsage().heapUsed,
        external: process.memoryUsage().external
      },
      cpu: process.cpuUsage(),
      uptime: process.uptime()
    },
    application: {
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      features: {
        websocket: true,
        redis: !!process.env.REDIS_URL,
        rateLimiting: true,
        structuredLogging: true,
        telegramIntegration: !!process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE'
      }
    }
  };
  
  res.json(metrics);
});

// Глобальный обработчик ошибок
app.use(errorLogger);
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  log.error('Unhandled error in request', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    userId: (req as any).userId || 'anonymous',
    ip: req.ip
  });
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

server.listen(PORT, () => {
  log.info('Server started successfully', {
    port: PORT,
    nodeEnv: process.env.NODE_ENV,
    features: {
      websocket: true,
      rateLimiting: true,
      structuredLogging: true,
      redis: !!process.env.REDIS_URL,
      telegramBot: !!process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE'
    }
  });
});
