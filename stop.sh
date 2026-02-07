#!/bin/bash

echo "🛑 Остановка всех сервисов..."

if [ -f logs/server.pid ]; then
    kill $(cat logs/server.pid) 2>/dev/null
    echo "✓ Backend остановлен"
    rm logs/server.pid
fi

if [ -f logs/miniapp.pid ]; then
    kill $(cat logs/miniapp.pid) 2>/dev/null
    echo "✓ Mini App остановлен"
    rm logs/miniapp.pid
fi

if [ -f logs/website.pid ]; then
    kill $(cat logs/website.pid) 2>/dev/null
    echo "✓ Website остановлен"
    rm logs/website.pid
fi

echo "✅ Все сервисы остановлены"
