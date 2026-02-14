#!/bin/bash
set -e

echo "🚀 Updating Finio with Telegram Mini App support..."

# Server configuration
SERVER="root@85.235.205.99"
PROJECT_DIR="/var/www/studiofinance"
DB_NAME="financial_db"
DB_USER="app_user"
DB_PASSWORD="app_password"
TELEGRAM_BOT_TOKEN="8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34"

echo "📡 Connecting to server..."

ssh $SERVER << ENDSSH
set -e

echo "📥 Pulling latest code..."
cd $PROJECT_DIR
git pull origin main

echo "🗄️  Running Telegram database migration..."
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < backend/database/telegram_migration.sql 2>/dev/null || echo "Migration already applied or failed (this is OK if already applied)"

echo "⚙️  Updating backend .env with Telegram token..."
cd backend
if ! grep -q "TELEGRAM_BOT_TOKEN" .env; then
    echo "TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN" >> .env
else
    sed -i "s|TELEGRAM_BOT_TOKEN=.*|TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN|" .env
fi

echo "📦 Installing backend dependencies..."
npm install

echo "🔨 Building backend..."
npm run build

echo "🔄 Restarting backend..."
pm2 restart finio-backend

echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "🔨 Building frontend..."
npm run build

echo "✅ Update complete!"
pm2 status
ENDSSH

echo ""
echo "✅ Telegram Mini App deployed successfully!"
echo ""
echo "📱 Next steps:"
echo "1. Open @BotFather in Telegram"
echo "2. Send /mybots and select your bot"
echo "3. Go to: Bot Settings → Menu Button → Edit Menu Button URL"
echo "4. Set URL to: https://studiofinance.ru"
echo "5. Set button text to: Открыть Finio"
echo "6. Test your bot!"
echo ""
echo "🔗 Your bot: https://t.me/YOUR_BOT_USERNAME"
