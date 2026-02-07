#!/bin/bash

echo "🔍 ПОИСК ВСЕХ БОТОВ НА СЕРВЕРЕ..."

echo "1. 🔍 Поиск всех Python процессов:"
ps aux | grep python | grep -v grep

echo ""
echo "2. 🔍 Поиск процессов на портах 8000-8010:"
for port in {8000..8010}; do
    lsof -i :$port 2>/dev/null && echo "Порт $port занят"
done

echo ""
echo "3. 🔍 Поиск всех systemd сервисов с 'bot' или 'finio':"
systemctl list-units --all | grep -E "(bot|finio)" || echo "Systemd сервисы не найдены"

echo ""
echo "4. 🔍 Поиск всех Docker контейнеров:"
docker ps -a

echo ""
echo "5. 🔍 Поиск всех директорий с ботами:"
find /var/www /home /opt /usr/local -name "*bot*" -o -name "*finio*" 2>/dev/null | head -20

echo ""
echo "6. 🔍 Поиск всех файлов с токеном бота:"
grep -r "8388539678" /var/www /home /opt 2>/dev/null | head -10

echo ""
echo "7. 🔍 Поиск cron задач:"
crontab -l 2>/dev/null | grep -E "(bot|finio)" || echo "Cron задачи не найдены"

echo ""
echo "8. 🔍 Поиск в /etc/systemd/system:"
ls -la /etc/systemd/system/ | grep -E "(bot|finio)" || echo "Systemd файлы не найдены"

echo ""
echo "9. 🔍 Поиск запущенных webhook серверов:"
netstat -tulpn | grep :80 || echo "Webhook серверы не найдены"

echo ""
echo "10. 🔍 Проверка nginx конфигурации:"
nginx -T 2>/dev/null | grep -E "(bot|finio|8000)" | head -10 || echo "Nginx конфигурация не найдена"

echo ""
echo "🎯 НАЙДЕННЫЕ ПРОБЛЕМЫ НУЖНО ИСПРАВИТЬ ВРУЧНУЮ!"