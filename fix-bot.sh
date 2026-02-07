#!/bin/bash

# Исправление проблем с ботом
# Использование: sudo ./fix-bot.sh

set -e

if [ "$EUID" -ne 0 ]; then
    echo "Запустите с правами root: sudo ./fix-bot.sh"
    exit 1
fi

echo "🔧 ИСПРАВЛЕНИЕ ПРОБЛЕМ С БОТОМ"
echo "=============================="

PROJECT_DIR="/var/www/finio"
BOT_TOKEN="8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34"
SERVER_IP="85.235.205.99"

# 1. Остановка сервиса
echo "1. Остановка сервиса..."
systemctl stop finio

# 2. Проверка логов
echo "2. Последние ошибки:"
journalctl -u finio -n 10 --no-pager

# 3. Создание простого рабочего backend
echo "3. Создание простого backend..."
cat > $PROJECT_DIR/backend/main.py << 'EOF'
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from datetime import datetime
import asyncio
import aiohttp

app = FastAPI(title="Finio API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = "/var/lib/finio"
os.makedirs(DATA_DIR, exist_ok=True)

BOT_TOKEN = "8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34"
SERVER_IP = "85.235.205.99"

def load_json(filename: str, default=None):
    if default is None:
        default = []
    try:
        if os.path.exists(filename):
            with open(filename, 'r', encoding='utf-8') as f:
                return json.load(f)
        return default
    except:
        return default

def save_json(filename: str, data):
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except:
        return False

async def send_telegram_message(chat_id: int, text: str, reply_markup=None):
    """Отправка сообщения в Telegram"""
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    data = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML"
    }
    if reply_markup:
        data["reply_markup"] = reply_markup
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=data) as response:
                return await response.json()
    except Exception as e:
        print(f"Ошибка отправки сообщения: {e}")
        return None

@app.get("/")
async def root():
    return {"message": "Finio API работает!", "status": "ok"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/transactions")
async def get_transactions():
    transactions = load_json(f"{DATA_DIR}/transactions.json")
    return transactions

@app.post("/api/transactions")
async def create_transaction(type: str, amount: float, title: str, description: str = ""):
    transactions = load_json(f"{DATA_DIR}/transactions.json")
    
    new_id = max([t.get('id', 0) for t in transactions], default=0) + 1
    
    transaction = {
        "id": new_id,
        "type": type,
        "amount": amount,
        "title": title,
        "description": description,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "created_at": datetime.now().isoformat()
    }
    
    transactions.append(transaction)
    save_json(f"{DATA_DIR}/transactions.json", transactions)
    return transaction

@app.get("/api/stats")
async def get_stats():
    transactions = load_json(f"{DATA_DIR}/transactions.json")
    
    total_income = sum(t['amount'] for t in transactions if t['type'] == 'income')
    total_expense = sum(t['amount'] for t in transactions if t['type'] == 'expense')
    balance = total_income - total_expense
    
    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": balance,
        "transactions_count": len(transactions)
    }

@app.post("/api/init-demo")
async def init_demo():
    demo_transactions = [
        {
            "id": 1, "type": "income", "amount": 50000, "title": "Зарплата",
            "description": "Зарплата за январь", "date": "2024-01-31",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": 2, "type": "expense", "amount": 3500, "title": "Продукты",
            "description": "Покупки в магазине", "date": "2024-02-01",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": 3, "type": "expense", "amount": 1200, "title": "Транспорт",
            "description": "Проездной билет", "date": "2024-02-02",
            "created_at": datetime.now().isoformat()
        }
    ]
    
    save_json(f"{DATA_DIR}/transactions.json", demo_transactions)
    return {"message": "Демо данные созданы"}

@app.post("/bot-webhook/")
async def bot_webhook(request: Request):
    """Обработка сообщений от Telegram бота"""
    try:
        data = await request.json()
        print(f"Получено сообщение от бота: {data}")
        
        if "message" in data:
            message = data["message"]
            chat_id = message["chat"]["id"]
            text = message.get("text", "")
            
            print(f"Обрабатываем сообщение: {text} от {chat_id}")
            
            if text.startswith("/start"):
                welcome_text = """🚀 <b>Добро пожаловать в Finio!</b>

💰 Ваш личный помощник по управлению финансами

<b>Команды:</b>
/balance - Показать баланс
/stats - Статистика
/app - Открыть приложение
/help - Справка

<b>Быстрое добавление:</b>
Просто напишите сумму и описание:
<code>500 кофе</code> - добавит расход
<code>+5000 зарплата</code> - добавит доход"""
                
                keyboard = {
                    "inline_keyboard": [
                        [{"text": "📱 Открыть приложение", "url": f"http://{SERVER_IP}"}],
                        [{"text": "📊 Статистика", "callback_data": "stats"}],
                        [{"text": "💰 Баланс", "callback_data": "balance"}]
                    ]
                }
                
                await send_telegram_message(chat_id, welcome_text, keyboard)
                
            elif text.startswith("/balance"):
                try:
                    stats_data = await get_stats()
                    balance_text = f"""💰 <b>Ваш баланс</b>

📈 Доходы: {stats_data['total_income']:,.0f} ₽
📉 Расходы: {stats_data['total_expense']:,.0f} ₽
💵 Баланс: {stats_data['balance']:,.0f} ₽
📊 Транзакций: {stats_data['transactions_count']}"""
                    
                    keyboard = {
                        "inline_keyboard": [
                            [{"text": "📱 Открыть приложение", "url": f"http://{SERVER_IP}"}]
                        ]
                    }
                    
                    await send_telegram_message(chat_id, balance_text, keyboard)
                except Exception as e:
                    await send_telegram_message(chat_id, f"Ошибка получения баланса: {e}")
                
            elif text.startswith("/app"):
                app_text = f"""📱 <b>Веб-приложение Finio</b>

Откройте полную версию приложения в браузере для:
• Детальной статистики
• Управления категориями  
• Графиков и отчетов
• Экспорта данных"""
                
                keyboard = {
                    "inline_keyboard": [
                        [{"text": "🚀 Открыть приложение", "url": f"http://{SERVER_IP}"}]
                    ]
                }
                
                await send_telegram_message(chat_id, app_text, keyboard)
                
            elif text.startswith("/help"):
                help_text = """🆘 <b>Справка по командам</b>

<b>Основные команды:</b>
/start - Начать работу
/balance - Показать баланс
/app - Открыть приложение

<b>Быстрое добавление транзакций:</b>
<code>500 кофе</code> - расход 500₽
<code>+5000 зарплата</code> - доход 5000₽

<b>Примеры:</b>
• <code>300 обед</code>
• <code>+50000 зарплата</code>
• <code>1500 такси</code>"""
                
                await send_telegram_message(chat_id, help_text)
                
            else:
                # Попытка парсинга транзакции
                if text and (text[0].isdigit() or text.startswith('+')):
                    try:
                        parts = text.split(' ', 1)
                        amount_str = parts[0]
                        title = parts[1] if len(parts) > 1 else "Транзакция"
                        
                        if amount_str.startswith('+'):
                            transaction_type = "income"
                            amount = float(amount_str[1:])
                        else:
                            transaction_type = "expense"
                            amount = float(amount_str)
                        
                        # Создаем транзакцию
                        await create_transaction(transaction_type, amount, title)
                        
                        emoji = "📈" if transaction_type == "income" else "📉"
                        sign = "+" if transaction_type == "income" else "-"
                        
                        success_text = f"""✅ <b>Транзакция добавлена!</b>

{emoji} {sign}{amount:,.0f} ₽ - {title}
📅 {datetime.now().strftime('%d.%m.%Y')}"""
                        
                        keyboard = {
                            "inline_keyboard": [
                                [{"text": "💰 Баланс", "callback_data": "balance"}],
                                [{"text": "📱 Открыть приложение", "url": f"http://{SERVER_IP}"}]
                            ]
                        }
                        
                        await send_telegram_message(chat_id, success_text, keyboard)
                        
                    except Exception as e:
                        await send_telegram_message(chat_id, f"❌ Ошибка: {e}. Используйте: <code>500 описание</code>")
                else:
                    await send_telegram_message(chat_id, "🤔 Не понимаю команду. Используйте /help для справки")
        
        return {"status": "ok"}
        
    except Exception as e:
        print(f"Ошибка webhook: {e}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

chown finio:finio $PROJECT_DIR/backend/main.py

# 4. Установка aiohttp
echo "4. Установка aiohttp..."
sudo -u finio $PROJECT_DIR/backend/venv/bin/pip install aiohttp

# 5. Тест приложения
echo "5. Тест приложения..."
cd $PROJECT_DIR/backend
if sudo -u finio timeout 10s $PROJECT_DIR/backend/venv/bin/python -c "import main; print('OK')" 2>/dev/null; then
    echo "✅ Приложение загружается"
else
    echo "❌ Ошибка загрузки приложения"
    sudo -u finio $PROJECT_DIR/backend/venv/bin/python -c "import main" || true
fi

# 6. Запуск сервиса
echo "6. Запуск сервиса..."
systemctl start finio

sleep 10

# 7. Проверка работы
echo "7. Проверка работы..."
if systemctl is-active --quiet finio; then
    echo "✅ Сервис работает"
else
    echo "❌ Сервис не работает"
    journalctl -u finio -n 10 --no-pager
fi

if curl -f -s http://localhost:8000/health >/dev/null 2>&1; then
    echo "✅ API отвечает"
else
    echo "❌ API не отвечает"
fi

# 8. Настройка webhook
echo "8. Настройка webhook..."
WEBHOOK_URL="http://$SERVER_IP/bot-webhook/"

# Удаляем старый webhook
curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/deleteWebhook" >/dev/null

sleep 2

# Устанавливаем новый webhook
WEBHOOK_RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" \
     -H "Content-Type: application/json" \
     -d "{\"url\": \"$WEBHOOK_URL\"}")

echo "Ответ Telegram: $WEBHOOK_RESPONSE"

if echo "$WEBHOOK_RESPONSE" | grep -q '"ok":true'; then
    echo "✅ Webhook настроен"
else
    echo "❌ Ошибка webhook"
fi

# 9. Проверка webhook
echo "9. Проверка webhook..."
WEBHOOK_INFO=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo")
echo "Информация о webhook: $WEBHOOK_INFO"

echo ""
echo "🔧 ИСПРАВЛЕНИЕ ЗАВЕРШЕНО!"
echo ""
echo "🤖 Теперь найдите бота в Telegram и отправьте /start"
echo "📱 Приложение: http://$SERVER_IP"
echo "� Webhookт: $WEBHOOK_URL"
echo ""
echo "📊 Мониторинг:"
echo "   sudo journalctl -u finio -f"
echo "   sudo systemctl status finio"