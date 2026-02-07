"""
Finio API - Система управления финансами
"""
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import os
import logging
from datetime import datetime, date
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Enum, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
import enum
import asyncio

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Telegram Bot
from aiogram import Bot, Dispatcher, types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.filters import Command

app = FastAPI(title="Finio API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+aiomysql://finio_user:maks15097@mysql:3306/finio")
engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

# Models
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
class TelegramAuthRequest(BaseModel):
    telegram_id: str
    first_name: str
    last_name: Optional[str] = None
    username: Optional[str] = None

class StatsResponse(BaseModel):
    total_income: float
    total_expense: float
    balance: float
    transactions_count: int

# Database dependency
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Telegram Bot
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_WEBHOOK_URL = os.getenv("TELEGRAM_WEBHOOK_URL", "https://studiofinance.ru")

bot = None
dp = None

if TELEGRAM_BOT_TOKEN:
    try:
        bot = Bot(token=TELEGRAM_BOT_TOKEN)
        dp = Dispatcher()
        
        @dp.message(Command("start"))
        async def start_command(message: types.Message):
            keyboard = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(
                    text="💰 Открыть приложение",
                    url="https://t.me/FinanceStudio_bot/Finio"
                )]
            ])
            
            await message.answer(
                "💰 Добро пожаловать в Finio!\n\nУправляйте своими финансами легко и удобно.",
                reply_markup=keyboard
            )

        @dp.message()
        async def any_message(message: types.Message):
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
            
        logger.info("✅ Telegram bot initialized")
    except Exception as e:
        logger.error(f"❌ Bot initialization error: {e}")

# API Routes
@app.get("/")
async def root():
    return {"message": "Finio API работает!", "status": "ok"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/auth/telegram")
async def telegram_auth(auth_data: TelegramAuthRequest, db: AsyncSession = Depends(get_db)):
    try:
        from sqlalchemy import select
        result = await db.execute(select(User).where(User.telegram_id == auth_data.telegram_id))
        user = result.scalar_one_or_none()
        
        if not user:
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
    try:
        from sqlalchemy import select
        
        result = await db.execute(select(User).where(User.email == "demo@finio.local"))
        demo_user = result.scalar_one_or_none()
        
        if not demo_user:
            demo_user = User(
                email="demo@finio.local",
                full_name="Демо пользователь",
                telegram_id=None
            )
            db.add(demo_user)
            await db.commit()
            await db.refresh(demo_user)
            
            # Создаем категории
            categories = [
                Category(user_id=demo_user.id, name="Зарплата", type=TransactionType.INCOME, color="#10B981"),
                Category(user_id=demo_user.id, name="Продукты", type=TransactionType.EXPENSE, color="#EF4444"),
                Category(user_id=demo_user.id, name="Транспорт", type=TransactionType.EXPENSE, color="#F59E0B"),
            ]
            
            for category in categories:
                db.add(category)
            
            await db.commit()
            
            # Создаем транзакции
            transactions = [
                Transaction(
                    user_id=demo_user.id,
                    category_id=categories[0].id,
                    type=TransactionType.INCOME,
                    amount=50000.0,
                    title="Зарплата за январь"
                ),
                Transaction(
                    user_id=demo_user.id,
                    category_id=categories[1].id,
                    type=TransactionType.EXPENSE,
                    amount=5000.0,
                    title="Продукты на неделю"
                ),
                Transaction(
                    user_id=demo_user.id,
                    category_id=categories[2].id,
                    type=TransactionType.EXPENSE,
                    amount=2000.0,
                    title="Проезд"
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
    try:
        from sqlalchemy import select, func
        
        income_result = await db.execute(
            select(func.sum(Transaction.amount))
            .where(Transaction.user_id == user_id)
            .where(Transaction.type == TransactionType.INCOME)
        )
        total_income = income_result.scalar() or 0.0
        
        expense_result = await db.execute(
            select(func.sum(Transaction.amount))
            .where(Transaction.user_id == user_id)
            .where(Transaction.type == TransactionType.EXPENSE)
        )
        total_expense = expense_result.scalar() or 0.0
        
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

@app.get("/miniapp")
async def miniapp():
    html_content = """
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
        <title>Finio</title>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                background: var(--tg-theme-bg-color, #f8fafc);
                color: var(--tg-theme-text-color, #1e293b);
                padding: 16px;
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
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-bottom: 20px;
            }
            .stat-card {
                background: var(--tg-theme-secondary-bg-color, white);
                padding: 16px;
                border-radius: 12px;
                text-align: center;
            }
            .stat-card h3 { font-size: 14px; margin-bottom: 8px; }
            .value { font-size: 18px; font-weight: bold; }
            .income { color: #10B981; }
            .expense { color: #EF4444; }
            .loading { text-align: center; padding: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>💰 Finio</h1>
                <p id="user-info">Загрузка...</p>
            </div>
            
            <div id="stats" class="stats" style="display: none;">
                <div class="stat-card">
                    <h3>💰 Доходы</h3>
                    <div id="income" class="value income">0 ₽</div>
                </div>
                <div class="stat-card">
                    <h3>💸 Расходы</h3>
                    <div id="expense" class="value expense">0 ₽</div>
                </div>
                <div class="stat-card">
                    <h3>💳 Баланс</h3>
                    <div id="balance" class="value">0 ₽</div>
                </div>
                <div class="stat-card">
                    <h3>📊 Операций</h3>
                    <div id="count" class="value">0</div>
                </div>
            </div>
            
            <div id="loading" class="loading">Загрузка данных...</div>
        </div>
        
        <script>
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();
            
            const user = tg.initDataUnsafe.user;
            if (user) {
                document.getElementById('user-info').textContent = `Привет, ${user.first_name}! 👋`;
            }
            
            async function loadData() {
                try {
                    let userId = 1;
                    
                    if (user) {
                        const authResponse = await fetch('/api/auth/telegram', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                telegram_id: user.id.toString(),
                                first_name: user.first_name,
                                last_name: user.last_name,
                                username: user.username
                            })
                        });
                        const authData = await authResponse.json();
                        userId = authData.user_id;
                    } else {
                        await fetch('/api/init-demo-data', { method: 'POST' });
                    }
                    
                    const statsResponse = await fetch(`/api/users/${userId}/stats`);
                    const stats = await statsResponse.json();
                    
                    document.getElementById('income').textContent = `${stats.total_income.toLocaleString('ru-RU')} ₽`;
                    document.getElementById('expense').textContent = `${stats.total_expense.toLocaleString('ru-RU')} ₽`;
                    document.getElementById('balance').textContent = `${stats.balance.toLocaleString('ru-RU')} ₽`;
                    document.getElementById('count').textContent = stats.transactions_count;
                    
                    const balanceEl = document.getElementById('balance');
                    balanceEl.className = `value ${stats.balance >= 0 ? 'income' : 'expense'}`;
                    
                    document.getElementById('loading').style.display = 'none';
                    document.getElementById('stats').style.display = 'grid';
                    
                } catch (error) {
                    document.getElementById('loading').textContent = 'Ошибка загрузки: ' + error.message;
                }
            }
            
            loadData();
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@app.post("/bot-webhook")
async def bot_webhook(request: Request):
    try:
        if not bot or not dp:
            return JSONResponse({"status": "error", "message": "Bot not initialized"}, status_code=500)
        
        update_data = await request.json()
        telegram_update = types.Update(**update_data)
        await dp.feed_update(bot, telegram_update)
        return {"status": "ok"}
        
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)

@app.on_event("startup")
async def startup_event():
    # Создание таблиц
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Настройка webhook
    if bot and TELEGRAM_BOT_TOKEN:
        try:
            webhook_url = f"{TELEGRAM_WEBHOOK_URL}/bot-webhook"
            await bot.delete_webhook(drop_pending_updates=True)
            await bot.set_webhook(url=webhook_url)
            logger.info(f"Webhook set: {webhook_url}")
        except Exception as e:
            logger.error(f"Webhook setup error: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    if bot:
        await bot.session.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)