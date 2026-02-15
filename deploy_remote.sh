#!/bin/bash
set -e

echo "=== Remote Deployment to studiofinance.ru ==="
echo ""

# Check if SSH key is configured
if [ ! -f ~/.ssh/id_rsa ] && [ ! -f ~/.ssh/id_ed25519 ]; then
    echo "Error: No SSH key found. Please configure SSH access to the server first."
    exit 1
fi

# Server configuration
SERVER_USER="root"
SERVER_HOST="studiofinance.ru"
PROJECT_DIR="/var/www/studiofinance"

echo "Connecting to server: ${SERVER_USER}@${SERVER_HOST}"
echo ""

# SSH into server and run deployment
ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
set -e

echo "=== Starting deployment on server ==="
echo ""

# Navigate to project directory
cd /var/www/studiofinance

echo "Step 1: Pull latest changes from GitHub..."
git pull origin main

echo "Step 2: Install backend dependencies..."
cd backend
npm install
echo ""

echo "Step 3: Build backend..."
npm run build
echo ""

echo "Step 4: Install frontend dependencies..."
cd ../frontend
npm install
echo ""

echo "Step 5: Build frontend..."
npm run build
echo ""

echo "Step 6: Restart backend with PM2..."
cd ..
pm2 restart finio-backend || pm2 start backend/dist/index.js --name finio-backend
pm2 save
echo ""

echo "Step 7: Reload Nginx..."
nginx -t && systemctl reload nginx
echo ""

echo "=== Deployment Complete! ==="
echo ""
echo "Site URL: https://studiofinance.ru"
echo "Backend API: https://studiofinance.ru/api"
echo ""
echo "Useful Commands:"
echo "- View backend logs: pm2 logs finio-backend"
echo "- Restart backend: pm2 restart finio-backend"
echo "- Check nginx status: systemctl status nginx"
echo ""

ENDSSH

echo ""
echo "=== Remote deployment finished successfully! ==="
echo ""
