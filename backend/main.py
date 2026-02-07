"""
Finio API - Система управления финансами с MySQL и Telegram Mini App
"""
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import os
import logging
from datetime import datetime, date
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Enum, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
import enum

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Telegram Bot
from aiogram import Bot, Dispatcher, types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.filters import Command

app = FastAPI(
    title="Finio API",
    version="2.0.0",
    description="Система управления финансами с MySQL и Telegram Mini App"
)

# Обработчик глобальных ошибок
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"❌ Глобальная ошибка: {exc}")
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": "Internal server error", "detail": str(exc)}
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
    amount = Column(Numeric(precision=10, scale=2))
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
TELEGRAM_WEBHOOK_URL = os.getenv("TELEGRAM_WEBHOOK_URL", "http://studiofinance.ru")

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

# API Routes
@app.post("/api/auth/telegram")
async def telegram_auth(auth_data: TelegramAuthRequest, db: AsyncSession = Depends(get_db)):
    """Аутентификация через Telegram"""
    try:
        # Проверяем существующего пользователя
        from sqlalchemy import select
        result = await db.execute(select(User).where(User.telegram_id == auth_data.telegram_id))
        user = result.scalar_one_or_none()
        
        if not user:
            # Создаем нового пользователя
            full_name = f"{auth_data.first_name} {auth_data.last_name or ''}".strip()
            user = User(
                email=f"user_{auth_data.telegram_id}@telegram.local",
                full_name=full_name,
                telegram_id=auth_data.telegram_id
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        
        return {"user_id": user.id, "status": "authenticated"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/init-demo-data")
async def init_demo_data(db: AsyncSession = Depends(get_db)):
    """Инициализация демо данных"""
    try:
        from sqlalchemy import select
        
        # Проверяем есть ли уже демо пользователь
        result = await db.execute(select(User).where(User.email == "demo@finio.local"))
        demo_user = result.scalar_one_or_none()
        
        if not demo_user:
            # Создаем демо пользователя
            demo_user = User(
                email="demo@finio.local",
                full_name="Демо пользователь",
                telegram_id=None
            )
            db.add(demo_user)
            await db.commit()
            await db.refresh(demo_user)
            
            # Создаем демо категории
            categories = [
                Category(user_id=demo_user.id, name="Зарплата", type=TransactionType.INCOME, color="#10B981"),
                Category(user_id=demo_user.id, name="Продукты", type=TransactionType.EXPENSE, color="#EF4444"),
                Category(user_id=demo_user.id, name="Транспорт", type=TransactionType.EXPENSE, color="#F59E0B"),
            ]
            
            for category in categories:
                db.add(category)
            
            await db.commit()
            
            # Создаем демо транзакции
            transactions = [
                Transaction(
                    user_id=demo_user.id,
                    category_id=categories[0].id,
                    type=TransactionType.INCOME,
                    amount=50000.0,
                    title="Зарплата за январь",
                    description="Основная работа"
                ),
                Transaction(
                    user_id=demo_user.id,
                    category_id=categories[1].id,
                    type=TransactionType.EXPENSE,
                    amount=5000.0,
                    title="Продукты на неделю",
                    description="Покупки в супермаркете"
                ),
                Transaction(
                    user_id=demo_user.id,
                    category_id=categories[2].id,
                    type=TransactionType.EXPENSE,
                    amount=2000.0,
                    title="Проезд",
                    description="Транспортная карта"
                ),
            ]
            
            for transaction in transactions:
                db.add(transaction)
            
            await db.commit()
        
        return {"status": "demo_data_initialized", "user_id": demo_user.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/users/{user_id}/stats")
async def get_user_stats(user_id: int, db: AsyncSession = Depends(get_db)):
    """Получение статистики пользователя"""
    try:
        from sqlalchemy import select, func
        
        # Получаем статистику доходов
        income_result = await db.execute(
            select(func.sum(Transaction.amount))
            .where(Transaction.user_id == user_id)
            .where(Transaction.type == TransactionType.INCOME)
        )
        total_income = income_result.scalar() or 0.0
        
        # Получаем статистику расходов
        expense_result = await db.execute(
            select(func.sum(Transaction.amount))
            .where(Transaction.user_id == user_id)
            .where(Transaction.type == TransactionType.EXPENSE)
        )
        total_expense = expense_result.scalar() or 0.0
        
        # Получаем количество транзакций
        count_result = await db.execute(
            select(func.count(Transaction.id))
            .where(Transaction.user_id == user_id)
        )
        transactions_count = count_result.scalar() or 0
        
        return StatsResponse(
            total_income=float(total_income),
            total_expense=float(total_expense),
            balance=float(total_income - total_expense),
            transactions_count=transactions_count
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/users/{user_id}/transactions")
async def get_user_transactions(user_id: int, db: AsyncSession = Depends(get_db)):
    """Получение транзакций пользователя"""
    try:
        from sqlalchemy import select
        
        result = await db.execute(
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(Transaction.transaction_date.desc())
            .limit(50)
        )
        transactions = result.scalars().all()
        
        return [
            {
                "id": t.id,
                "user_id": t.user_id,
                "category_id": t.category_id,
                "type": t.type.value,
                "amount": float(t.amount),
                "title": t.title,
                "description": t.description,
                "date": t.transaction_date.isoformat() if t.transaction_date else None,
                "created_at": t.created_at.isoformat() if t.created_at else None
            }
            for t in transactions
        ]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

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
@app.post("/bot-webhook")
async def bot_webhook(request: Request):
    """Обработка webhook от Telegram"""
    try:
        update_data = await request.json()
        logger.info(f"📨 Получен webhook: {update_data.get('update_id', 'unknown')}")
        
        if not bot or not dp:
            logger.error("❌ Бот не инициализирован")
            return JSONResponse({"status": "error", "message": "Bot not initialized"}, status_code=500)
        
        telegram_update = types.Update(**update_data)
        await dp.feed_update(bot, telegram_update)
        logger.info(f"✅ Обработан update: {update_data.get('update_id', 'unknown')}")
        return {"status": "ok"}
        
    except Exception as e:
        logger.error(f"❌ Ошибка обработки webhook: {e}")
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)

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
        webhook_url = f"{TELEGRAM_WEBHOOK_URL}/bot-webhook"
        try:
            # Удаляем старый webhook
            await bot.delete_webhook(drop_pending_updates=True)
            print("✅ Старый webhook удален")
            
            # Устанавливаем новый webhook
            await bot.set_webhook(
                url=webhook_url,
                drop_pending_updates=True,
                allowed_updates=["message", "callback_query"]
            )
            print(f"✅ Webhook установлен: {webhook_url}")
            
            # Проверяем webhook
            webhook_info = await bot.get_webhook_info()
            print(f"✅ Webhook info: {webhook_info.url}")
            
        except Exception as e:
            print(f"❌ Ошибка установки webhook: {e}")
            # Пробуем установить без SSL проверки для разработки
            try:
                await bot.set_webhook(
                    url=webhook_url,
                    drop_pending_updates=True,
                    allowed_updates=["message", "callback_query"]
                )
                print(f"✅ Webhook установлен (без SSL): {webhook_url}")
            except Exception as e2:
                print(f"❌ Критическая ошибка webhook: {e2}")

@app.on_event("shutdown") 
async def shutdown_event():
    """Событие остановки приложения"""
    if bot:
        await bot.session.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)