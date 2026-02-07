"""
Обработчики сообщений Telegram бота
"""
import re
from decimal import Decimal, InvalidOperation
from datetime import date
from aiogram import Router, F
from aiogram.types import Message
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

from app.core.database import AsyncSessionLocal
from app.services.user_service import UserService
from app.services.transaction_service import TransactionService
from app.services.category_service import CategoryService
from app.schemas.transaction import TransactionCreate
from app.models.category import TransactionType
from app.bot.keyboards import get_main_keyboard, get_categories_keyboard

router = Router()


class AddTransactionStates(StatesGroup):
    waiting_for_amount = State()
    waiting_for_description = State()
    waiting_for_category = State()


@router.message(F.text.regexp(r'^\d+([.,]\d{1,2})?$'))
async def quick_expense(message: Message):
    """Быстрое добавление расхода по числу"""
    async with AsyncSessionLocal() as db:
        user_service = UserService(db)
        user = await user_service.get_user_by_telegram_id(str(message.from_user.id))
        
        if not user:
            await message.answer(
                "❌ Аккаунт не привязан. Используйте /start для начала работы."
            )
            return
        
        try:
            # Парсим сумму
            amount_str = message.text.replace(',', '.')
            amount = Decimal(amount_str)
            
            if amount <= 0:
                await message.answer("❌ Сумма должна быть больше нуля.")
                return
            
            # Создаем транзакцию расхода без категории
            transaction_service = TransactionService(db)
            transaction_data = TransactionCreate(
                type=TransactionType.EXPENSE,
                amount=amount,
                title=f"Расход {amount} ₽",
                transaction_date=date.today()
            )
            
            transaction = await transaction_service.create_transaction(
                user.id, 
                transaction_data
            )
            
            await message.answer(
                f"✅ Расход добавлен!\n\n"
                f"💸 Сумма: -{amount} ₽\n"
                f"📅 Дата: {date.today().strftime('%d.%m.%Y')}\n\n"
                f"Для добавления описания и категории используйте веб-версию.",
                reply_markup=get_main_keyboard()
            )
            
        except (InvalidOperation, ValueError):
            await message.answer("❌ Неверный формат суммы. Используйте числа (например: 500 или 123.45)")


@router.message(F.text == "💰 Добавить доход")
async def add_income_button(message: Message, state: FSMContext):
    """Обработчик кнопки добавления дохода"""
    async with AsyncSessionLocal() as db:
        user_service = UserService(db)
        user = await user_service.get_user_by_telegram_id(str(message.from_user.id))
        
        if not user:
            await message.answer("❌ Аккаунт не привязан. Используйте /start для начала работы.")
            return
        
        await state.set_state(AddTransactionStates.waiting_for_amount)
        await state.update_data(transaction_type=TransactionType.INCOME)
        
        await message.answer(
            "💰 <b>Добавление дохода</b>\n\n"
            "Введите сумму дохода (например: 5000 или 1234.56):",
            parse_mode="HTML"
        )


@router.message(F.text == "💸 Добавить расход")
async def add_expense_button(message: Message, state: FSMContext):
    """Обработчик кнопки добавления расхода"""
    async with AsyncSessionLocal() as db:
        user_service = UserService(db)
        user = await user_service.get_user_by_telegram_id(str(message.from_user.id))
        
        if not user:
            await message.answer("❌ Аккаунт не привязан. Используйте /start для начала работы.")
            return
        
        await state.set_state(AddTransactionStates.waiting_for_amount)
        await state.update_data(transaction_type=TransactionType.EXPENSE)
        
        await message.answer(
            "💸 <b>Добавление расхода</b>\n\n"
            "Введите сумму расхода (например: 500 или 123.45):",
            parse_mode="HTML"
        )


@router.message(AddTransactionStates.waiting_for_amount)
async def process_amount(message: Message, state: FSMContext):
    """Обработка ввода суммы"""
    try:
        amount_str = message.text.replace(',', '.')
        amount = Decimal(amount_str)
        
        if amount <= 0:
            await message.answer("❌ Сумма должна быть больше нуля. Попробуйте еще раз:")
            return
        
        await state.update_data(amount=amount)
        await state.set_state(AddTransactionStates.waiting_for_description)
        
        data = await state.get_data()
        transaction_type = data['transaction_type']
        type_emoji = "💰" if transaction_type == TransactionType.INCOME else "💸"
        type_name = "дохода" if transaction_type == TransactionType.INCOME else "расхода"
        
        await message.answer(
            f"{type_emoji} <b>Сумма {type_name}: {amount} ₽</b>\n\n"
            f"Теперь введите описание (или отправьте /skip для пропуска):",
            parse_mode="HTML"
        )
        
    except (InvalidOperation, ValueError):
        await message.answer("❌ Неверный формат суммы. Используйте числа (например: 500 или 123.45):")


@router.message(AddTransactionStates.waiting_for_description)
async def process_description(message: Message, state: FSMContext):
    """Обработка ввода описания"""
    description = None if message.text == "/skip" else message.text
    
    await state.update_data(description=description)
    
    # Получаем категории пользователя
    async with AsyncSessionLocal() as db:
        user_service = UserService(db)
        user = await user_service.get_user_by_telegram_id(str(message.from_user.id))
        
        if not user:
            await message.answer("❌ Ошибка: пользователь не найден.")
            await state.clear()
            return
        
        data = await state.get_data()
        transaction_type = data['transaction_type']
        
        category_service = CategoryService(db)
        categories = await category_service.get_user_categories(
            user.id, 
            transaction_type=transaction_type
        )
        
        if categories:
            await state.set_state(AddTransactionStates.waiting_for_category)
            keyboard = get_categories_keyboard(categories)
            
            type_name = "дохода" if transaction_type == TransactionType.INCOME else "расхода"
            await message.answer(
                f"Выберите категорию {type_name} или отправьте /skip:",
                reply_markup=keyboard
            )
        else:
            # Нет категорий, создаем транзакцию без категории
            await create_transaction_from_state(message, state, user.id, db)


@router.message(AddTransactionStates.waiting_for_category)
async def process_category(message: Message, state: FSMContext):
    """Обработка выбора категории"""
    async with AsyncSessionLocal() as db:
        user_service = UserService(db)
        user = await user_service.get_user_by_telegram_id(str(message.from_user.id))
        
        if not user:
            await message.answer("❌ Ошибка: пользователь не найден.")
            await state.clear()
            return
        
        category_id = None
        if message.text != "/skip":
            # Ищем категорию по названию
            category_service = CategoryService(db)
            data = await state.get_data()
            transaction_type = data['transaction_type']
            
            categories = await category_service.get_user_categories(
                user.id, 
                transaction_type=transaction_type
            )
            
            for category in categories:
                if category.name == message.text:
                    category_id = category.id
                    break
        
        await state.update_data(category_id=category_id)
        await create_transaction_from_state(message, state, user.id, db)


async def create_transaction_from_state(message: Message, state: FSMContext, user_id: int, db):
    """Создание транзакции из данных состояния"""
    data = await state.get_data()
    
    transaction_service = TransactionService(db)
    transaction_data = TransactionCreate(
        type=data['transaction_type'],
        amount=data['amount'],
        title=data.get('description', f"{data['transaction_type'].value.title()} {data['amount']} ₽"),
        description=data.get('description'),
        transaction_date=date.today(),
        category_id=data.get('category_id')
    )
    
    try:
        transaction = await transaction_service.create_transaction(user_id, transaction_data)
        
        type_emoji = "💰" if data['transaction_type'] == TransactionType.INCOME else "💸"
        type_sign = "+" if data['transaction_type'] == TransactionType.INCOME else "-"
        
        await message.answer(
            f"✅ <b>Транзакция добавлена!</b>\n\n"
            f"{type_emoji} Сумма: {type_sign}{data['amount']} ₽\n"
            f"📝 Описание: {data.get('description', 'Не указано')}\n"
            f"📅 Дата: {date.today().strftime('%d.%m.%Y')}",
            parse_mode="HTML",
            reply_markup=get_main_keyboard()
        )
        
    except Exception as e:
        await message.answer(
            f"❌ Ошибка при создании транзакции: {str(e)}",
            reply_markup=get_main_keyboard()
        )
    
    await state.clear()


@router.message(F.text == "📊 Баланс")
async def balance_button(message: Message):
    """Обработчик кнопки баланса"""
    # Переиспользуем логику из команды /balance
    from app.bot.handlers.commands import balance_command
    await balance_command(message)


@router.message(F.text == "📈 Статистика")
async def stats_button(message: Message):
    """Обработчик кнопки статистики"""
    # Переиспользуем логику из команды /stats
    from app.bot.handlers.commands import stats_command
    await stats_command(message)