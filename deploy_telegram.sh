#!/bin/bash

# Telegram Mini App Deployment Script for Finio
# Usage: ./deploy_telegram.sh

set -e

echo "🚀 Starting Telegram Mini App deployment..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if TELEGRAM_BOT_TOKEN is set
if grep -q "YOUR_BOT_TOKEN_HERE" backend/.env; then
    echo -e "${RED}❌ Error: Please set TELEGRAM_BOT_TOKEN in backend/.env${NC}"
    echo "Get your token from @BotFather in Telegram"
    exit 1
fi

echo -e "${BLUE}📦 Building frontend...${NC}"
cd frontend
npm run build
cd ..

echo -e "${BLUE}🔨 Building backend...${NC}"
cd backend
npm run build
cd ..

echo -e "${BLUE}📤 Deploying to server...${NC}"
ssh root@85.235.205.99 << 'ENDSSH'
cd /var/www/finio
git pull

# Run database migration
echo "🗄️  Running database migration..."
mysql -u app_user -papp_password financial_db < backend/database/telegram_migration.sql || echo "Migration already applied or failed"

# Build and restart backend
cd backend
npm install
npm run build
pm2 restart finio-backend

# Build frontend
cd ../frontend
npm install
npm run build

echo "✅ Deployment complete!"
ENDSSH

echo -e "${GREEN}✅ Telegram Mini App deployed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Open @BotFather in Telegram"
echo "2. Send /mybots and select your bot"
echo "3. Go to Bot Settings → Menu Button"
echo "4. Set URL to: https://studiofinance.ru"
echo "5. Test your bot!"
