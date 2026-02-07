#!/bin/bash

# Исправление webhook - настройка HTTPS
# Использование: sudo ./fix-webhook.sh

set -e

if [ "$EUID" -ne 0 ]; then
    echo "Запустите с правами root: sudo ./fix-webhook.sh"
    exit 1
fi

echo "🔒 ИСПРАВЛЕНИЕ WEBHOOK - НАСТРОЙКА HTTPS"
echo "======================================"

BOT_TOKEN="8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34"
DOMAIN="studiofinance.ru"
SERVER_IP="85.235.205.99"

# 1. Удаляем webhook (переходим на polling)
echo "1. Удаление webhook..."
curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/deleteWebhook"

# 2. Создаем простого polling бота
echo "2. Создание polling бота..."
cat > /var/www/finio/backend/bot.py << 'EOF'
import asyncio
import aiohttp
import json
import os
from datetime import datetime

BOT_TOKEN = "8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34"
API_BASE = "https://api.telegram.org/bot" + BOT_TOKEN
DATA_DIR = "/var/lib/finio"
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

async def send_message(chat_id, text, reply_markup=None):
    """Отправка сообщения"""
    url = f"{API_BASE}/sendMessage"
    data = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML"
    }
    if reply_markup:
        data["reply_markup"] = reply_markup
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(url, json=data) as response:
                return await response.json()
        except Exception as e:
            print(f"Ошибка отправки: {e}")
            return None

async def get_stats():
    """Получение статистики"""
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

async def create_transaction(transaction_type, amount, title, description=""):
    """Создание транзакции"""
    transactions = load_json(f"{DATA_DIR}/transactions.json")
    
    new_id = max([t.get('id', 0) for t in transactions], default=0) + 1
    
    transaction = {
        "id": new_id,
        "type": transaction_type,
        "amount": amount,
        "title": title,
        "description": description,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "created_at": datetime.now().isoformat()
    }
    
    transactions.append(transaction)
    save_json(f"{DATA_DIR}/transactions.json", transactions)
    return transaction

async def handle_message(message):
    """Обработка сообщения"""
    chat_id = message["chat"]["id"]
    text = message.get("text", "")
    
    print(f"Получено сообщение: {text} от {chat_id}")
    
    if text.startswith("/start"):
        welcome_text = """🚀 <b>Добро пожаловать в Finio!</b>

💰 Ваш личный помощник по управлению финансами

<b>Команды:</b>
/balance - Показать баланс
/stats - Статистика  
/app - Открыть приложение
/help - Справка

<b>Быстрое добавление:</b>
<code>500 кофе</code> - добавит расход
<code>+5000 зарплата</code> - добавит доход"""
        
        keyboard = {
            "inline_keyboard": [
                [{"text": "📱 Открыть приложение", "url": f"http://{SERVER_IP}"}],
                [{"text": "📊 Статистика", "callback_data": "stats"}],
                [{"text": "💰 Баланс", "callback_data": "balance"}]
            ]
        }
        
        await send_message(chat_id, welcome_text, keyboard)
        
    elif text.startswith("/balance"):
        stats = await get_stats()
        balance_text = f"""💰 <b>Ваш баланс</b>

📈 Доходы: {stats['total_income']:,.0f} ₽
📉 Расходы: {stats['total_expense']:,.0f} ₽
💵 Баланс: {stats['balance']:,.0f} ₽
📊 Транзакций: {stats['transactions_count']}"""
        
        keyboard = {
            "inline_keyboard": [
                [{"text": "📱 Открыть приложение", "url": f"http://{SERVER_IP}"}]
            ]
        }
        
        await send_message(chat_id, balance_text, keyboard)
        
    elif text.startswith("/stats"):
        stats = await get_stats()
        transactions = load_json(f"{DATA_DIR}/transactions.json")
        recent = transactions[-3:] if transactions else []
        
        stats_text = f"""📊 <b>Статистика</b>

💰 Общий баланс: {stats['balance']:,.0f} ₽
📈 Доходы: {stats['total_income']:,.0f} ₽  
📉 Расходы: {stats['total_expense']:,.0f} ₽

<b>Последние операции:</b>"""
        
        for t in recent:
            emoji = "📈" if t['type'] == 'income' else "📉"
            sign = "+" if t['type'] == 'income' else "-"
            stats_text += f"\n{emoji} {sign}{t['amount']:,.0f} ₽ - {t['title']}"
        
        await send_message(chat_id, stats_text)
        
    elif text.startswith("/app"):
        app_text = f"""📱 <b>Веб-приложение Finio</b>

Откройте полную версию приложения в браузере для:
• Детальной статистики
• Управления категориями  
• Графиков и отчетов"""
        
        keyboard = {
            "inline_keyboard": [
                [{"text": "🚀 Открыть приложение", "url": f"http://{SERVER_IP}"}]
            ]
        }
        
        await send_message(chat_id, app_text, keyboard)
        
    elif text.startswith("/help"):
        help_text = """🆘 <b>Справка по командам</b>

<b>Основные команды:</b>
/start - Начать работу
/balance - Показать баланс
/stats - Статистика
/app - Открыть приложение

<b>Быстрое добавление:</b>
<code>500 кофе</code> - расход 500₽
<code>+5000 зарплата</code> - доход 5000₽

<b>Примеры:</b>
• <code>300 обед</code>
• <code>+50000 зарплата</code>"""
        
        await send_message(chat_id, help_text)
        
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
                
                await create_transaction(transaction_type, amount, title)
                
                emoji = "📈" if transaction_type == "income" else "📉"
                sign = "+" if transaction_type == "income" else "-"
                
                success_text = f"""✅ <b>Транзакция добавлена!</b>

{emoji} {sign}{amount:,.0f} ₽ - {title}
📅 {datetime.now().strftime('%d.%m.%Y')}"""
                
                await send_message(chat_id, success_text)
                
            except Exception as e:
                await send_message(chat_id, f"❌ Ошибка: {e}")
        else:
            await send_message(chat_id, "🤔 Не понимаю команду. Используйте /help")

async def handle_callback(callback_query):
    """Обработка callback кнопок"""
    chat_id = callback_query["message"]["chat"]["id"]
    data = callback_query["data"]
    
    if data == "balance":
        stats = await get_stats()
        balance_text = f"""💰 <b>Ваш баланс</b>

📈 Доходы: {stats['total_income']:,.0f} ₽
📉 Расходы: {stats['total_expense']:,.0f} ₽
💵 Баланс: {stats['balance']:,.0f} ₽"""
        
        await send_message(chat_id, balance_text)
        
    elif data == "stats":
        stats = await get_stats()
        stats_text = f"""📊 <b>Статистика</b>

💰 Баланс: {stats['balance']:,.0f} ₽
📈 Доходы: {stats['total_income']:,.0f} ₽  
📉 Расходы: {stats['total_expense']:,.0f} ₽
📋 Транзакций: {stats['transactions_count']}"""
        
        await send_message(chat_id, stats_text)

async def get_updates(offset=0):
    """Получение обновлений"""
    url = f"{API_BASE}/getUpdates"
    params = {"offset": offset, "timeout": 30}
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(url, params=params) as response:
                return await response.json()
        except Exception as e:
            print(f"Ошибка получения обновлений: {e}")
            return None

async def main():
    """Основной цикл бота"""
    print("🤖 Запуск Telegram бота...")
    offset = 0
    
    while True:
        try:
            updates = await get_updates(offset)
            
            if updates and updates.get("ok"):
                for update in updates.get("result", []):
                    offset = update["update_id"] + 1
                    
                    if "message" in update:
                        await handle_message(update["message"])
                    elif "callback_query" in update:
                        await handle_callback(update["callback_query"])
            
            await asyncio.sleep(1)
            
        except Exception as e:
            print(f"Ошибка в основном цикле: {e}")
            await asyncio.sleep(5)

if __name__ == "__main__":
    asyncio.run(main())
EOF

chown finio:finio /var/www/finio/backend/bot.py

# 3. Создание systemd сервиса для бота
echo "3. Создание сервиса бота..."
cat > /etc/systemd/system/finio-bot.service << 'EOF'
[Unit]
Description=Finio Telegram Bot
After=network.target

[Service]
Type=simple
User=finio
Group=finio
WorkingDirectory=/var/www/finio/backend
Environment=PATH=/var/www/finio/backend/venv/bin
ExecStart=/var/www/finio/backend/venv/bin/python bot.py
Restart=always
RestartSec=5
StandardOutput=append:/var/log/finio/bot.log
StandardError=append:/var/log/finio/bot-error.log

[Install]
WantedBy=multi-user.target
EOF

# 4. Упрощение основного приложения (убираем webhook)
echo "4. Упрощение основного приложения..."
cat > /var/www/finio/backend/main.py << 'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from datetime import datetime

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

chown finio:finio /var/www/finio/backend/main.py

# 5. Перезапуск сервисов
echo "5. Перезапуск сервисов..."
systemctl daemon-reload
systemctl restart finio
systemctl enable finio-bot
systemctl start finio-bot

sleep 10

# 6. Проверка
echo "6. Проверка работы..."
if systemctl is-active --quiet finio; then
    echo "✅ API сервис работает"
else
    echo "❌ API сервис не работает"
fi

if systemctl is-active --quiet finio-bot; then
    echo "✅ Telegram бот работает"
else
    echo "❌ Telegram бот не работает"
    journalctl -u finio-bot -n 5 --no-pager
fi

echo ""
echo "🔒 ИСПРАВЛЕНИЕ WEBHOOK ЗАВЕРШЕНО!"
echo ""
echo "🤖 Теперь бот работает через polling (без webhook)"
echo "📱 Приложение: http://$SERVER_IP"
echo ""
echo "✅ Найдите бота в Telegram и отправьте /start"
echo ""
echo "📊 Мониторинг:"
echo "   sudo systemctl status finio-bot"
echo "   sudo journalctl -u finio-bot -f"
echo "   sudo systemctl status finio"