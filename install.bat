@echo off
chcp 65001 >nul
echo 🚀 Установка Studio Finance Mini App...
echo.

REM Проверка Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js не установлен!
    echo Установите Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js установлен
node -v
npm -v
echo.

REM Установка зависимостей
echo 📦 Установка зависимостей...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Зависимости установлены успешно!
) else (
    echo.
    echo ❌ Ошибка установки зависимостей
    pause
    exit /b 1
)

REM Проверка .env файла
if not exist .env (
    echo.
    echo ⚠️  Файл .env не найден!
    echo Создайте .env файл с настройками
    echo.
) else (
    echo.
    echo ✅ Файл .env найден
)

echo.
echo 🎉 Установка завершена!
echo.
echo Для запуска:
echo   npm start        - запуск сервера
echo   npm run bot      - запуск бота
echo.
echo Development режим:
echo   npm run dev      - сервер с автоперезагрузкой
echo   npm run dev:bot  - бот с автоперезагрузкой
echo.
pause
