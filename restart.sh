#!/bin/bash

echo "🔄 Перезапуск Finio..."

# Остановка
./stop.sh

# Небольшая пауза
sleep 2

# Запуск
./deploy.sh

echo "✅ Перезапуск завершен!"