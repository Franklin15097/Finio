@echo off
echo 🚀 Запуск Finio в режиме разработки...

REM Проверяем, установлены ли зависимости
if not exist "node_modules" (
    echo 📦 Устанавливаем зависимости...
    call npm install
)

if not exist "server\node_modules" (
    echo 📦 Устанавливаем зависимости сервера...
    cd server
    call npm install
    cd ..
)

if not exist "website-frontend\node_modules" (
    echo 📦 Устанавливаем зависимости веб-сайта...
    cd website-frontend
    call npm install
    cd ..
)

if not exist "mini-app-frontend\node_modules" (
    echo 📦 Устанавливаем зависимости мини-приложения...
    cd mini-app-frontend
    call npm install
    cd ..
)

echo ✅ Все зависимости установлены!
echo.
echo 🌟 Запускаем сервисы...
echo.
echo 📍 Доступные адреса:
echo    🖥️  Веб-сайт:        http://localhost:5173
echo    📱 Мини-приложение:  http://localhost:5174
echo    🔧 API сервер:       http://localhost:3000
echo.
echo 💡 Для остановки нажмите Ctrl+C в каждом окне
echo.

REM Запускаем сервисы в отдельных окнах
start "API Server" cmd /k "cd server && npm run dev"
timeout /t 3 /nobreak > nul
start "Website" cmd /k "cd website-frontend && npm run dev"
start "Mini App" cmd /k "cd mini-app-frontend && npm run dev"

echo 🎉 Все сервисы запущены!
pause