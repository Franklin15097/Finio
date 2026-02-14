#!/bin/bash
set -e

echo "=== Finio Deployment Script ==="
echo "Domain: studiofinance.ru"
echo "Server: Ubuntu 24.04 LTS"
echo ""

# Configuration
DOMAIN="studiofinance.ru"
PROJECT_DIR="/var/www/studiofinance"
DB_NAME="financial_db"
DB_USER="app_user"
DB_PASSWORD=$(openssl rand -base64 32)
DB_ROOT_PASSWORD=$(openssl rand -base64 32)

echo "Step 1: Update system packages..."
apt update && apt upgrade -y

echo "Step 2: Install Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo "Step 3: Install MySQL Server..."
apt install -y mysql-server

echo "Step 4: Install Nginx..."
apt install -y nginx

echo "Step 5: Install Certbot for SSL..."
apt install -y certbot python3-certbot-nginx

echo "Step 6: Install PM2 for process management..."
npm install -g pm2

echo "Step 7: Configure MySQL..."
systemctl start mysql
systemctl enable mysql

# Secure MySQL and create database
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_ROOT_PASSWORD}';"
mysql -u root -p"${DB_ROOT_PASSWORD}" -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME};"
mysql -u root -p"${DB_ROOT_PASSWORD}" -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';"
mysql -u root -p"${DB_ROOT_PASSWORD}" -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
mysql -u root -p"${DB_ROOT_PASSWORD}" -e "FLUSH PRIVILEGES;"

echo "Step 8: Clone project from GitHub..."
mkdir -p /var/www
cd /var/www
if [ -d "$PROJECT_DIR" ]; then
    echo "Project directory exists, pulling latest changes..."
    cd $PROJECT_DIR
    git pull
else
    git clone https://github.com/Franklin15097/Finio.git studiofinance
    cd $PROJECT_DIR
fi

echo "Step 9: Install dependencies..."
npm install

echo "Step 10: Configure backend environment..."
cat > backend/.env << EOF
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
NODE_ENV=production
EOF

echo "Step 11: Initialize database schema..."
mysql -u root -p"${DB_ROOT_PASSWORD}" ${DB_NAME} < backend/database/schema.sql

echo "Step 12: Build frontend..."
cd frontend
npm run build
cd ..

echo "Step 13: Build backend..."
cd backend
npm run build
cd ..

echo "Step 14: Configure Nginx..."
cat > /etc/nginx/sites-available/${DOMAIN} << 'EOF'
server {
    listen 80;
    server_name studiofinance.ru www.studiofinance.ru;

    # Frontend
    location / {
        root /var/www/studiofinance/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Reload nginx
systemctl reload nginx

echo "Step 15: Start backend with PM2..."
cd $PROJECT_DIR/backend
pm2 delete finio-backend 2>/dev/null || true
pm2 start dist/index.js --name finio-backend
pm2 save
pm2 startup systemd -u root --hp /root

echo "Step 16: Configure firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "Step 17: Setup SSL certificate..."
certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN} --redirect

echo ""
echo "=== Deployment Complete! ==="
echo ""
echo "Site URL: https://${DOMAIN}"
echo "Backend API: https://${DOMAIN}/api"
echo ""
echo "Database Credentials (SAVE THESE!):"
echo "-----------------------------------"
echo "MySQL Root Password: ${DB_ROOT_PASSWORD}"
echo "App DB User: ${DB_USER}"
echo "App DB Password: ${DB_PASSWORD}"
echo "Database Name: ${DB_NAME}"
echo ""
echo "Useful Commands:"
echo "- View backend logs: pm2 logs finio-backend"
echo "- Restart backend: pm2 restart finio-backend"
echo "- Check nginx status: systemctl status nginx"
echo "- Check MySQL status: systemctl status mysql"
echo ""
