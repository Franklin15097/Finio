# 🚀 Быстрый деплой Studio Finance

## ✅ Проверка данных

Все данные указаны верно:
- ✓ IP сервера: 85.235.205.99
- ✓ Домен: studiofinance.ru
- ✓ Bot Token: 8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34
- ✓ Telegram ID: @FranklinFAT (1086679273)
- ✓ Email: maks50kucherenko@gmail.com
- ✓ База данных: finio (host: 85.235.205.99, user: finio_user, password: maks15097)

## 📦 Репозиторий

Проект загружен в: https://github.com/Franklin15097/Finio

---

## 🎯 ОДНА КОМАНДА ДЛЯ ПОЛНОГО ДЕПЛОЯ

Подключитесь к серверу и выполните:

```bash
ssh root@85.235.205.99
```

Затем выполните эту команду:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
apt install -y nodejs git && \
npm install -g pm2 && \
cd /var/www && \
rm -rf studiofinance && \
git clone https://github.com/Franklin15097/Finio.git studiofinance && \
cd studiofinance && \
chmod +x install.sh start.sh stop.sh && \
cd server && npm install && cd .. && \
cd mini-app-frontend && npm install && cd .. && \
cd website-frontend && npm install && cd .. && \
cd server && pm2 start index.js --name studiofinance-backend && cd .. && \
cd mini-app-frontend && pm2 start "npm run dev" --name studiofinance-miniapp && cd .. && \
cd website-frontend && pm2 start "npm run dev" --name studiofinance-website && cd .. && \
pm2 save && pm2 startup && \
echo "" && \
echo "✅ ДЕПЛОЙ ЗАВЕРШЕН!" && \
echo "" && \
echo "🌐 Сервисы запущены:" && \
echo "  Backend API: http://85.235.205.99:3000/health" && \
echo "  Mini App:    http://studiofinance.ru:5173" && \
echo "  Website:     http://studiofinance.ru:5174" && \
echo "" && \
echo "🤖 Telegram Bot: @FranklinFAT" && \
echo "   Команда: /start" && \
echo "" && \
pm2 status
```

---

## 📋 Что делает эта команда:

1. ✅ Устанавливает Node.js 20.x
2. ✅ Устанавливает Git и PM2
3. ✅ Клонирует репозиторий в /var/www/studiofinance
4. ✅ Устанавливает все зависимости (server, mini-app, website)
5. ✅ Запускает все сервисы через PM2
6. ✅ Настраивает автозапуск при перезагрузке сервера

---

## 🔧 Настройка Telegram Bot

После деплоя настройте Mini App в BotFather:

1. Откройте @BotFather в Telegram
2. Отправьте: `/mybots`
3. Выберите вашего бота
4. Нажмите "Bot Settings" → "Menu Button"
5. Укажите URL: `http://studiofinance.ru:5173`
6. Укажите текст: "Открыть приложение"

---

## 🎮 Управление проектом

```bash
# Просмотр статуса
pm2 status

# Просмотр логов
pm2 logs

# Перезапуск всех сервисов
pm2 restart all

# Остановка всех сервисов
pm2 stop all

# Обновление из Git
cd /var/www/studiofinance
git pull
./install.sh
pm2 restart all
```

---

## 🧪 Проверка работы

После деплоя проверьте:

```bash
# Проверка Backend
curl http://localhost:3000/health

# Проверка портов
netstat -tulpn | grep -E '3000|5173|5174'

# Проверка PM2
pm2 status
```

Откройте в браузере:
- Backend: http://85.235.205.99:3000/health
- Mini App: http://studiofinance.ru:5173
- Website: http://studiofinance.ru:5174

Telegram Bot:
- Найдите @FranklinFAT
- Отправьте /start
- Нажмите кнопку "Открыть приложение"

---

## 🐛 Решение проблем

### Если порты заняты:
```bash
pm2 delete all
killall node
# Затем запустите снова
```

### Если нужно изменить порты:
Отредактируйте файлы:
- `server/.env` - PORT=3000
- `mini-app-frontend/vite.config.js` - port: 5173
- `website-frontend/vite.config.js` - port: 5174

### Просмотр логов:
```bash
pm2 logs studiofinance-backend
pm2 logs studiofinance-miniapp
pm2 logs studiofinance-website
```

---

## 📞 Контакты

- Email: maks50kucherenko@gmail.com
- Telegram: @FranklinFAT
- Сервер: 85.235.205.99
- Репозиторий: https://github.com/Franklin15097/Finio
