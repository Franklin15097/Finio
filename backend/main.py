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
    return {"message": "Finio API v2.0 работает!", "status": "ok", "version": "2.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.get("/bot-status")
async def bot_status():
    """Проверка статуса бота"""
    return {
        "bot_initialized": bot is not None,
        "dispatcher_initialized": dp is not None,
        "token_set": bool(TELEGRAM_BOT_TOKEN),
        "webhook_url": TELEGRAM_WEBHOOK_URL
    }

# Mini App endpoint
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
            .message {
                background: var(--tg-theme-secondary-bg-color, white);
                padding: 20px;
                border-radius: 12px;
                text-align: center;
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>💰 Finio</h1>
                <p id="user-info">Загрузка...</p>
            </div>
            
            <div class="message">
                <h2>🚧 В разработке</h2>
                <p>Mini App скоро будет готов!</p>
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
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

# Telegram webhook
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
        return {"status": "error", "message": str(e)}

# Создание таблиц при запуске
@app.on_event("startup")
async def startup_event():
    """Событие запуска приложения"""
    print("🚀 Запуск приложения...")
    print(f"TELEGRAM_BOT_TOKEN: {'✅ Установлен' if TELEGRAM_BOT_TOKEN else '❌ Не установлен'}")
    print(f"TELEGRAM_WEBHOOK_URL: {TELEGRAM_WEBHOOK_URL}")
    
    # Создание таблиц
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✅ Таблицы базы данных созданы")
    except Exception as e:
        print(f"❌ Ошибка создания таблиц: {e}")
    
    # Настройка webhook
    if TELEGRAM_BOT_TOKEN:
        await setup_webhook()

# Настройка webhook
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

@app.on_event("shutdown") 
async def shutdown_event():
    """Событие остановки приложения"""
    if bot:
        await bot.session.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)