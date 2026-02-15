#!/bin/bash
set -e

echo "=== Finio Quick Update Script ==="
echo "Updating studiofinance.ru..."
echo ""

PROJECT_DIR="/var/www/studiofinance"

echo "Step 1: Pull latest changes from GitHub..."
cd $PROJECT_DIR
git pull origin main

echo "Step 2: Update and build frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Step 3: Update and build backend..."
cd backend
npm install
npm run build
cd ..

echo "Step 4: Restart backend service..."
pm2 restart finio-backend

echo "Step 5: Check service status..."
pm2 status

echo ""
echo "=== Update Complete! ==="
echo ""
echo "Site: https://studiofinance.ru"
echo ""
echo "View logs: pm2 logs finio-backend"
echo ""
