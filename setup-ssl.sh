#!/bin/bash

echo "🔒 НАСТРОЙКА SSL (Let's Encrypt)"
echo "================================"

# Установка certbot
echo "📦 Установка certbot..."
apt-get update
apt-get install -y certbot python3-certbot-nginx

# Получение сертификата
echo "🔐 Получение SSL сертификата..."
certbot --nginx -d studiofinance.ru -d www.studiofinance.ru --non-interactive --agree-tos --email maks50kucherenko@gmail.com --redirect

# Автообновление
echo "🔄 Настройка автообновления..."
systemctl enable certbot.timer
systemctl start certbot.timer

# Проверка
echo ""
echo "✅ SSL настроен!"
echo "🌐 Сайт: https://studiofinance.ru"
echo ""
echo "Сертификат будет автоматически обновляться."
echo ""
