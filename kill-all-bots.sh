#!/bin/bash

echo "🔥 УБИВАЕМ ВСЕ ПРОЦЕССЫ БОТА..."

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Запустите скрипт с правами root: sudo $0"
    exit 1
fi

echo "🔍 Поиск всех процессов связанных с ботом..."

# Убиваем все процессы Python/uvicorn
echo "🔪 Убиваем Python процессы..."
pkill -f python || echo "Python процессы не найдены"
pkill -f uvicorn || echo "Uvicorn процессы не найдены"
pkill -f gunicorn || echo "Gunicorn процессы не найдены"

# Останавливаем все Docker контейнеры
echo "🔪 Останавливаем все Docker контейнеры..."
docker stop $(docker ps -aq) 2>/dev/null || echo "Контейнеры не найдены"
docker rm $(docker ps -aq) 2>/dev/null || echo "Контейнеры для удаления не найдены"

# Удаляем все Docker образы
echo "🔪 Удаляем все Docker образы..."
docker rmi $(docker images -q) -f 2>/dev/null || echo "Образы не найдены"

# Очищаем все Docker данные
echo "🧹 Полная очистка Docker..."
docker system prune -af --volumes 2>/dev/null || echo "Нечего очищать"

# Убиваем процессы на портах 8000 и 3000
echo "🔪 Освобождаем порты 8000 и 3000..."
fuser -k 8000/tcp 2>/dev/null || echo "Порт 8000 свободен"
fuser -k 3000/tcp 2>/dev/null || echo "Порт 3000 свободен"

# Удаляем старые директории
echo "🗑️ Удаляем старые директории..."
rm -rf /var/www/crypto-bot 2>/dev/null || echo "Директория crypto-bot не найдена"
rm -rf /var/www/finio 2>/dev/null || echo "Директория finio не найдена"

# Проверяем что все убито
echo "🔍 Проверка оставшихся процессов..."
ps aux | grep -E "(python|uvicorn|gunicorn|docker)" | grep -v grep || echo "Процессы не найдены"

echo ""
echo "💀 ВСЕ ПРОЦЕССЫ УБИТЫ!"
echo ""
echo "🚀 Теперь запустите полную установку:"
echo "curl -sSL https://raw.githubusercontent.com/Franklin15097/Finio/main/setup-miniapp.sh -o setup-miniapp.sh && chmod +x setup-miniapp.sh && sudo ./setup-miniapp.sh"