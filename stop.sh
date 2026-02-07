#!/bin/bash

echo "⏹️  Остановка Finio..."

# Остановка по PID файлу
if [ -f "app.pid" ]; then
    PID=$(cat app.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "✅ Процесс $PID остановлен"
        rm app.pid
    else
        echo "⚠️  Процесс $PID уже не запущен"
        rm app.pid
    fi
else
    echo "⚠️  PID файл не найден"
fi

# Принудительная остановка всех связанных процессов
pkill -f "node.*index.js" || true
pkill -f "npm.*start" || true

echo "✅ Все процессы остановлены"