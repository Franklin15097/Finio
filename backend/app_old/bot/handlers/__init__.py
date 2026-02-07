"""
Обработчики Telegram бота
"""
from aiogram import Dispatcher
from app.bot.handlers import commands, messages, callbacks


def setup_handlers(dp: Dispatcher):
    """Настройка всех обработчиков бота"""
    # Регистрируем обработчики команд
    dp.include_router(commands.router)
    
    # Регистрируем обработчики сообщений
    dp.include_router(messages.router)
    
    # Регистрируем обработчики callback'ов
    dp.include_router(callbacks.router)