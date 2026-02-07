#!/bin/bash

# Finio - Полная установка с нуля
# Этот скрипт сначала удаляет всё старое, потом устанавливает заново

set -e

echo "🚀 Finio - Полная установка с нуля"
echo "=================================="

# Функция для вывода сообщений
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Проверка прав root
if [[ $EUID -ne 0 ]]; then
   echo "❌ Этот скрипт должен запускаться с правами root (sudo)"
   exit 1
fi

log "🧹 Шаг 1: Полная очистка системы"

# Остановка и удаление всех контейнеров
log "Остановка всех Docker контейнеров..."
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true

# Удаление всех образов
log "Удаление всех Docker образов..."
docker rmi $(docker images -q) 2>/dev/null || true

# Удаление всех томов
log "Удаление всех Docker томов..."
docker volume rm $(docker volume ls -q) 2>/dev/null || true

# Удаление всех сетей
log "Удаление всех Docker сетей..."
docker network rm $(docker network ls -q) 2>/dev/null || true

# Очистка системы Docker
log "Очистка системы Docker..."
docker system prune -af --volumes 2>/dev/null || true

# Удаление старых файлов проекта
log "Удаление старых файлов проекта..."
rm -rf /opt/finio 2>/dev/null || true
rm -rf /var/www/finio 2>/dev/null || true
rm -rf /home/*/finio 2>/dev/null || true
rm -rf /root/finio 2>/dev/null || true

# Остановка nginx если запущен
log "Остановка системного nginx..."
systemctl stop nginx 2>/dev/null || true
systemctl disable nginx 2>/dev/null || true

# Освобождение портов
log "Освобождение портов..."
fuser -k 80/tcp 2>/dev/null || true
fuser -k 443/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 8000/tcp 2>/dev/null || true
fuser -k 3306/tcp 2>/dev/null || true

log "✅ Очистка завершена"

log "📦 Шаг 2: Установка зависимостей"

# Обновление системы
log "Обновление системы..."
apt update && apt upgrade -y

# Установка необходимых пакетов
log "Установка базовых пакетов..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Установка Docker
log "Установка Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io

# Установка Docker Compose
log "Установка Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Запуск Docker
log "Запуск Docker..."
systemctl enable docker
systemctl start docker

log "✅ Зависимости установлены"

log "📥 Шаг 3: Загрузка проекта"

# Создание рабочей директории
mkdir -p /opt/finio
cd /opt/finio

# Клонирование репозитория
log "Клонирование репозитория..."
git clone https://github.com/Franklin15097/Finio.git .

# Установка прав
chmod +x deploy.sh

log "✅ Проект загружен"

log "🏗️ Шаг 4: Сборка и запуск"

# Сборка и запуск контейнеров
log "Сборка Docker образов..."
docker-compose build --no-cache

log "Запуск контейнеров..."
docker-compose up -d

# Ожидание запуска
log "Ожидание запуска сервисов..."
sleep 30

# Проверка статуса
log "Проверка статуса контейнеров..."
docker-compose ps

log "✅ Сборка и запуск завершены"

log "🔧 Шаг 5: Настройка системы"

# Настройка автозапуска
log "Настройка автозапуска..."
cat > /etc/systemd/system/finio.service << EOF
[Unit]
Description=Finio Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/finio
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl enable finio.service
systemctl start finio.service

log "✅ Настройка завершена"

log "🧪 Шаг 6: Тестирование"

# Ожидание полного запуска
sleep 10

# Тестирование API
log "Тестирование API..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    log "✅ API работает"
else
    log "❌ API не отвечает"
fi

# Тестирование frontend
log "Тестирование frontend..."
if curl -f http://localhost > /dev/null 2>&1; then
    log "✅ Frontend работает"
else
    log "❌ Frontend не отвечает"
fi

log "✅ Тестирование завершено"

log "📊 Шаг 7: Финальная информация"

echo ""
echo "🎉 Установка Finio завершена успешно!"
echo "=================================="
echo ""
echo "📱 Доступ к приложению:"
echo "   • Веб-сайт: http://studiofinance.ru"
echo "   • API: http://studiofinance.ru/api"
echo "   • Mini App: http://studiofinance.ru/miniapp"
echo "   • Health Check: http://studiofinance.ru/health"
echo ""
echo "🐳 Управление Docker:"
echo "   • Статус: docker-compose ps"
echo "   • Логи: docker-compose logs"
echo "   • Перезапуск: docker-compose restart"
echo "   • Остановка: docker-compose down"
echo ""
echo "🔧 Управление сервисом:"
echo "   • Статус: systemctl status finio"
echo "   • Перезапуск: systemctl restart finio"
echo "   • Остановка: systemctl stop finio"
echo ""
echo "📁 Файлы проекта: /opt/finio"
echo ""

# Показать статус контейнеров
echo "📊 Текущий статус контейнеров:"
docker-compose ps

echo ""
echo "✅ Готово! Приложение доступно по адресу: http://studiofinance.ru"