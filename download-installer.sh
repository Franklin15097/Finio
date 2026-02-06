#!/bin/bash

# Скрипт для загрузки автоматического установщика на сервер
# Запустите на сервере: curl -sSL https://raw.githubusercontent.com/Franklin15097/Finio/main/download-installer.sh | bash

echo "🚀 Загрузка автоматического установщика Finio..."

# Загружаем установщик
curl -sSL https://raw.githubusercontent.com/Franklin15097/Finio/main/auto-install.sh -o auto-install.sh

# Делаем исполняемым
chmod +x auto-install.sh

echo "✅ Установщик загружен!"
echo ""
echo "Теперь запустите:"
echo "sudo ./auto-install.sh"