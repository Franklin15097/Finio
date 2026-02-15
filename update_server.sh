#!/bin/bash
set -e

echo "=== Updating Finio on Server ==="
echo ""

# Navigate to project directory
cd /var/www/studiofinance

echo "Step 1: Pull latest changes from GitHub..."
git pull origin main

echo "Step 2: Install backend dependencies..."
cd backend
npm install

echo "Step 3: Build backend..."
npm run build

echo "Step 4: Install frontend dependencies..."
cd ../frontend
npm install

echo "Step 5: Build frontend..."
npm run build

echo "Step 6: Restart backend with PM2..."
cd ..
pm2 restart finio-backend || pm2 start backend/dist/index.js --name finio-backend
pm2 save

echo "Step 7: Reload Nginx..."
nginx -t && systemctl reload nginx

echo ""
echo "=== Update Complete! ==="
echo ""
echo "Site URL: https://studiofinance.ru"
echo "Backend API: https://studiofinance.ru/api"
echo ""
echo "Useful Commands:"
echo "- View backend logs: pm2 logs finio-backend"
echo "- Restart backend: pm2 restart finio-backend"
echo "- Check nginx status: systemctl status nginx"
echo ""
