"""
Клавиатуры для Telegram бота
"""
from typing import List
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardMarkup, InlineKeyboardButton
from app.models.category import Category


def get_main_keyboard() -> ReplyKeyboardMarkup:
    """Основная клавиатура бота"""
    keyboard = [
        [
            KeyboardButton(text="💰 Добавить доход"),
            KeyboardButton(text="💸 Добавить расход")
        ],
        [
            KeyboardButton(text="📊 Баланс"),
            KeyboardButton(text="📈 Статистика")
        ],
        [
            KeyboardButton(text="📋 Категории"),
            KeyboardButton(text="⚙️ Настройки")
        ]
    ]
    
    return ReplyKeyboardMarkup(
        keyboard=keyboard,
        resize_keyboard=True,
        one_time_keyboard=False
    )


def get_auth_keyboard() -> InlineKeyboardMarkup:
    """Клавиатура для неавторизованных пользователей"""
    keyboard = [
        [
            InlineKeyboardButton(
                text="🔗 Привязать аккаунт",
                callback_data="link_account"
            )
        ],
        [
            InlineKeyboardButton(
                text="📱 Открыть веб-версию",
                url="https://your-domain.com"  # Замените на ваш домен
            )
        ]
    ]
    
    return InlineKeyboardMarkup(inline_keyboard=keyboard)


def get_categories_keyboard(categories: List[Category]) -> ReplyKeyboardMarkup:
    """Клавиатура с категориями"""
    keyboard = []
    
    # Добавляем категории по 2 в ряд
    for i in range(0, len(categories), 2):
        row = []
        row.append(KeyboardButton(text=categories[i].name))
        
        if i + 1 < len(categories):
            row.append(KeyboardButton(text=categories[i + 1].name))
        
        keyboard.append(row)
    
    # Добавляем кнопку пропуска
    keyboard.append([KeyboardButton(text="⏭️ Пропустить")])
    
    return ReplyKeyboardMarkup(
        keyboard=keyboard,
        resize_keyboard=True,
        one_time_keyboard=True
    )


def get_transaction_type_keyboard() -> InlineKeyboardMarkup:
    """Клавиатура выбора типа транзакции"""
    keyboard = [
        [
            InlineKeyboardButton(
                text="💰 Доход",
                callback_data="quick_income"
            ),
            InlineKeyboardButton(
                text="💸 Расход",
                callback_data="quick_expense"
            )
        ]
    ]
    
    return InlineKeyboardMarkup(inline_keyboard=keyboard)


def get_categories_inline_keyboard(categories: List[Category]) -> InlineKeyboardMarkup:
    """Inline клавиатура с категориями"""
    keyboard = []
    
    for category in categories:
        keyboard.append([
            InlineKeyboardButton(
                text=f"{category.icon or '📁'} {category.name}",
                callback_data=f"category_{category.id}"
            )
        ])
    
    # Добавляем кнопку "Без категории"
    keyboard.append([
        InlineKeyboardButton(
            text="❌ Без категории",
            callback_data="category_none"
        )
    ])
    
    return InlineKeyboardMarkup(inline_keyboard=keyboard)