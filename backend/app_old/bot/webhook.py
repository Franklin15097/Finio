"""
Webhook обработчик для Telegram бота
"""
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from aiogram import Bot, Dispatcher
from aiogram.types import Update
from aiogram.webhook.aiohttp_server import SimpleRequestHandler

from app.core.config import settings
from app.core.database import get_db
from app.bot.handlers import setup_handlers

# Создаем бота и диспетчер
bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
dp = Dispatcher()

# Настраиваем обработчики
setup_handlers(dp)

router = APIRouter()


@router.post("/")
async def bot_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Обработчик webhook от Telegram"""
    if not settings.TELEGRAM_BOT_TOKEN:
        raise HTTPException(status_code=400, detail="Bot token not configured")
    
    try:
        # Получаем данные от Telegram
        data = await request.json()
        update = Update(**data)
        
        # Передаем сессию БД в контекст
        update.bot = bot
        
        # Обрабатываем обновление
        await dp.feed_update(bot, update)
        
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


async def set_webhook():
    """Установка webhook для бота"""
    if settings.TELEGRAM_BOT_TOKEN and settings.TELEGRAM_WEBHOOK_URL:
        await bot.set_webhook(
            url=f"{settings.TELEGRAM_WEBHOOK_URL}/bot-webhook/",
            drop_pending_updates=True
        )