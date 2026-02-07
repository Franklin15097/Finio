import express from 'express';

export const websiteRouter = express.Router();

websiteRouter.get('/info', (req, res) => {
  res.json({
    name: 'Studio Finance',
    description: 'Финансовая платформа'
  });
});

websiteRouter.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  // TODO: Обработка контактной формы
  res.json({ success: true });
});
