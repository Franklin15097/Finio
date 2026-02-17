#!/bin/bash

# ============================================================================
# Finio - Полная установка и развертывание на чистом сервере
# ============================================================================
# Этот скрипт выполняет:
# 1. Полную очистку предыдущих установок
# 2. Установку всех необходимых зависимостей
# 3. Настройку базы данных, Redis, Nginx
# 4. Развертывание приложения
# 5. Настройку SSL сертификатов
# 6. Настройку автозапуска и мониторинга
# ============================================================================

set -e  # Остановка при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================================================
# КОНФИГУРАЦИЯ - ИЗМЕНИТЕ ЭТИ ЗНАЧЕНИЯ
# ============================================================================

# Домены
DOMAIN="studiofinance.ru"
API_DOMAIN="api.studiofinance.ru"

# Пути
PROJECT_PATH="/var/www/studiofinance"
REPO_URL="https://github.com/Franklin15097/Finio.git"

# База данных
DB_NAME="financial_db"
DB_USER="finio"
DB_PASSWORD=""  # Будет сгенерирован автоматически

# JWT Secret
JWT_SECRET=""  # Будет сгенерирован автоматически

# Telegram Bot Token (получите от @BotFather)
TELEGRAM_BOT_TOKEN=""

# Email для SSL сертификатов
SSL_EMAIL=""

# ============================================================================
# ФУНКЦИИ
# ============================================================================

print_header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC} ${CYAN}$1${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${CYAN}→${NC} $1"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "Этот скрипт должен быть запущен с правами root (sudo)"
        exit 1
    fi
}

generate_password() {
    openssl rand -base64 24 | tr -d "=+/" | cut -c1-32
}

generate_jwt_secret() {
    openssl rand -base64 48 | tr -d "=+/" | cut -c1-64
}

# ============================================================================
# ПРОВЕРКА ПАРАМЕТРОВ
# ============================================================================

check_root

print_header "🚀 Finio - Установка на сервер"

# Проверка обязательных параметров
if [[ -z "$TELEGRAM_BOT_TOKEN" ]]; then
    print_error "TELEGRAM_BOT_TOKEN не установлен!"
    print_info "Получите токен от @BotFather в Telegram"
    exit 1
fi

if [[ -z "$SSL_EMAIL" ]]; then
    print_error "SSL_EMAIL не установлен!"
    print_info "Укажите email для регистрации SSL сертификатов"
    exit 1
fi

# Генерация паролей если не заданы
if [[ -z "$DB_PASSWORD" ]]; then
    DB_PASSWORD=$(generate_password)
    print_info "Сгенерирован пароль БД: $DB_PASSWORD"
fi

if [[ -z "$JWT_SECRET" ]]; then
    JWT_SECRET=$(generate_jwt_secret)
    print_info "Сгенерирован JWT secret"
fi

# ============================================================================
# ШАГ 1: ОЧИСТКА СЕРВЕРА
# ============================================================================

print_header "🧹 Шаг 1: Очистка сервера от предыдущих установок"

print_info "Остановка сервисов..."
systemctl stop nginx 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true

print_info "Удаление старых файлов проекта..."
rm -rf "$PROJECT_PATH" 2>/dev/null || true
rm -rf /etc/nginx/sites-enabled/finio* 2>/dev/null || true
rm -rf /etc/nginx/sites-available/finio* 2>/dev/null || true

print_info "Очистка базы данных..."
mysql -u root -e "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null || true
mysql -u root -e "DROP USER IF EXISTS '$DB_USER'@'localhost';" 2>/dev/null || true

print_info "Очистка Redis..."
redis-cli FLUSHALL 2>/dev/null || true

print_success "Сервер очищен"

# ============================================================================
# ШАГ 2: ОБНОВЛЕНИЕ СИСТЕМЫ
# ============================================================================

print_header "📦 Шаг 2: Обновление системы"

print_info "Обновление списка пакетов..."
apt update -qq

print_info "Обновление установленных пакетов..."
DEBIAN_FRONTEND=noninteractive apt upgrade -y -qq

print_success "Система обновлена"

# ============================================================================
# ШАГ 3: УСТАНОВКА NODE.JS
# ============================================================================

print_header "📦 Шаг 3: Установка Node.js 18"

if ! command -v node &> /dev/null; then
    print_info "Установка Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    print_success "Node.js установлен: $(node --version)"
else
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ $NODE_VERSION -lt 18 ]]; then
        print_warning "Обновление Node.js до версии 18..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt install -y nodejs
    fi
    print_success "Node.js уже установлен: $(node --version)"
fi

# ============================================================================
# ШАГ 4: УСТАНОВКА MYSQL
# ============================================================================

print_header "📦 Шаг 4: Установка MySQL 8.0"

if ! command -v mysql &> /dev/null; then
    print_info "Установка MySQL..."
    DEBIAN_FRONTEND=noninteractive apt install -y mysql-server
    systemctl start mysql
    systemctl enable mysql
    print_success "MySQL установлен"
else
    print_success "MySQL уже установлен: $(mysql --version)"
fi

# ============================================================================
# ШАГ 5: УСТАНОВКА REDIS
# ============================================================================

print_header "📦 Шаг 5: Установка Redis"

if ! command -v redis-server &> /dev/null; then
    print_info "Установка Redis..."
    apt install -y redis-server
    systemctl start redis-server
    systemctl enable redis-server
    print_success "Redis установлен"
else
    print_success "Redis уже установлен: $(redis-server --version)"
fi

# Проверка работы Redis
if redis-cli ping | grep -q "PONG"; then
    print_success "Redis работает корректно"
else
    print_error "Redis не отвечает"
    exit 1
fi

# ============================================================================
# ШАГ 6: УСТАНОВКА NGINX
# ============================================================================

print_header "📦 Шаг 6: Установка Nginx"

if ! command -v nginx &> /dev/null; then
    print_info "Установка Nginx..."
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
    print_success "Nginx установлен"
else
    print_success "Nginx уже установлен: $(nginx -v 2>&1 | cut -d'/' -f2)"
fi

# ============================================================================
# ШАГ 7: УСТАНОВКА PM2
# ============================================================================

print_header "📦 Шаг 7: Установка PM2"

if ! command -v pm2 &> /dev/null; then
    print_info "Установка PM2..."
    npm install -g pm2
    pm2 startup systemd -u root --hp /root
    print_success "PM2 установлен"
else
    print_success "PM2 уже установлен: $(pm2 --version)"
fi

# ============================================================================
# ШАГ 8: УСТАНОВКА ДОПОЛНИТЕЛЬНЫХ ИНСТРУМЕНТОВ
# ============================================================================

print_header "📦 Шаг 8: Установка дополнительных инструментов"

print_info "Установка Git, Certbot, UFW, Fail2Ban..."
apt install -y git certbot python3-certbot-nginx ufw fail2ban

print_success "Дополнительные инструменты установлены"

# ============================================================================
# ШАГ 9: НАСТРОЙКА БАЗЫ ДАННЫХ
# ============================================================================

print_header "🗄️ Шаг 9: Настройка базы данных"

print_info "Создание базы данных и пользователя..."

mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

print_success "База данных создана: $DB_NAME"
print_success "Пользователь создан: $DB_USER"

# ============================================================================
# ШАГ 10: КЛОНИРОВАНИЕ ПРОЕКТА
# ============================================================================

print_header "📥 Шаг 10: Клонирование проекта"

print_info "Создание директории проекта..."
mkdir -p "$PROJECT_PATH"
cd "$PROJECT_PATH"

print_info "Клонирование репозитория..."
git clone "$REPO_URL" .

print_success "Проект клонирован в $PROJECT_PATH"

# ============================================================================
# ШАГ 11: НАСТРОЙКА BACKEND
# ============================================================================

print_header "⚙️ Шаг 11: Настройка Backend"

cd "$PROJECT_PATH/backend"

print_info "Установка зависимостей..."
npm install --production

print_info "Создание .env файла..."
cat > .env <<EOF
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME

# JWT Secret
JWT_SECRET=$JWT_SECRET

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN

# URLs
BACKEND_URL=https://$API_DOMAIN
FRONTEND_URL=https://$DOMAIN

# Redis Configuration
REDIS_URL=redis://localhost:6379
EOF

print_success ".env файл создан"

print_info "Импорт схемы базы данных..."
mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < database/schema_improved.sql

print_success "Схема базы данных импортирована"

print_info "Компиляция TypeScript..."
npm run build

print_success "Backend настроен"

# ============================================================================
# ШАГ 12: НАСТРОЙКА FRONTEND
# ============================================================================

print_header "⚙️ Шаг 12: Настройка Frontend"

cd "$PROJECT_PATH/frontend"

print_info "Установка зависимостей..."
npm install

print_info "Создание .env файла..."
cat > .env <<EOF
VITE_API_URL=https://$API_DOMAIN
EOF

print_success ".env файл создан"

print_info "Сборка production версии..."
npm run build

print_success "Frontend собран"

# ============================================================================
# ШАГ 13: НАСТРОЙКА NGINX
# ============================================================================

print_header "🌐 Шаг 13: Настройка Nginx"

print_info "Создание конфигурации для $DOMAIN..."

cat > /etc/nginx/sites-available/finio <<EOF
# Frontend
server {
    listen 80;
    server_name $DOMAIN;
    
    root $PROJECT_PATH/frontend/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}

# Backend API
server {
    listen 80;
    server_name $API_DOMAIN;
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api_limit:10m rate=100r/m;
    
    location / {
        limit_req zone=api_limit burst=20 nodelay;
        
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # WebSocket support
        proxy_read_timeout 86400;
    }
}
EOF

print_info "Активация конфигурации..."
ln -sf /etc/nginx/sites-available/finio /etc/nginx/sites-enabled/

print_info "Проверка конфигурации Nginx..."
nginx -t

print_info "Перезапуск Nginx..."
systemctl restart nginx

print_success "Nginx настроен"

# ============================================================================
# ШАГ 14: ЗАПУСК ПРИЛОЖЕНИЯ С PM2
# ============================================================================

print_header "🚀 Шаг 14: Запуск приложения"

cd "$PROJECT_PATH/backend"

print_info "Запуск Backend API..."
pm2 start dist/index.js --name finio-backend --max-memory-restart 1G

print_info "Запуск Telegram Bot..."
pm2 start dist/bot.js --name finio-bot --max-memory-restart 500M

print_info "Сохранение конфигурации PM2..."
pm2 save

print_info "Настройка автозапуска PM2..."
pm2 startup systemd -u root --hp /root

print_success "Приложение запущено"

# Проверка статуса
sleep 3
pm2 status

# ============================================================================
# ШАГ 15: НАСТРОЙКА SSL СЕРТИФИКАТОВ
# ============================================================================

print_header "🔒 Шаг 15: Настройка SSL сертификатов"

print_info "Получение SSL сертификатов для $DOMAIN и $API_DOMAIN..."

certbot --nginx -d "$DOMAIN" -d "$API_DOMAIN" \
    --non-interactive \
    --agree-tos \
    --email "$SSL_EMAIL" \
    --redirect

print_success "SSL сертификаты установлены"

print_info "Настройка автоматического обновления сертификатов..."
systemctl enable certbot.timer
systemctl start certbot.timer

print_success "Автообновление SSL настроено"

# ============================================================================
# ШАГ 16: НАСТРОЙКА FIREWALL
# ============================================================================

print_header "🔥 Шаг 16: Настройка Firewall"

print_info "Настройка UFW..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable

print_success "Firewall настроен"

# ============================================================================
# ШАГ 17: НАСТРОЙКА FAIL2BAN
# ============================================================================

print_header "🛡️ Шаг 17: Настройка Fail2Ban"

print_info "Создание конфигурации Fail2Ban для Nginx..."

cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = 22

[nginx-http-auth]
enabled = true

[nginx-noscript]
enabled = true

[nginx-badbots]
enabled = true

[nginx-noproxy]
enabled = true
EOF

print_info "Перезапуск Fail2Ban..."
systemctl restart fail2ban
systemctl enable fail2ban

print_success "Fail2Ban настроен"

# ============================================================================
# ШАГ 18: НАСТРОЙКА АВТОМАТИЧЕСКИХ БЭКАПОВ
# ============================================================================

print_header "💾 Шаг 18: Настройка автоматических бэкапов"

print_info "Создание директории для бэкапов..."
mkdir -p /var/backups/finio

print_info "Создание скрипта бэкапа..."
cat > /usr/local/bin/finio-backup.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/finio"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="financial_db"
DB_USER="finio"
DB_PASSWORD="DB_PASSWORD_PLACEHOLDER"

# Создание бэкапа
mysqldump -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" | gzip > "$BACKUP_DIR/backup_$DATE.sql.gz"

# Удаление бэкапов старше 30 дней
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.sql.gz"
EOF

# Замена плейсхолдера на реальный пароль
sed -i "s/DB_PASSWORD_PLACEHOLDER/$DB_PASSWORD/g" /usr/local/bin/finio-backup.sh

chmod +x /usr/local/bin/finio-backup.sh

print_info "Настройка cron задачи (ежедневно в 3:00)..."
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/local/bin/finio-backup.sh >> /var/log/finio-backup.log 2>&1") | crontab -

print_success "Автоматические бэкапы настроены"

# ============================================================================
# ШАГ 19: ОПТИМИЗАЦИЯ MYSQL
# ============================================================================

print_header "⚡ Шаг 19: Оптимизация MySQL"

print_info "Настройка параметров MySQL..."

cat >> /etc/mysql/mysql.conf.d/mysqld.cnf <<EOF

# Finio optimizations
innodb_buffer_pool_size = 512M
innodb_log_file_size = 128M
max_connections = 200
query_cache_size = 32M
query_cache_type = 1
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow-query.log
long_query_time = 2
EOF

print_info "Перезапуск MySQL..."
systemctl restart mysql

print_success "MySQL оптимизирован"

# ============================================================================
# ШАГ 20: ПРОВЕРКА УСТАНОВКИ
# ============================================================================

print_header "✅ Шаг 20: Проверка установки"

print_info "Проверка сервисов..."

# Проверка MySQL
if systemctl is-active --quiet mysql; then
    print_success "MySQL работает"
else
    print_error "MySQL не работает"
fi

# Проверка Redis
if systemctl is-active --quiet redis-server; then
    print_success "Redis работает"
else
    print_error "Redis не работает"
fi

# Проверка Nginx
if systemctl is-active --quiet nginx; then
    print_success "Nginx работает"
else
    print_error "Nginx не работает"
fi

# Проверка PM2 процессов
print_info "Статус PM2 процессов:"
pm2 status

# Проверка портов
print_info "Проверка открытых портов:"
netstat -tlnp | grep -E ':(80|443|5000|3306|6379) '

# ============================================================================
# ЗАВЕРШЕНИЕ
# ============================================================================

print_header "🎉 Установка завершена!"

echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}                   ${CYAN}УСТАНОВКА УСПЕШНО ЗАВЕРШЕНА${NC}                  ${GREEN}║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📋 Информация о системе:${NC}"
echo -e "   ${YELLOW}Frontend URL:${NC}      https://$DOMAIN"
echo -e "   ${YELLOW}Backend API URL:${NC}   https://$API_DOMAIN"
echo -e "   ${YELLOW}Проект:${NC}            $PROJECT_PATH"
echo ""
echo -e "${CYAN}🔐 Учетные данные:${NC}"
echo -e "   ${YELLOW}База данных:${NC}       $DB_NAME"
echo -e "   ${YELLOW}Пользователь БД:${NC}   $DB_USER"
echo -e "   ${YELLOW}Пароль БД:${NC}         $DB_PASSWORD"
echo -e "   ${YELLOW}JWT Secret:${NC}        $JWT_SECRET"
echo ""
echo -e "${CYAN}📝 Сохраните эти данные в безопасном месте!${NC}"
echo ""
echo -e "${CYAN}🔧 Полезные команды:${NC}"
echo -e "   ${YELLOW}Статус PM2:${NC}        pm2 status"
echo -e "   ${YELLOW}Логи PM2:${NC}          pm2 logs"
echo -e "   ${YELLOW}Перезапуск:${NC}        pm2 restart all"
echo -e "   ${YELLOW}Статус Nginx:${NC}      systemctl status nginx"
echo -e "   ${YELLOW}Логи Nginx:${NC}        tail -f /var/log/nginx/error.log"
echo -e "   ${YELLOW}Статус MySQL:${NC}      systemctl status mysql"
echo -e "   ${YELLOW}Статус Redis:${NC}      systemctl status redis-server"
echo ""
echo -e "${CYAN}📊 Мониторинг:${NC}"
echo -e "   ${YELLOW}PM2 монитор:${NC}       pm2 monit"
echo -e "   ${YELLOW}Использование:${NC}     htop"
echo ""
echo -e "${CYAN}💾 Бэкапы:${NC}"
echo -e "   ${YELLOW}Директория:${NC}        /var/backups/finio"
echo -e "   ${YELLOW}Расписание:${NC}        Ежедневно в 3:00"
echo -e "   ${YELLOW}Ручной бэкап:${NC}      /usr/local/bin/finio-backup.sh"
echo ""
echo -e "${CYAN}🔄 Обновление приложения:${NC}"
echo -e "   ${YELLOW}1.${NC} cd $PROJECT_PATH"
echo -e "   ${YELLOW}2.${NC} git pull"
echo -e "   ${YELLOW}3.${NC} cd backend && npm install && npm run build"
echo -e "   ${YELLOW}4.${NC} cd ../frontend && npm install && npm run build"
echo -e "   ${YELLOW}5.${NC} pm2 restart all"
echo ""
echo -e "${CYAN}📚 Документация:${NC}"
echo -e "   ${YELLOW}README:${NC}            $PROJECT_PATH/README.md"
echo -e "   ${YELLOW}API Docs:${NC}          $PROJECT_PATH/docs/API.md"
echo -e "   ${YELLOW}Deployment:${NC}        $PROJECT_PATH/docs/DEPLOYMENT.md"
echo -e "   ${YELLOW}Tech Stack:${NC}        $PROJECT_PATH/docs/TECH_STACK.md"
echo ""
echo -e "${GREEN}✨ Приложение готово к использованию!${NC}"
echo -e "${GREEN}🚀 Откройте https://$DOMAIN в браузере${NC}"
echo ""

# Сохранение учетных данных в файл
cat > "$PROJECT_PATH/CREDENTIALS.txt" <<EOF
=================================================================
FINIO - УЧЕТНЫЕ ДАННЫЕ
=================================================================
Дата установки: $(date)

URLS:
  Frontend:     https://$DOMAIN
  Backend API:  https://$API_DOMAIN

БАЗА ДАННЫХ:
  Имя БД:       $DB_NAME
  Пользователь: $DB_USER
  Пароль:       $DB_PASSWORD
  Хост:         localhost
  Порт:         3306

БЕЗОПАСНОСТЬ:
  JWT Secret:   $JWT_SECRET

TELEGRAM:
  Bot Token:    $TELEGRAM_BOT_TOKEN

REDIS:
  URL:          redis://localhost:6379

ПУТИ:
  Проект:       $PROJECT_PATH
  Бэкапы:       /var/backups/finio
  Логи PM2:     ~/.pm2/logs/
  Логи Nginx:   /var/log/nginx/

=================================================================
⚠️  ВАЖНО: Храните этот файл в безопасном месте!
=================================================================
EOF

chmod 600 "$PROJECT_PATH/CREDENTIALS.txt"

print_success "Учетные данные сохранены в $PROJECT_PATH/CREDENTIALS.txt"

exit 0
