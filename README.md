# Studio Finance

Telegram Mini App + Website + Backend

## Быстрый старт на сервере

```bash
ssh root@85.235.205.99
cd /var/www/studiofinance
./install.sh
```

## Управление

```bash
pm2 status          # Статус
pm2 logs            # Логи
pm2 restart all     # Перезапуск
./start.sh          # Быстрый перезапуск
```

## URLs

- Backend: http://85.235.205.99:3000/health
- Mini App: http://studiofinance.ru:5173
- Website: http://studiofinance.ru:5174
- Bot: @FranklinFAT

## Настройка бота

@BotFather → /mybots → Bot Settings → Menu Button
URL: `http://studiofinance.ru:5173`
