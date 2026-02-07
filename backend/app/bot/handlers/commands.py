"""
Обработчики команд Telegram бота
"""
from aiogram import Router, F
from aiogram.types import Message
from aiogram.filters import Command, CommandStart
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.services.user_service import UserService
from app.services.transaction_service import TransactionService
from app.bot.keyboards import get_main_keyboard, get_auth_keyboard

router = Router()


@router.message(CommandStart())
async def start_command(message: Message):
    """Обработчик команды /start"""
    await message.answer(
        "Добро пожаловать в Crypto Bot! 💰\n\n"
        "Управляйте своими финансами прямо в Telegram.\n"
        "Нажмите кнопку ниже, чтобы открыть приложение:",
        reply_markup=get_main_keyboard()
    )


@router.message(Command("help"))
async def help_command(message: Message):
    """Обработчик команды /help"""
    help_text = """
🤖 <b>Crypto Bot - Управление финансами</b>

💰 Отслеживайте доходы и расходы
📊 Просматривайте статистику
📈 Анализируйте финансы

Нажмите кнопку ниже, чтобы открыть приложение:
    """
    
    await message.answer(help_text, parse_mode="HTML", reply_markup=get_main_keyboard())


@router.message(Command("balance"))
async def balance_command(message: Message):
    """Обработчик команды /balance"""
    async with AsyncSessionLocal() as db:
        user_service = UserService(db)
        user = await user_service.get_user_by_telegram_id(str(message.from_user.id))
        
        if not user:
            await message.answer(
                "❌ Аккаунт не привязан. Используйте /start для начала работы."
            )
            return
        
        transaction_service = TransactionService(db)
        stats = await transaction_service.get_user_stats(user.id)
        
        balance_text = f"""
💰 <b>Ваш баланс:</b>

📈 Доходы: +{stats.total_income:,.2f} ₽
📉 Расходы: -{stats.total_expense:,.2f} ₽
💳 Баланс: {stats.balance:,.2f} ₽

📊 Всего операций: {stats.transactions_count}
        """
        
        await message.answer(balance_text, parse_mode="HTML")


@router.message(Command("stats"))
async def stats_command(message: Message):
    """Обработчик команды /stats"""
    async with AsyncSessionLocal() as db:
        user_service = UserService(db)
        user = await user_service.get_user_by_telegram_id(str(message.from_user.id))
        
        if not user:
            await message.answer(
                "❌ Аккаунт не привязан. Используйте /start для начала работы."
            )
            return
        
        transaction_service = TransactionService(db)
        
        # Статистика за текущий месяц
        from datetime import date, datetime
        today = date.today()
        month_start = date(today.year, today.month, 1)
        
        month_stats = await transaction_service.get_user_stats(
            user.id, 
            date_from=month_start, 
            date_to=today
        )
        
        # Общая статистика
        total_stats = await transaction_service.get_user_stats(user.id)
        
        stats_text = f"""
📊 <b>Статистика</b>

<b>За текущий месяц:</b>
📈 Доходы: +{month_stats.total_income:,.2f} ₽
📉 Расходы: -{month_stats.total_expense:,.2f} ₽
💳 Баланс: {month_stats.balance:,.2f} ₽
📋 Операций: {month_stats.transactions_count}

<b>За все время:</b>
📈 Доходы: +{total_stats.total_income:,.2f} ₽
📉 Расходы: -{total_stats.total_expense:,.2f} ₽
💳 Баланс: {total_stats.balance:,.2f} ₽
📋 Операций: {total_stats.transactions_count}
        """
        
        await message.answer(stats_text, parse_mode="HTML")


@router.message(Command("link"))
async def link_command(message: Message):
    """Обработчик команды /link"""
    link_text = f"""
🔗 <b>Привязка аккаунта</b>

Для привязки вашего Telegram аккаунта:

1. Войдите в веб-версию Finio
2. Перейдите в настройки профиля
3. Введите ваш Telegram ID: <code>{message.from_user.id}</code>
4. Нажмите "Привязать аккаунт"

После привязки вы сможете управлять финансами через бота! 🚀
    """
    
    await message.answer(link_text, parse_mode="HTML")