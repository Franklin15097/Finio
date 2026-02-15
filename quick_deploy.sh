#!/bin/bash
# Quick Deploy Script for Finio
# Run: ./quick_deploy.sh

SERVER="root@85.235.205.99"
PROJECT_DIR="/var/www/studiofinance"

echo "🚀 Starting deployment to studiofinance.ru..."
echo ""

ssh $SERVER << 'ENDSSH'
set -e

echo "📁 Navigating to project directory..."
cd /var/www/studiofinance

echo "📥 Pulling latest changes..."
git pull origin main

echo "🎨 Building frontend..."
cd frontend
npm install
npm run build

echo "⚙️  Building backend..."
cd ../backend
npm install
npm run build

echo "🔄 Restarting backend service..."
cd ..
pm2 restart finio-backend

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Service status:"
pm2 status

echo ""
echo "📝 Recent logs:"
pm2 logs finio-backend --lines 20 --nostream

ENDSSH

echo ""
echo "🎉 Deployment finished successfully!"
echo "🌐 Check your site: https://studiofinance.ru"
echo ""
