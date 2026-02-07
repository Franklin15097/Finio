#!/bin/bash

echo "🚀 FINIO STARTER - Система управления финансами"
echo "=============================================="

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Запустите скрипт с правами root: sudo $0"
    exit 1
fi

# Переход в рабочую директорию
WORK_DIR="/var/www/finio"

# Функция для проверки статуса
check_status() {
    echo ""
    echo "📊 Статус сервисов:"
    if [ -f "$WORK_DIR/docker-compose.yml" ]; then
        cd "$WORK_DIR"
        docker-compose ps
    else
        echo "❌ Проект не установлен"
        return 1
    fi
    
    echo ""
    echo "🔍 Проверка доступности:"
    
    # Проверка MySQL
    if docker-compose exec mysql mysqladmin ping -h localhost -u finio_user -pmaks15097 >/dev/null 2>&1; then
        echo "✅ MySQL: Работает"
    else
        echo "❌ MySQL: Не отвечает"
    fi
    
    # Проверка Backend API
    if curl -f http://localhost:8000/health >/dev/null 2>&1; then
        echo "✅ Backend API: Работает"
    else
        echo "❌ Backend API: Не отвечает"
    fi
    
    # Проверка Frontend
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        echo "✅ Frontend: Работает"
    else
        echo "❌ Frontend: Не отвечает"
    fi
    
    # Проверка Bot Status
    BOT_STATUS=$(curl -s http://localhost:8000/bot-status 2>/dev/null | jq -r .bot_initialized 2>/dev/null)
    if [ "$BOT_STATUS" = "true" ]; then
        echo "✅ Telegram Bot: Инициализирован"
    else
        echo "❌ Telegram Bot: Не инициализирован"
    fi
}

# Функция установки системы
install_system() {
    echo "📦 УСТАНОВКА FINIO С НУЛЯ..."
    
    # Установка зависимостей
    echo "🔧 1. Установка зависимостей..."
    
    # Docker
    if ! command -v docker &> /dev/null; then
        echo "🐳 Установка Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        systemctl enable docker
        systemctl start docker
        rm -f get-docker.sh
    fi
    
    # Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo "🐳 Установка Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
    
    # jq для парсинга JSON
    if ! command -v jq &> /dev/null; then
        echo "📦 Установка jq..."
        apt-get update && apt-get install -y jq
    fi
    
    # Создание рабочей директории
    echo "📁 2. Создание рабочей директории..."
    mkdir -p "$WORK_DIR"
    cd "$WORK_DIR"
    
    # Клонирование проекта
    echo "📥 3. Клонирование проекта..."
    if [ -d ".git" ]; then
        git pull origin main
    else
        git clone https://github.com/Franklin15097/Finio.git .
    fi
    
    # Установка прав
    echo "🔐 4. Установка прав доступа..."
    chown -R root:root "$WORK_DIR"
    chmod -R 755 "$WORK_DIR"
    
    echo "✅ Установка завершена!"
}

# Функция запуска сервисов
start_services() {
    echo "🚀 ЗАПУСК СЕРВИСОВ..."
    
    if [ ! -f "$WORK_DIR/docker-compose.yml" ]; then
        echo "❌ Проект не установлен. Запускаю установку..."
        install_system
    fi
    
    cd "$WORK_DIR"
    
    # Остановка старых контейнеров
    echo "⏹️ Остановка старых контейнеров..."
    docker-compose down 2>/dev/null || true
    
    # Сборка и запуск
    echo "🔨 Сборка контейнеров..."
    docker-compose build --no-cache
    
    echo "🚀 Запуск контейнеров..."
    docker-compose up -d
    
    echo "⏳ Ожидание запуска сервисов (45 секунд)..."
    sleep 45
    
    check_status
    
    echo ""
    echo "🎉 СИСТЕМА ЗАПУЩЕНА!"
    echo ""
    echo "🌐 Доступ:"
    echo "• Веб-сайт: https://studiofinance.ru"
    echo "• API: https://studiofinance.ru/api"
    echo "• Mini App: https://t.me/FinanceStudio_bot/Finio"
    echo ""
}

# Функция остановки
stop_services() {
    echo "⏹️ ОСТАНОВКА СЕРВИСОВ..."
    if [ -f "$WORK_DIR/docker-compose.yml" ]; then
        cd "$WORK_DIR"
        docker-compose down
        echo "✅ Все сервисы остановлены"
    else
        echo "❌ Проект не найден"
    fi
}

# Функция перезапуска
restart_services() {
    echo "🔄 ПЕРЕЗАПУСК СЕРВИСОВ..."
    if [ -f "$WORK_DIR/docker-compose.yml" ]; then
        cd "$WORK_DIR"
        docker-compose restart
        sleep 15
        check_status
    else
        echo "❌ Проект не найден"
    fi
}

# Функция просмотра логов
show_logs() {
    echo "📋 ЛОГИ СЕРВИСОВ (Ctrl+C для выхода):"
    if [ -f "$WORK_DIR/docker-compose.yml" ]; then
        cd "$WORK_DIR"
        docker-compose logs -f
    else
        echo "❌ Проект не найден"
    fi
}

# Функция полной переустановки
full_reinstall() {
    echo "🔥 ПОЛНАЯ ПЕРЕУСТАНОВКА..."
    echo "⚠️  Это удалит ВСЕ данные! Продолжить? (y/N)"
    read -p "> " confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        # Остановка и удаление
        if [ -f "$WORK_DIR/docker-compose.yml" ]; then
            cd "$WORK_DIR"
            docker-compose down --volumes --remove-orphans 2>/dev/null || true
        fi
        
        # Очистка Docker
        docker system prune -af --volumes 2>/dev/null || true
        
        # Удаление директории
        rm -rf "$WORK_DIR"
        
        # Переустановка
        install_system
        start_services
        
        echo "✅ Полная переустановка завершена!"
    else
        echo "❌ Переустановка отменена"
    fi
}

# Главное меню
show_menu() {
    echo ""
    echo "🎯 FINIO CONTROL PANEL"
    echo "====================="
    echo "1) 🚀 Запустить систему"
    echo "2) ⏹️  Остановить систему"
    echo "3) 🔄 Перезапустить систему"
    echo "4) 📊 Показать статус"
    echo "5) 📋 Показать логи"
    echo "6) 📦 Установить/обновить"
    echo "7) 🔥 Полная переустановка"
    echo "0) ❌ Выход"
    echo ""
    read -p "Выберите действие: " choice
    
    case $choice in
        1) start_services ;;
        2) stop_services ;;
        3) restart_services ;;
        4) check_status ;;
        5) show_logs ;;
        6) install_system ;;
        7) full_reinstall ;;
        0) echo "👋 До свидания!"; exit 0 ;;
        *) echo "❌ Неверный выбор" ;;
    esac
}

# Проверка аргументов командной строки
case "${1:-}" in
    "start") start_services ;;
    "stop") stop_services ;;
    "restart") restart_services ;;
    "status") check_status ;;
    "logs") show_logs ;;
    "install") install_system ;;
    "reinstall") full_reinstall ;;
    *)
        echo "🎯 FINIO STARTER v2.0"
        echo "Использование: $0 [start|stop|restart|status|logs|install|reinstall]"
        echo ""
        
        if [ $# -eq 0 ]; then
            # Автоматический запуск если проект не установлен
            if [ ! -f "$WORK_DIR/docker-compose.yml" ]; then
                echo "🔍 Проект не найден. Запускаю автоматическую установку..."
                install_system
                start_services
            else
                # Интерактивное меню
                while true; do
                    show_menu
                    echo ""
                    read -p "Нажмите Enter для продолжения..."
                done
            fi
        fi
        ;;
esac