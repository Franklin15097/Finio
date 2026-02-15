#!/bin/bash
set -e

echo "=== Finio Update Script ==="
echo "Updating application on server..."
echo ""

PROJECT_DIR="/var/www/studiofinance"

echo "Step 1: Navigate to project directory..."
cd $PROJECT_DIR

echo "Step 2: Pull latest changes from GitHub..."
git pull origin main

echo "Step 3: Install/update dependencies..."
npm install

echo "Step 4: Build frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Step 5: Build backend..."
cd backend
npm install
npm run build
cd ..

echo "Step 6: Restart backend with PM2..."
pm2 restart finio-backend

echo "Step 7: Reload Nginx..."
systemctl reload nginx

echo ""
echo "=== Update Complete! ==="
echo ""
echo "Site URL: https://studiofinance.ru"
echo ""
echo "Useful Commands:"
echo "- View backend logs: pm2 logs finio-backend"
echo "- Check PM2 status: pm2 status"
echo "- Check nginx status: systemctl status nginx"
echo ""
