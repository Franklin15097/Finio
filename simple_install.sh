#!/bin/bash

echo "🚀 FINIO - ПРОСТАЯ УСТАНОВКА (БЕЗ SSL)"
echo "===================================="

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Запустите скрипт с правами root: sudo $0"
    exit 1
fi

WORK_DIR="/var/www/finio"

# 1. Установка зависимостей
echo "🔧 1/4 Установка зависимостей..."
apt-get update -y
apt-get install -y curl git jq

# Docker
if ! command -v docker &> /dev/null; then
    echo "🐳 Установка Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
    rm -f get-docker.sh
fi

# Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Установка Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 2. Остановка старых сервисов
echo "⏹️ 2/4 Остановка старых сервисов..."
docker-compose down 2>/dev/null || true
pkill -f python 2>/dev/null || true
pkill -f node 2>/dev/null || true

# 3. Клонирование проекта
echo "📥 3/4 Клонирование проекта..."
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

if [ -d ".git" ]; then
    git pull origin main
else
    git clone https://github.com/Franklin15097/Finio.git .
fi

# 4. Запуск системы
echo "🚀 4/4 Запуск системы..."
docker-compose down --volumes 2>/dev/null || true
docker-compose build --no-cache
docker-compose up -d

echo ""
echo "⏳ Ожидание запуска сервисов..."
echo "MySQL запускается... (60 секунд)"
sleep 60

echo ""
echo "🔍 Проверка сервисов:"

# Проверка MySQL
if docker-compose exec -T mysql mysqladmin ping -h localhost -u root -proot_password_2024 >/dev/null 2>&1; then
    echo "✅ MySQL: Работает"
    
    # Проверка базы данных
    DB_EXISTS=$(docker-compose exec -T mysql mysql -u root -proot_password_2024 -e "SHOW DATABASES LIKE 'finio';" | grep finio | wc -l)
    if [ $DB_EXISTS -gt 0 ]; then
        echo "✅ База данных 'finio': Создана"
    else
        echo "❌ База данных 'finio': Не найдена"
    fi
    
    # Проверка пользователя
    USER_EXISTS=$(docker-compose exec -T mysql mysql -u root -proot_password_2024 -e "SELECT User FROM mysql.user WHERE User='finio_user';" | grep finio_user | wc -l)
    if [ $USER_EXISTS -gt 0 ]; then
        echo "✅ Пользователь 'finio_user': Создан"
    else
        echo "❌ Пользователь 'finio_user': Не найден"
    fi
else
    echo "❌ MySQL: Не отвечает"
    echo "📋 Логи MySQL:"
    docker-compose logs mysql | tail -20
fi

# Проверка Backend
sleep 10
if curl -f -s http://localhost:8000/health >/dev/null 2>&1; then
    echo "✅ Backend API: Работает"
else
    echo "❌ Backend API: Не отвечает"
    echo "📋 Логи Backend:"
    docker-compose logs backend | tail -10
fi

# Проверка Frontend
if curl -f -s http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Frontend: Работает"
else
    echo "❌ Frontend: Не отвечает"
    echo "📋 Логи Frontend:"
    docker-compose logs frontend | tail -10
fi

# Проверка Nginx
if curl -f -s http://localhost/health >/dev/null 2>&1; then
    echo "✅ Nginx Proxy: Работает"
else
    echo "❌ Nginx Proxy: Не отвечает"
fi

echo ""
echo "🎯 РЕЗУЛЬТАТ:"
echo ""

# Проверка внешнего доступа
if curl -f -s http://studiofinance.ru/health >/dev/null 2>&1; then
    echo "🎉 САЙТ РАБОТАЕТ!"
    echo "🌐 Доступ: http://studiofinance.ru"
    echo "🔧 API: http://studiofinance.ru/api"
    echo "❌ Mini App: Требует SSL (https://)"
else
    echo "⚠️ Сайт пока недоступен извне"
    echo "🔍 Проверьте DNS настройки домена"
fi

echo ""
echo "📋 Команды для диагностики:"
echo "• docker-compose ps"
echo "• docker-compose logs mysql"
echo "• docker-compose logs backend"
echo "• curl http://localhost:8000/health"
echo ""
echo "🔒 Для добавления SSL:"
echo "• sudo apt install certbot python3-certbot-nginx"
echo "• sudo certbot --nginx -d studiofinance.ru"