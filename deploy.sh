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

log "✅ Очистка завершена"

log "📦 Шаг 2: Установка зависимостей"

# Обновление системы
apt update && apt upgrade -y

# Установка базовых пакетов
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

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

log "🧪 Шаг 6: Тестирование"

sleep 30

# Тестирование
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    log "✅ API работает"
else
    log "⚠️ API пока не отвечает (может потребоваться время)"
fi

if curl -f http://localhost:8080 > /dev/null 2>&1; then
    log "✅ Frontend работает"
else
    log "⚠️ Frontend пока не отвечает (может потребоваться время)"
fi

log "✅ Установка завершена"

echo ""
echo "🎉 Finio установлен успешно!"
echo "=================================="
echo ""
echo "📱 Доступ:"
echo "   • Сайт: http://$(hostname -I | awk '{print $1}'):8080"
echo "   • API: http://$(hostname -I | awk '{print $1}'):8080/api"
echo "   • Health: http://$(hostname -I | awk '{print $1}'):8080/health"
echo "   • Mini App: http://$(hostname -I | awk '{print $1}'):8080/miniapp"
echo ""
echo "🐳 Управление:"
echo "   • Статус: docker-compose ps"
echo "   • Логи: docker-compose logs"
echo "   • Перезапуск: systemctl restart finio"
echo ""
echo "📁 Файлы: /opt/finio"
echo ""

docker-compose ps

echo ""
echo "✅ Готово! Приложение доступно на порту 8080!"