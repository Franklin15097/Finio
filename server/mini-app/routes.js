import express from 'express';

export const miniAppRouter = express.Router();

miniAppRouter.get('/user/:telegramId', (req, res) => {
  const { telegramId } = req.params;
  // TODO: Получение данных пользователя из БД
  res.json({
    telegramId,
    balance: 0
  });
});

miniAppRouter.post('/action', (req, res) => {
  const { telegramId, action } = req.body;
  // TODO: Обработка действий пользователя
  res.json({ success: true });
});
