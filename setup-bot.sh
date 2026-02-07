#!/bin/bash

# Настройка Telegram бота для Finio
# Использование: sudo ./setup-bot.sh

set -e

if [ "$EUID" -ne 0 ]; then
    echo "Запустите с правами root: sudo ./setup-bot.sh"
    exit 1
fi

echo "🤖 НАСТРОЙКА TELEGRAM БОТА"
echo "=========================="

PROJECT_DIR="/var/www/finio"
BOT_TOKEN="8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34"
SERVER_IP="85.235.205.99"
WEBHOOK_URL="http://$SERVER_IP/bot-webhook/"

# 1. Обновляем backend с поддержкой бота
echo "1. Обновление backend с ботом..."

cat > $PROJECT_DIR/backend/main.py << 'EOF'
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import os
import httpx
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

BOT_TOKEN = "8388539678:AAH1t-XurvydCG-cZBGme0suPUt4RwMqm34"
SERVER_IP = "85.235.205.99"

class Transaction(BaseModel):
    id: int
    type: str
    amount: float
    title: str
    description: Optional[str] = None
    date: str
    created_at: str

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
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=data)
            return response.json()
        except:
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
        
        if "message" in data:
            message = data["message"]
            chat_id = message["chat"]["id"]
            text = message.get("text", "")
            
            if text.startswith("/start"):
                welcome_text = f"""
🚀 <b>Добро пожаловать в Finio!</b>

💰 Ваш личный помощник по управлению финансами

<b>Команды:</b>
/balance - Показать баланс
/stats - Статистика
/app - Открыть приложение
/help - Справка

<b>Быстрое добавление:</b>
Просто напишите сумму и описание:
<code>500 кофе</code> - добавит расход
<code>+5000 зарплата</code> - добавит доход
                """
                
                keyboard = {
                    "inline_keyboard": [
                        [{"text": "📱 Открыть приложение", "url": f"http://{SERVER_IP}"}],
                        [{"text": "📊 Статистика", "callback_data": "stats"}],
                        [{"text": "💰 Баланс", "callback_data": "balance"}]
                    ]
                }
                
                await send_telegram_message(chat_id, welcome_text, keyboard)
                
            elif text.startswith("/balance"):
                stats = await get_stats()
                balance_text = f"""
💰 <b>Ваш баланс</b>

📈 Доходы: {stats['total_income']:,.0f} ₽
📉 Расходы: {stats['total_expense']:,.0f} ₽
💵 Баланс: {stats['balance']:,.0f} ₽
📊 Транзакций: {stats['transactions_count']}
                """
                
                keyboard = {
                    "inline_keyboard": [
                        [{"text": "📱 Открыть приложение", "url": f"http://{SERVER_IP}"}]
                    ]
                }
                
                await send_telegram_message(chat_id, balance_text, keyboard)
                
            elif text.startswith("/stats"):
                stats = await get_stats()
                transactions = load_json(f"{DATA_DIR}/transactions.json")
                recent = transactions[-3:] if transactions else []
                
                stats_text = f"""
📊 <b>Статистика</b>

💰 Общий баланс: {stats['balance']:,.0f} ₽
📈 Доходы: {stats['total_income']:,.0f} ₽  
📉 Расходы: {stats['total_expense']:,.0f} ₽
📋 Всего транзакций: {stats['transactions_count']}

<b>Последние операции:</b>
                """
                
                for t in recent:
                    emoji = "📈" if t['type'] == 'income' else "📉"
                    sign = "+" if t['type'] == 'income' else "-"
                    stats_text += f"\n{emoji} {sign}{t['amount']:,.0f} ₽ - {t['title']}"
                
                keyboard = {
                    "inline_keyboard": [
                        [{"text": "📱 Открыть приложение", "url": f"http://{SERVER_IP}"}]
                    ]
                }
                
                await send_telegram_message(chat_id, stats_text, keyboard)
                
            elif text.startswith("/app"):
                app_text = f"""
📱 <b>Веб-приложение Finio</b>

Откройте полную версию приложения в браузере для:
• Детальной статистики
• Управления категориями  
• Графиков и отчетов
• Экспорта данных
                """
                
                keyboard = {
                    "inline_keyboard": [
                        [{"text": "🚀 Открыть приложение", "url": f"http://{SERVER_IP}"}]
                    ]
                }
                
                await send_telegram_message(chat_id, app_text, keyboard)
                
            elif text.startswith("/help"):
                help_text = """
🆘 <b>Справка по командам</b>

<b>Основные команды:</b>
/start - Начать работу
/balance - Показать баланс
/stats - Статистика
/app - Открыть приложение

<b>Быстрое добавление транзакций:</b>
<code>500 кофе</code> - расход 500₽
<code>+5000 зарплата</code> - доход 5000₽
<code>1200 продукты в магазине</code> - расход с описанием

<b>Примеры:</b>
• <code>300 обед</code>
• <code>+50000 зарплата</code>
• <code>1500 такси до аэропорта</code>
                """
                
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
                        
                        success_text = f"""
✅ <b>Транзакция добавлена!</b>

{emoji} {sign}{amount:,.0f} ₽ - {title}
📅 {datetime.now().strftime('%d.%m.%Y')}
                        """
                        
                        keyboard = {
                            "inline_keyboard": [
                                [{"text": "💰 Баланс", "callback_data": "balance"}],
                                [{"text": "📱 Открыть приложение", "url": f"http://{SERVER_IP}"}]
                            ]
                        }
                        
                        await send_telegram_message(chat_id, success_text, keyboard)
                        
                    except:
                        await send_telegram_message(chat_id, "❌ Неверный формат. Используйте: <code>500 описание</code> или <code>+1000 доход</code>")
                else:
                    await send_telegram_message(chat_id, "🤔 Не понимаю команду. Используйте /help для справки")
        
        elif "callback_query" in data:
            callback = data["callback_query"]
            chat_id = callback["message"]["chat"]["id"]
            callback_data = callback["data"]
            
            if callback_data == "balance":
                stats = await get_stats()
                balance_text = f"""
💰 <b>Ваш баланс</b>

📈 Доходы: {stats['total_income']:,.0f} ₽
📉 Расходы: {stats['total_expense']:,.0f} ₽
💵 Баланс: {stats['balance']:,.0f} ₽
📊 Транзакций: {stats['transactions_count']}
                """
                await send_telegram_message(chat_id, balance_text)
                
            elif callback_data == "stats":
                stats = await get_stats()
                transactions = load_json(f"{DATA_DIR}/transactions.json")
                recent = transactions[-3:] if transactions else []
                
                stats_text = f"""
📊 <b>Статистика</b>

💰 Общий баланс: {stats['balance']:,.0f} ₽
📈 Доходы: {stats['total_income']:,.0f} ₽  
📉 Расходы: {stats['total_expense']:,.0f} ₽

<b>Последние операции:</b>
                """
                
                for t in recent:
                    emoji = "📈" if t['type'] == 'income' else "📉"
                    sign = "+" if t['type'] == 'income' else "-"
                    stats_text += f"\n{emoji} {sign}{t['amount']:,.0f} ₽ - {t['title']}"
                
                await send_telegram_message(chat_id, stats_text)
        
        return {"status": "ok"}
        
    except Exception as e:
        print(f"Ошибка webhook: {e}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

chown finio:finio $PROJECT_DIR/backend/main.py

# 2. Установка дополнительных зависимостей
echo "2. Установка httpx для Telegram API..."
sudo -u finio $PROJECT_DIR/backend/venv/bin/pip install httpx

# 3. Перезапуск сервиса
echo "3. Перезапуск backend..."
systemctl restart finio

sleep 5

# 4. Настройка webhook
echo "4. Настройка Telegram webhook..."
WEBHOOK_RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" \
     -H "Content-Type: application/json" \
     -d "{\"url\": \"$WEBHOOK_URL\"}")

echo "Ответ Telegram API: $WEBHOOK_RESPONSE"

if echo "$WEBHOOK_RESPONSE" | grep -q '"ok":true'; then
    echo "✅ Webhook настроен успешно"
else
    echo "❌ Ошибка настройки webhook"
fi

# 5. Настройка команд бота
echo "5. Настройка команд бота..."
curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/setMyCommands" \
     -H "Content-Type: application/json" \
     -d '{
       "commands": [
         {"command": "start", "description": "🚀 Начать работу с ботом"},
         {"command": "balance", "description": "💰 Показать баланс"},
         {"command": "stats", "description": "📊 Статистика"},
         {"command": "app", "description": "📱 Открыть приложение"},
         {"command": "help", "description": "🆘 Справка по командам"}
       ]
     }' >/dev/null

# 6. Проверка
echo "6. Проверка работы..."
sleep 3

if systemctl is-active --quiet finio; then
    echo "✅ Backend с ботом работает"
else
    echo "❌ Backend не работает"
    journalctl -u finio -n 5 --no-pager
fi

if curl -f -s http://localhost:8000/health >/dev/null 2>&1; then
    echo "✅ API отвечает"
else
    echo "❌ API не отвечает"
fi

echo ""
echo "🤖 НАСТРОЙКА БОТА ЗАВЕРШЕНА!"
echo ""
echo "🔗 Найдите бота в Telegram и отправьте /start"
echo "📱 Приложение: http://$SERVER_IP"
echo "🔧 Webhook: $WEBHOOK_URL"
echo ""
echo "📋 Команды бота:"
echo "   /start - Начать работу"
echo "   /balance - Баланс"
echo "   /stats - Статистика"  
echo "   /app - Открыть приложение"
echo "   /help - Справка"
echo ""
echo "💡 Быстрое добавление:"
echo "   500 кофе - добавить расход"
echo "   +5000 зарплата - добавить доход"