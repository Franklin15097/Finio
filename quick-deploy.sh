#!/bin/bash

echo "🚀 Быстрый деплой Finio на хостинг"
echo "=================================="

# Клонирование репозитория
if [ ! -d "Finio" ]; then
    echo "📥 Клонирование репозитория..."
    git clone https://github.com/Franklin15097/Finio.git
    cd Finio
else
    echo "📥 Обновление репозитория..."
    cd Finio
    git pull origin main
fi

# Делаем скрипты исполняемыми
chmod +x deploy.sh
chmod +x stop.sh
chmod +x restart.sh
chmod +x start-dev.sh

# Запуск деплоя
echo "🚀 Запуск деплоя..."
./deploy.sh

echo ""
echo "✅ Деплой завершен!"
echo ""
echo "📍 Ваше приложение доступно на:"
echo "   🌐 Веб-сайт: http://your-domain.com"
echo "   📱 Mini App: http://your-domain.com/mini-app"
echo "   🔧 API: http://your-domain.com:3000"
echo ""
echo "⚙️  Не забудьте настроить:"
echo "   1. Отредактировать server/.env"
echo "   2. Добавить BOT_TOKEN от @BotFather"
echo "   3. Перезапустить: ./restart.sh"
echo ""
echo "📋 Полезные команды:"
echo "   ./restart.sh    - Перезапуск"
echo "   ./stop.sh       - Остановка"
echo "   tail -f app.log - Просмотр логов"