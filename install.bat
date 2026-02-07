@echo off
chcp 65001 >nul
echo ========================================
echo 📦 Установка зависимостей Finio
echo ========================================
echo.

echo [1/3] Установка зависимостей Backend...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ Ошибка установки Backend зависимостей
    pause
    exit /b 1
)
echo ✅ Backend зависимости установлены
echo.

echo [2/3] Установка зависимостей Website Frontend...
cd ..\website-frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Ошибка установки Website зависимостей
    pause
    exit /b 1
)
echo ✅ Website зависимости установлены
echo.

echo [3/3] Установка зависимостей Mini App Frontend...
cd ..\mini-app-frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Ошибка установки Mini App зависимостей
    pause
    exit /b 1
)
echo ✅ Mini App зависимости установлены
echo.

cd ..

echo ========================================
echo ✅ Все зависимости успешно установлены!
echo ========================================
echo.
echo Следующие шаги:
echo 1. Создайте файл .env в папке server
echo 2. Добавьте BOT_TOKEN и JWT_SECRET
echo 3. Запустите start.bat для запуска проекта
echo.
pause
