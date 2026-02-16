#!/bin/bash

# Finio Deployment Script
# Универсальный скрипт для деплоя на production сервер

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Конфигурация
SERVER_USER="root"
SERVER_HOST="85.235.205.99"
SERVER_PATH="/var/www/studiofinance"
BACKEND_SERVICE="finio-backend"
BOT_SERVICE="finio-bot"

# Функции для вывода
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Проверка аргументов
DEPLOY_TYPE=${1:-full}

case $DEPLOY_TYPE in
    full)
        print_header "Full Deployment (Frontend + Backend + Bot)"
        ;;
    frontend)
        print_header "Frontend Only Deployment"
        ;;
    backend)
        print_header "Backend Only Deployment"
        ;;
    bot)
        print_header "Bot Only Deployment"
        ;;
    *)
        print_error "Unknown deployment type: $DEPLOY_TYPE"
        echo "Usage: $0 [full|frontend|backend|bot]"
        exit 1
        ;;
esac

# Проверка изменений
print_info "Checking for uncommitted changes..."
if [[ -n $(git status -s) ]]; then
    print_error "You have uncommitted changes. Please commit or stash them first."
    git status -s
    exit 1
fi
print_success "No uncommitted changes"

# Проверка текущей ветки
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" ]]; then
    print_error "You are not on main branch (current: $CURRENT_BRANCH)"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Push изменений
print_info "Pushing changes to GitHub..."
git push origin $CURRENT_BRANCH
print_success "Changes pushed"

# Деплой на сервер
print_header "Deploying to Production Server"
print_info "Server: $SERVER_HOST"
print_info "Path: $SERVER_PATH"

# Создаём команду для выполнения на сервере
REMOTE_CMD="cd $SERVER_PATH && "

# Pull изменений
REMOTE_CMD+="echo '→ Pulling latest changes...' && "
REMOTE_CMD+="git pull origin main && "

# Frontend
if [[ "$DEPLOY_TYPE" == "full" || "$DEPLOY_TYPE" == "frontend" ]]; then
    REMOTE_CMD+="echo '→ Building frontend...' && "
    REMOTE_CMD+="cd frontend && "
    REMOTE_CMD+="npm install && "
    REMOTE_CMD+="npm run build && "
    REMOTE_CMD+="cd .. && "
fi

# Backend
if [[ "$DEPLOY_TYPE" == "full" || "$DEPLOY_TYPE" == "backend" ]]; then
    REMOTE_CMD+="echo '→ Building backend...' && "
    REMOTE_CMD+="cd backend && "
    REMOTE_CMD+="npm install && "
    REMOTE_CMD+="npm run build && "
    REMOTE_CMD+="cd .. && "
fi

# Restart services
if [[ "$DEPLOY_TYPE" == "full" || "$DEPLOY_TYPE" == "backend" ]]; then
    REMOTE_CMD+="echo '→ Restarting backend service...' && "
    REMOTE_CMD+="pm2 restart $BACKEND_SERVICE && "
fi

if [[ "$DEPLOY_TYPE" == "full" || "$DEPLOY_TYPE" == "bot" ]]; then
    REMOTE_CMD+="echo '→ Restarting bot service...' && "
    REMOTE_CMD+="pm2 restart $BOT_SERVICE && "
fi

# Status
REMOTE_CMD+="echo '→ Checking services status...' && "
REMOTE_CMD+="pm2 status"

# Выполнение на сервере
print_info "Executing deployment on server..."
ssh $SERVER_USER@$SERVER_HOST "$REMOTE_CMD"

# Проверка результата
if [ $? -eq 0 ]; then
    print_header "Deployment Successful!"
    print_success "Site: https://studiofinance.ru"
    print_success "Bot: @FinanceStudio_bot"
    echo ""
    print_info "View logs: ssh $SERVER_USER@$SERVER_HOST 'pm2 logs $BACKEND_SERVICE'"
else
    print_header "Deployment Failed!"
    print_error "Check the logs for details"
    exit 1
fi
