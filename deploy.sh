#!/bin/bash

# Finio - Полная установка с нуля
set -e

echo "🚀 Finio - Полная установка с нуля"
echo "=================================="

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Проверка прав root
if [[ $EUID -ne 0 ]]; then
   echo "❌ Запустите с правами root: sudo bash"
   exit 1
fi

log "🧹 Шаг 1: Полная очистка системы"

# Остановка и удаление контейнеров
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true
docker rmi $(docker images -q) 2>/dev/null || true
docker volume rm $(docker volume ls -q) 2>/dev/null || true
docker system prune -af --volumes 2>/dev/null || true

# Удаление старых файлов
rm -rf /opt/finio 2>/dev/null || true

# Остановка системного nginx и apache
systemctl stop nginx 2>/dev/null || true
systemctl disable nginx 2>/dev/null || true
systemctl stop apache2 2>/dev/null || true
systemctl disable apache2 2>/dev/null || true

# Освобождение портов
log "Освобождение портов..."
fuser -k 80/tcp 2>/dev/null || true
fuser -k 8080/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 8000/tcp 2>/dev/null || true
fuser -k 3306/tcp 2>/dev/null || true

# Настройка firewall
log "Настройка firewall..."
ufw allow 80/tcp 2>/dev/null || true
ufw allow 8000/tcp 2>/dev/null || true
ufw allow 3000/tcp 2>/dev/null || true

log "✅ Очистка завершена"

log "📦 Шаг 2: Установка зависимостей"

# Обновление системы
apt update && apt upgrade -y

# Установка базовых пакетов
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release net-tools

# Установка Docker
if ! command -v docker &> /dev/null; then
    log "Установка Docker..."
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io
fi

# Установка Docker Compose
if ! command -v docker-compose &> /dev/null; then
    log "Установка Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Запуск Docker
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

# Права на скрипты
chmod +x debug.sh restart.sh

log "✅ Проект загружен"

log "🏗️ Шаг 4: Сборка и запуск"

# Сборка образов
log "Сборка Docker образов..."
docker-compose build --no-cache

log "Запуск контейнеров..."
docker-compose up -d

# Ожидание запуска
log "Ожидание запуска сервисов..."
sleep 60

log "✅ Сборка завершена"

log "🔧 Шаг 5: Настройка автозапуска"

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

log "✅ Настройка завершена"

log "🧪 Шаг 6: Тестирование и диагностика"

sleep 30

echo ""
echo "📊 Статус контейнеров:"
docker-compose ps

echo ""
echo "🌐 Проверка портов:"
netstat -tulpn | grep -E ":80|:8000|:3000|:3306"

echo ""
echo "🧪 Тестирование подключений:"

# Тестирование
if curl -f http://localhost/health > /dev/null 2>&1; then
    log "✅ API работает"
else
    log "⚠️ API не отвечает"
    echo "Логи backend:"
    docker-compose logs backend | tail -10
fi

if curl -f http://localhost > /dev/null 2>&1; then
    log "✅ Frontend работает"
else
    log "⚠️ Frontend не отвечает"
    echo "Логи nginx:"
    docker-compose logs nginx | tail -10
fi

log "✅ Установка завершена"

echo ""
echo "🎉 Finio установлен!"
echo "==================="
echo ""
echo "📱 Доступ:"
echo "   • Сайт: http://studiofinance.ru"
echo "   • Сайт (IP): http://$(hostname -I | awk '{print $1}')"
echo "   • API: http://studiofinance.ru/api"
echo "   • Health: http://studiofinance.ru/health"
echo "   • Mini App: http://studiofinance.ru/miniapp"
echo ""
echo "🐳 Управление:"
echo "   • Статус: docker-compose ps"
echo "   • Логи: docker-compose logs"
echo "   • Перезапуск: ./restart.sh"
echo "   • Диагностика: ./debug.sh"
echo ""
echo "📁 Файлы: /opt/finio"
echo ""

if curl -f http://localhost > /dev/null 2>&1; then
    echo "✅ Готово! Приложение работает на http://studiofinance.ru"
else
    echo "⚠️ Есть проблемы. Запустите ./debug.sh для диагностики"
fi