"""
Finio API - Система управления финансами с MySQL и Telegram Mini App
"""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import List, Optional
import os
from datetime import datetime, date
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
import enum

# Telegram Bot
from aiogram import Bot, Dispatcher, types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.filters import Command

app = FastAPI(
    title="Finio API",
    version="2.0.0",
    description="Система управления финансами с MySQL и Telegram Mini App"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+aiomysql://finio_user:maks15097@localhost:3306/finio")
engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

# Database Models
class TransactionType(enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    full_name = Column(String(255))
    telegram_id = Column(String(50), unique=True, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    name = Column(String(255))
    type = Column(Enum(TransactionType))
    color = Column(String(7), default="#3B82F6")
    created_at = Column(DateTime, default=datetime.utcnow)

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    category_id = Column(Integer, nullable=True)
    type = Column(Enum(TransactionType))
    amount = Column(Float)
    title = Column(String(255))
    description = Column(Text, nullable=True)
    transaction_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic Models
class UserCreate(BaseModel):
    email: str
    full_name: str
    telegram_id: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    telegram_id: Optional[str] = None
    created_at: datetime

class TransactionCreate(BaseModel):
    category_id: Optional[int] = None
    type: str
    amount: float
    title: str
    description: Optional[str] = None
    transaction_date: Optional[date] = None

class TransactionResponse(BaseModel):
    id: int
    user_id: int
    category_id: Optional[int] = None
    type: str
    amount: float
    title: str
    description: Optional[str] = None
    transaction_date: datetime
    created_at: datetime

class StatsResponse(BaseModel):
    total_income: float
    total_expense: float
    balance: float
    transactions_count: int

class TelegramAuthRequest(BaseModel):
    telegram_id: str
    first_name: str
    last_name: Optional[str] = None
    username: Optional[str] = None
    init_data: str = ""

# Database dependency
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Telegram Bot настройки
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_WEBHOOK_URL = os.getenv("TELEGRAM_WEBHOOK_URL", "https://studiofinance.ru")

print(f"🔧 Инициализация бота...")
print(f"Token: {'✅ Есть' if TELEGRAM_BOT_TOKEN else '❌ Нет'}")
print(f"Webhook URL: {TELEGRAM_WEBHOOK_URL}")

# Инициализация бота
bot = None
dp = None

try:
    if TELEGRAM_BOT_TOKEN:
        bot = Bot(token=TELEGRAM_BOT_TOKEN)
        dp = Dispatcher()
        print("✅ Бот инициализирован")
    else:
        print("❌ Токен бота не установлен")
except Exception as e:
    print(f"❌ Ошибка инициализации бота: {e}")
    bot = None
    dp = None

# Telegram Bot обработчики
try:
    if bot and dp:
        @dp.message(Command("start"))
        async def start_command(message: types.Message):
            """Обработчик команды /start"""
            print(f"✅ Получена команда /start от пользователя {message.from_user.id}")
            
            keyboard = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(
                    text="💰 Открыть приложение",
                    url="https://t.me/FinanceStudio_bot/Finio"
                )]
            ])
            
            await message.answer(
                "Добро пожаловать! 💰",
                reply_markup=keyboard
            )
            print(f"✅ Отправлен ответ пользователю {message.from_user.id}")

        @dp.message()
        async def any_message(message: types.Message):
            """Обработчик любых сообщений"""
            print(f"✅ Получено сообщение от пользователя {message.from_user.id}")
            
            keyboard = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(
                    text="💰 Открыть приложение",
                    url="https://t.me/FinanceStudio_bot/Finio"
                )]
            ])
            
            await message.answer(
                "💰 Открыть приложение",
                reply_markup=keyboard
            )
            print(f"✅ Отправлен ответ пользователю {message.from_user.id}")
            
        print("✅ Обработчики бота зарегистрированы")
    else:
        print("❌ Бот не инициализирован - обработчики не зарегистрированы")
        
except Exception as e:
    print(f"❌ Ошибка регистрации обработчиков: {e}")

# API эндпоинты
@app.get("/")
async def root():
    return {"message": "Finio API работает!", "status": "ok", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/bot-status")
async def bot_status():
    """Проверка статуса бота"""
    return {
        "bot_initialized": bot is not None,
        "dispatcher_initialized": dp is not None,
        "token_set": bool(TELEGRAM_BOT_TOKEN),
        "webhook_url": TELEGRAM_WEBHOOK_URL
    }

# Mini App endpoint - отдельная страница для Telegram Mini App
@app.get("/miniapp")
async def miniapp():
    """Страница Mini App для Telegram"""
    html_content = """
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#2481cc" />
        <title>Finio</title>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                background-color: var(--tg-theme-bg-color, #f8fafc);
                color: var(--tg-theme-text-color, #1e293b);
                padding: 16px;
                min-height: 100vh;
            }
            .container { max-width: 100%; }
            .header {
                background: var(--tg-theme-secondary-bg-color, white);
                padding: 20px;
                border-radius: 12px;
                margin-bottom: 20px;
                text-align: center;
            }
            .stats {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
                margin-bottom: 20px;
            }
            .stat-card {
                background: var(--tg-theme-secondary-bg-color, white);
                padding: 16px;
                border-radius: 12px;
                text-align: center;
            }
            .stat-card h3 {
                font-size: 0.8rem;
                color: var(--tg-theme-hint-color, #64748b);
                margin-bottom: 8px;
            }
            .stat-card .value {
                font-size: 1.2rem;
                font-weight: bold;
                color: var(--tg-theme-text-color, #1e293b);
            }
            .loading {
                text-align: center;
                padding: 40px;
                color: var(--tg-theme-hint-color, #64748b);
            }
            .transactions {
                background: var(--tg-theme-secondary-bg-color, white);
                border-radius: 12px;
                overflow: hidden;
            }
            .transactions-header {
                padding: 16px;
                border-bottom: 1px solid var(--tg-theme-section-separator-color, #e2e8f0);
                font-weight: bold;
            }
            .transaction-item {
                padding: 12px 16px;
                border-bottom: 1px solid var(--tg-theme-section-separator-color, #f1f5f9);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .transaction-info h4 {
                font-size: 0.9rem;
                margin-bottom: 4px;
            }
            .transaction-info p {
                font-size: 0.75rem;
                color: var(--tg-theme-hint-color, #64748b);
            }
            .transaction-amount {
                font-weight: bold;
            }
            .income { color: #10b981; }
            .expense { color: #ef4444; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>💰 Finio</h1>
                <p id="user-info">Загрузка...</p>
            </div>
            
            <div class="stats" id="stats">
                <div class="stat-card">
                    <h3>💰 Доходы</h3>
                    <div class="value income" id="income">0 ₽</div>
                </div>
                <div class="stat-card">
                    <h3>💸 Расходы</h3>
                    <div class="value expense" id="expenses">0 ₽</div>
                </div>
                <div class="stat-card">
                    <h3>💳 Баланс</h3>
                    <div class="value" id="balance">0 ₽</div>
                </div>
                <div class="stat-card">
                    <h3>📊 Операций</h3>
                    <div class="value" id="count">0</div>
                </div>
            </div>
            
            <div class="transactions">
                <div class="transactions-header">📈 Последние операции</div>
                <div id="transactions-list">
                    <div class="loading">Загрузка операций...</div>
                </div>
            </div>
        </div>
        
        <script>
            // Инициализация Telegram WebApp
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();
            tg.setHeaderColor('#2481cc');
            
            // Получение данных пользователя
            const user = tg.initDataUnsafe.user;
            if (user) {
                document.getElementById('user-info').textContent = `Привет, ${user.first_name}! 👋`;
            }
            
            // Настройка главной кнопки
            tg.MainButton.setText('Обновить данные');
            tg.MainButton.show();
            tg.MainButton.onClick(loadData);
            
            // Загрузка данных
            async function loadData() {
                try {
                    let userId = 1; // Fallback
                    
                    // Аутентификация через Telegram
                    if (user) {
                        const authResponse = await fetch('/api/auth/telegram', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                telegram_id: user.id.toString(),
                                first_name: user.first_name,
                                last_name: user.last_name || '',
                                username: user.username || '',
                                init_data: tg.initData || ''
                            })
                        });
                        const authData = await authResponse.json();
                        userId = authData.user_id;
                    } else {
                        // Инициализация демо данных
                        await fetch('/api/init-demo-data', { method: 'POST' });
                    }
                    
                    // Загрузка статистики
                    const statsResponse = await fetch(`/api/users/${userId}/stats`);
                    const stats = await statsResponse.json();
                    
                    document.getElementById('income').textContent = `${stats.total_income.toLocaleString()} ₽`;
                    document.getElementById('expenses').textContent = `${stats.total_expense.toLocaleString()} ₽`;
                    document.getElementById('balance').textContent = `${stats.balance.toLocaleString()} ₽`;
                    document.getElementById('count').textContent = stats.transactions_count;
                    
                    // Загрузка транзакций
                    const transactionsResponse = await fetch(`/api/users/${userId}/transactions`);
                    const transactions = await transactionsResponse.json();
                    
                    const transactionsList = document.getElementById('transactions-list');
                    if (transactions.length === 0) {
                        transactionsList.innerHTML = '<div class="loading">Нет операций</div>';
                    } else {
                        transactionsList.innerHTML = transactions.slice(0, 10).map(t => `
                            <div class="transaction-item">
                                <div class="transaction-info">
                                    <h4>${t.title}</h4>
                                    <p>${new Date(t.date).toLocaleDateString('ru-RU')}</p>
                                </div>
                                <div class="transaction-amount ${t.type}">
                                    ${t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()} ₽
                                </div>
                            </div>
                        `).join('');
                    }
                    
                    // Обновление кнопки
                    tg.MainButton.setText('✅ Обновлено');
                    setTimeout(() => {
                        tg.MainButton.setText('Обновить данные');
                    }, 2000);
                    
                } catch (error) {
                    console.error('Ошибка:', error);
                    tg.showAlert('Ошибка загрузки данных');
                }
            }
            
            // Загрузка при открытии
            loadData();
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

# Пользователи
@app.get("/api/users", response_model=List[User])
async def get_users():
    users = load_json(USERS_FILE)
    return users

@app.post("/api/users", response_model=User)
async def create_user(email: str, name: str):
    users = load_json(USERS_FILE)
    
    # Проверяем, что email уникален
    if any(u['email'] == email for u in users):
        raise HTTPException(status_code=400, detail="Email уже используется")
    
    user = {
        "id": get_next_id(users),
        "email": email,
        "name": name,
        "created_at": datetime.now().isoformat()
    }
    
    users.append(user)
    save_json(USERS_FILE, users)
    return user

# Категории
@app.get("/api/users/{user_id}/categories", response_model=List[Category])
async def get_categories(user_id: int):
    categories = load_json(CATEGORIES_FILE)
    user_categories = [c for c in categories if c['user_id'] == user_id]
    return user_categories

@app.post("/api/users/{user_id}/categories", response_model=Category)
async def create_category(user_id: int, category: CategoryCreate):
    categories = load_json(CATEGORIES_FILE)
    
    new_category = {
        "id": get_next_id(categories),
        "user_id": user_id,
        "name": category.name,
        "type": category.type,
        "color": category.color
    }
    
    categories.append(new_category)
    save_json(CATEGORIES_FILE, categories)
    return new_category

# Транзакции
@app.get("/api/users/{user_id}/transactions", response_model=List[Transaction])
async def get_transactions(user_id: int):
    transactions = load_json(TRANSACTIONS_FILE)
    user_transactions = [t for t in transactions if t['user_id'] == user_id]
    # Сортируем по дате (новые сначала)
    user_transactions.sort(key=lambda x: x['created_at'], reverse=True)
    return user_transactions

@app.post("/api/users/{user_id}/transactions", response_model=Transaction)
async def create_transaction(user_id: int, transaction: TransactionCreate):
    transactions = load_json(TRANSACTIONS_FILE)
    
    new_transaction = {
        "id": get_next_id(transactions),
        "user_id": user_id,
        "category_id": transaction.category_id,
        "type": transaction.type,
        "amount": transaction.amount,
        "title": transaction.title,
        "description": transaction.description,
        "date": transaction.date,
        "created_at": datetime.now().isoformat()
    }
    
    transactions.append(new_transaction)
    save_json(TRANSACTIONS_FILE, transactions)
    return new_transaction

@app.delete("/api/transactions/{transaction_id}")
async def delete_transaction(transaction_id: int):
    transactions = load_json(TRANSACTIONS_FILE)
    transactions = [t for t in transactions if t['id'] != transaction_id]
    save_json(TRANSACTIONS_FILE, transactions)
    return {"message": "Транзакция удалена"}

# Статистика
@app.get("/api/users/{user_id}/stats")
async def get_stats(user_id: int):
    transactions = load_json(TRANSACTIONS_FILE)
    user_transactions = [t for t in transactions if t['user_id'] == user_id]
    
    total_income = sum(t['amount'] for t in user_transactions if t['type'] == 'income')
    total_expense = sum(t['amount'] for t in user_transactions if t['type'] == 'expense')
    balance = total_income - total_expense
    
    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": balance,
        "transactions_count": len(user_transactions)
    }

# Telegram webhook - ВСЕГДА регистрируем endpoint
@app.post("/bot-webhook/")
async def bot_webhook(update: dict):
    """Обработка webhook от Telegram"""
    print(f"📨 Получен webhook: {update}")
    
    if not bot or not dp:
        print("❌ Бот не инициализирован")
        return {"status": "error", "message": "Bot not initialized"}
    
    try:
        telegram_update = types.Update(**update)
        await dp.feed_update(bot, telegram_update)
        print(f"✅ Обработан update: {update.get('update_id', 'unknown')}")
        return {"status": "ok"}
    except Exception as e:
        print(f"❌ Ошибка обработки webhook: {e}")
        print(f"Update: {update}")
        return {"status": "error", "message": str(e)}

# Telegram аутентификация
@app.post("/api/auth/telegram")
async def authenticate_telegram_user(auth_data: TelegramAuthRequest):
    """Аутентификация пользователя через Telegram"""
    users = load_json(USERS_FILE)
    
    # Ищем пользователя по Telegram ID
    user = next((u for u in users if u.get('telegram_id') == auth_data.telegram_id), None)
    
    if user:
        return {"user_id": user['id'], "message": "Пользователь найден"}
    
    # Создаем нового пользователя
    full_name = auth_data.first_name
    if auth_data.last_name:
        full_name += f" {auth_data.last_name}"
    
    new_user = {
        "id": get_next_id(users),
        "email": f"telegram_{auth_data.telegram_id}@telegram.local",
        "name": full_name,
        "telegram_id": auth_data.telegram_id,
        "created_at": datetime.now().isoformat()
    }
    
    users.append(new_user)
    save_json(USERS_FILE, users)
    
    return {"user_id": new_user['id'], "message": "Новый пользователь создан"}

# Создание тестовых данных
@app.post("/api/init-demo-data")
async def init_demo_data():
    # Создаем тестового пользователя
    users = load_json(USERS_FILE)
    if not users:
        demo_user = {
            "id": 1,
            "email": "demo@finio.ru",
            "name": "Демо пользователь",
            "created_at": datetime.now().isoformat()
        }
        users.append(demo_user)
        save_json(USERS_FILE, users)
    
    # Создаем категории
    categories = load_json(CATEGORIES_FILE)
    if not categories:
        demo_categories = [
            {"id": 1, "user_id": 1, "name": "Зарплата", "type": "income", "color": "#10B981"},
            {"id": 2, "user_id": 1, "name": "Продукты", "type": "expense", "color": "#EF4444"},
            {"id": 3, "user_id": 1, "name": "Транспорт", "type": "expense", "color": "#F59E0B"},
            {"id": 4, "user_id": 1, "name": "Развлечения", "type": "expense", "color": "#8B5CF6"},
        ]
        save_json(CATEGORIES_FILE, demo_categories)
    
    # Создаем транзакции
    transactions = load_json(TRANSACTIONS_FILE)
    if not transactions:
        demo_transactions = [
            {
                "id": 1, "user_id": 1, "category_id": 1, "type": "income",
                "amount": 50000, "title": "Зарплата за январь", "description": "",
                "date": "2024-01-31", "created_at": datetime.now().isoformat()
            },
            {
                "id": 2, "user_id": 1, "category_id": 2, "type": "expense",
                "amount": 3500, "title": "Продукты в Пятерочке", "description": "",
                "date": "2024-02-01", "created_at": datetime.now().isoformat()
            },
            {
                "id": 3, "user_id": 1, "category_id": 3, "type": "expense",
                "amount": 500, "title": "Метро", "description": "",
                "date": "2024-02-02", "created_at": datetime.now().isoformat()
            }
        ]
        save_json(TRANSACTIONS_FILE, demo_transactions)
    
    return {"message": "Демо данные созданы"}

# Настройка webhook при запуске
async def setup_webhook():
    """Настройка webhook для Telegram бота"""
    if bot and TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_URL:
        webhook_url = f"{TELEGRAM_WEBHOOK_URL}/bot-webhook/"
        try:
            # Удаляем все команды бота
            await bot.delete_my_commands()
            print("✅ Все команды бота удалены")
            
            # Устанавливаем webhook
            await bot.set_webhook(
                url=webhook_url,
                drop_pending_updates=True
            )
            print(f"✅ Webhook установлен: {webhook_url}")
        except Exception as e:
            print(f"❌ Ошибка установки webhook: {e}")

@app.on_event("startup")
async def startup_event():
    """Событие запуска приложения"""
    print("🚀 Запуск приложения...")
    print(f"TELEGRAM_BOT_TOKEN: {'✅ Установлен' if TELEGRAM_BOT_TOKEN else '❌ Не установлен'}")
    print(f"TELEGRAM_WEBHOOK_URL: {TELEGRAM_WEBHOOK_URL}")
    
    if TELEGRAM_BOT_TOKEN:
        print("🤖 Настройка webhook...")
        await setup_webhook()
    else:
        print("❌ Бот не будет работать - токен не установлен")

@app.on_event("shutdown") 
async def shutdown_event():
    """Событие остановки приложения"""
    if bot:
        await bot.session.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)