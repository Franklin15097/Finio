# Настройка Telegram Mini App для Finio

## Шаг 1: Создание Telegram бота

1. Откройте Telegram и найдите [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newbot`
3. Введите имя бота (например: `Finio Finance`)
4. Введите username бота (например: `FinioFinanceBot`)
5. Сохраните полученный токен бота

## Шаг 2: Настройка Web App

1. Отправьте команду `/mybots` в BotFather
2. Выберите вашего бота
3. Нажмите `Bot Settings` → `Menu Button`
4. Выберите `Edit Menu Button URL`
5. Введите URL вашего приложения: `https://studiofinance.ru`
6. Введите текст кнопки: `Открыть Finio`

## Шаг 3: Настройка backend

1. Откройте файл `backend/.env`
2. Замените `YOUR_BOT_TOKEN_HERE` на токен вашего бота:
   ```
   TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

## Шаг 4: Миграция базы данных

Выполните SQL миграцию на сервере:

```bash
mysql -u app_user -p financial_db < backend/database/telegram_migration.sql
```

Или через MySQL клиент:
```sql
USE financial_db;
SOURCE backend/database/telegram_migration.sql;
```

## Шаг 5: Деплой обновлений

```bash
# На сервере
cd /var/www/finio
git pull
cd backend && npm run build
pm2 restart finio-backend

cd ../frontend && npm run build
# Nginx автоматически подхватит новые файлы
```

## Шаг 6: Тестирование

1. Откройте вашего бота в Telegram
2. Нажмите на кнопку меню (внизу слева)
3. Выберите "Открыть Finio"
4. Приложение должно открыться внутри Telegram

## Дополнительные настройки (опционально)

### Настройка описания бота
```
/setdescription
Finio - ваш личный финансовый помощник. Управляйте доходами, расходами и счетами прямо в Telegram!
```

### Настройка короткого описания
```
/setabouttext
Личный финансовый помощник в Telegram
```

### Добавление фото бота
```
/setuserpic
# Загрузите логотип Finio
```

## Проверка работы

После настройки проверьте:
- ✅ Бот открывается в Telegram
- ✅ Автоматическая авторизация через Telegram
- ✅ Все функции работают (доходы, расходы, счета)
- ✅ Графики отображаются корректно
- ✅ Тема адаптируется под Telegram

## Troubleshooting

### Ошибка "Invalid hash"
- Проверьте правильность TELEGRAM_BOT_TOKEN в .env
- Убедитесь, что токен не содержит лишних пробелов

### Приложение не открывается
- Проверьте URL в настройках Menu Button
- Убедитесь, что SSL сертификат валиден
- Проверьте логи: `pm2 logs finio-backend`

### Авторизация не работает
- Проверьте, что миграция БД выполнена
- Проверьте логи backend на ошибки
- Убедитесь, что Telegram Web App SDK загружается (проверьте консоль браузера)
