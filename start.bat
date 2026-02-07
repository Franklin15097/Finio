@echo off
echo ===================================
echo Studio Finance - Запуск проекта
echo ===================================

if not exist logs mkdir logs

echo Запуск Backend сервера...
start "Backend Server" cmd /k "cd server && node index.js"

timeout /t 3 /nobreak >nul

echo Запуск Mini App Frontend...
start "Mini App" cmd /k "cd mini-app-frontend && npm run dev"

echo Запуск Website Frontend...
start "Website" cmd /k "cd website-frontend && npm run dev"

echo.
echo Все сервисы запущены!
echo.
echo Сервисы:
echo   Backend:     http://localhost:3000
echo   Mini App:    http://localhost:5173
echo   Website:     http://localhost:5174
echo.
pause
