# 🚀 Деплой на хостинг

## Подготовка к деплою

### 1. Создайте репозиторий на GitHub

```bash
# Если еще не создали
git remote add origin https://github.com/your-username/finio.git
git branch -M main
git push -u origin main
```

### 2. Установите зависимости локально

```bash
# Backend
cd server
npm install

# Website
cd ../website-frontend
npm install

# Mini App
cd ../mini-app-frontend
npm install
```

## 🌐 Варианты деплоя

### Вариант 1: Railway (Рекомендуется для Backend)

1. Зарегистрируйтесь на [Railway.app](https://railway.app)
2. Создайте новый проект
3. Подключите GitHub репозиторий
4. Выберите папку `server`
5. Добавьте переменные окружения:
   ```
   PORT=3000
   BOT_TOKEN=your_telegram_bot_token
   JWT_SECRET=your_secret_key
   NODE_ENV=production
   ```
6. Deploy автоматически запустится

### Вариант 2: Vercel (Для Frontend)

**Website:**
```bash
cd website-frontend
npm install -g vercel
vercel
```

**Mini App:**
```bash
cd mini-app-frontend
vercel
```

### Вариант 3: Heroku

```bash
# Установите Heroku CLI
heroku login
heroku create finio-backend

# Backend
cd server
git subtree push --prefix server heroku main

# Переменные окружения
heroku config:set BOT_TOKEN=your_token
heroku config:set JWT_SECRET=your_secret
heroku config:set NODE_ENV=production
```

### Вариант 4: VPS (Ubuntu)

```bash
# На сервере
git clone https://github.com/your-username/finio.git
cd finio/server
npm install
npm install -g pm2

# Создайте .env файл
nano .env

# Запустите с PM2
pm2 start index.js --name finio-backend
pm2 save
pm2 startup
```

## 📱 Настройка Telegram Bot

После деплоя backend:

1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте `/setmenubutton`
3. Выберите вашего бота
4. Отправьте URL вашего Mini App:
   ```
   https://your-mini-app.vercel.app
   ```

## 🔧 Переменные окружения

### Backend (.env)
```env
PORT=3000
BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
JWT_SECRET=super_secret_key_change_this_in_production
NODE_ENV=production
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend.railway.app/api
```

## ✅ Проверка деплоя

### Backend
```bash
curl https://your-backend.railway.app/health
# Должно вернуть: {"status":"ok"}
```

### Frontend
Откройте в браузере:
- Website: `https://your-website.vercel.app`
- Mini App: `https://your-mini-app.vercel.app`

## 🐛 Решение проблем

### Backend не запускается
- Проверьте логи: `heroku logs --tail` или в Railway dashboard
- Убедитесь что все переменные окружения установлены
- Проверьте что `npm install` прошел успешно

### Frontend не подключается к API
- Проверьте VITE_API_URL в .env
- Убедитесь что CORS настроен в backend
- Проверьте что backend доступен

### База данных не работает
- SQLite создается автоматически
- Для продакшн рекомендуется PostgreSQL
- Railway предоставляет бесплатную PostgreSQL

## 🔄 Обновление

```bash
# Локально
git add .
git commit -m "Update"
git push origin main

# Railway/Vercel автоматически задеплоят
```

## 💰 Стоимость

- **Railway**: $5/месяц (500 часов бесплатно)
- **Vercel**: Бесплатно для hobby проектов
- **Heroku**: $7/месяц (бесплатный tier убрали)
- **VPS**: От $5/месяц

## 📊 Мониторинг

- Railway: встроенный мониторинг
- Vercel: аналитика в dashboard
- PM2: `pm2 monit`
