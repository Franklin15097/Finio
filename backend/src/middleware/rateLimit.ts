import rateLimit from 'express-rate-limit';

// Общий лимит для всех API запросов
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов за 15 минут
  message: { error: 'Слишком много запросов, попробуйте позже' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Пропускаем health check
    return req.path === '/api/health';
  }
});

// Строгий лимит для авторизации
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 10, // максимум 10 попыток авторизации за 15 минут
  message: { error: 'Слишком много попыток авторизации, попробуйте позже' },
  standardHeaders: true,
  legacyHeaders: false
});

// Лимит для создания записей
export const createLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 минута
  max: 30, // максимум 30 создания за минуту
  message: { error: 'Слишком много операций создания, подождите немного' },
  standardHeaders: true,
  legacyHeaders: false
});

// Лимит для экспорта данных
export const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 10, // максимум 10 экспортов за час
  message: { error: 'Слишком много экспортов, попробуйте позже' },
  standardHeaders: true,
  legacyHeaders: false
});
