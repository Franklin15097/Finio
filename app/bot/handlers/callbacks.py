"""
Обработчики callback запросов Telegram бота
"""
from aiogram import Router, F
from aiogram.types import CallbackQuery

router = Router()


@router.callback_query(F.data.startswith("category_"))
async def category_callback(callback: CallbackQuery):
    """Обработчик выбора категории через inline кнопки"""
    category_id = callback.data.split("_")[1]
    
    # Здесь можно добавить логику обработки выбора категории
    # Например, для быстрого добавления транзакции с выбранной категорией
    
    await callback.answer(f"Выбрана категория: {category_id}")


@router.callback_query(F.data == "quick_income")
async def quick_income_callback(callback: CallbackQuery):
    """Быстрое добавление дохода"""
    await callback.message.answer(
        "💰 Введите сумму дохода:"
    )
    await callback.answer()


@router.callback_query(F.data == "quick_expense")
async def quick_expense_callback(callback: CallbackQuery):
    """Быстрое добавление расхода"""
    await callback.message.answer(
        "💸 Введите сумму расхода:"
    )
    await callback.answer()