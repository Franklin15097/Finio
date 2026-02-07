# 🚀 Установка Finio одной командой

## Команда для полной установки с нуля:

```bash
curl -sSL https://raw.githubusercontent.com/Franklin15097/Finio/main/deploy.sh | sudo bash
```

## Что делает эта команда:

1. **Полная очистка** - удаляет все старые контейнеры, образы, тома
2. **Установка зависимостей** - Docker, Docker Compose
3. **Загрузка проекта** - клонирует репозиторий
4. **Сборка и запуск** - собирает и запускает все сервисы
5. **Настройка автозапуска** - создает systemd сервис
6. **Тестирование** - проверяет работоспособность

## После установки:

- **Сайт**: http://your-server:8080
- **API**: http://your-server:8080/api
- **Mini App**: http://your-server:8080/miniapp

## Управление:

```bash
# Статус
docker-compose ps

# Логи
docker-compose logs

# Перезапуск
systemctl restart finio
```

---

**Готово! Одна команда - и всё работает! 🎉**