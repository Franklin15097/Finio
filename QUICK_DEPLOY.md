# 🚀 Быстрый деплой Finio

## Для спешащих разработчиков

### 1. Подготовка хостинга
- Ubuntu 22.04+ с root доступом
- Домен с DNS записями на ваш сервер
- Токен Telegram бота `FinanceStudio_bot`

### 2. Одна команда для установки

```bash
# Клонируем и устанавливаем
git clone https://github.com/Franklin15097/Finio.git && cd Finio
chmod +x install.sh
sudo ./install.sh your-domain.com your-telegram-bot-token
```

**Замените:**
- `your-domain.com` - на ваш домен
- `your-telegram-bot-token` - на токен от @BotFather

### 3. Готово! 🎉

После установки доступно:
- 🌐 **Сайт**: https://your-domain.com
- 🔧 **API**: https://your-domain.com/api/v1/docs  
- 🤖 **Бот**: @FinanceStudio_bot в Telegram

### 4. Обновление

```bash
cd Finio && sudo ./update.sh
```

---

## Что делает автоматический скрипт

✅ Устанавливает все зависимости (Python, Node.js, PostgreSQL, Nginx)  
✅ Настраивает базу данных с безопасным паролем  
✅ Собирает и деплоит frontend  
✅ Настраивает SSL сертификат (Let's Encrypt)  
✅ Создает systemd сервисы для автозапуска  
✅ Настраивает Telegram webhook  
✅ Настраивает автоматические бэкапы  
✅ Настраивает firewall  

## Если что-то пошло не так

1. **Проверьте логи:**
   ```bash
   sudo journalctl -u finio -f
   tail -f /var/log/finio/error.log
   ```

2. **Проверьте статус сервисов:**
   ```bash
   sudo systemctl status finio
   sudo systemctl status nginx
   sudo systemctl status postgresql
   ```

3. **Проверьте webhook бота:**
   ```bash
   curl "https://api.telegram.org/botYOUR_TOKEN/getWebhookInfo"
   ```

## Полная документация

Подробные инструкции смотрите в [INSTALLATION.md](INSTALLATION.md)