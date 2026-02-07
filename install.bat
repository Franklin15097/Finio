@echo off
echo ===================================
echo Studio Finance - Установка проекта
echo ===================================

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Ошибка: Node.js не установлен
    echo Установите Node.js 18+ с https://nodejs.org
    exit /b 1
)

echo Node.js версия:
node -v

echo.
echo Установка зависимостей сервера...
cd server
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Ошибка установки зависимостей сервера
    exit /b 1
)
cd ..

echo.
echo Установка зависимостей Mini App...
cd mini-app-frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Ошибка установки зависимостей Mini App
    exit /b 1
)
cd ..

echo.
echo Установка зависимостей Website...
cd website-frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Ошибка установки зависимостей Website
    exit /b 1
)
cd ..

echo.
echo Установка завершена успешно!
echo.
echo Для запуска используйте: start.bat
pause
