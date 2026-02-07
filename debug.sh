#!/bin/bash

echo "🔍 ДИАГНОСТИКА FINIO"
echo "==================="

# Проверка статуса сервиса
echo "📊 Статус сервиса:"
systemctl status finio --no-pager

echo ""
echo "📂 Содержимое /opt/Finio:"
ls -la /opt/Finio/

echo ""
echo "📂 Содержимое website-frontend/dist:"
ls -la /opt/Finio/website-frontend/dist/ 2>/dev/null || echo "Папка dist не найдена!"

echo ""
echo "📂 Содержимое mini-app-frontend/dist:"
ls -la /opt/Finio/mini-app-frontend/dist/ 2>/dev/null || echo "Папка dist не найдена!"

echo ""
echo "🔧 Последние логи сервиса:"
journalctl -u finio --no-pager -n 20

echo ""
echo "🌐 Проверка портов:"
netstat -tlnp | grep :3000 || echo "Порт 3000 не слушается!"

echo ""
echo "📝 Содержимое .env:"
cat /opt/Finio/server/.env 2>/dev/null || echo ".env файл не найден!"

echo ""
echo "🔄 Git статус:"
cd /opt/Finio && git log --oneline -5

echo ""
echo "📦 Node.js версия:"
node --version
npm --version

echo ""
echo "🔨 Попытка пересборки:"
cd /opt/Finio
echo "Сборка website-frontend..."
cd website-frontend && npm run build 2>&1 | tail -10 && cd ..
echo "Сборка mini-app-frontend..."
cd mini-app-frontend && npm run build 2>&1 | tail -10 && cd ..

echo ""
echo "🔄 Перезапуск сервиса..."
systemctl restart finio
sleep 3
systemctl status finio --no-pager

echo ""
echo "✅ Диагностика завершена!"