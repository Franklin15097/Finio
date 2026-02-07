"""
API для аутентификации через Telegram
"""
import hashlib
import hmac
import json
from urllib.parse import unquote
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.database import get_db
from app.core.config import settings
from app.services.user_service import UserService
from app.schemas.user import UserCreate

router = APIRouter()


class TelegramAuthRequest(BaseModel):
    telegram_id: str
    first_name: str
    last_name: str = None
    username: str = None
    init_data: str = ""


class TelegramAuthResponse(BaseModel):
    user_id: int
    message: str


def verify_telegram_auth(init_data: str, bot_token: str) -> bool:
    """
    Проверяет подлинность данных от Telegram WebApp
    """
    if not init_data or not bot_token:
        return False
    
    try:
        # Парсим данные
        data_dict = {}
        for item in init_data.split('&'):
            if '=' in item:
                key, value = item.split('=', 1)
                data_dict[key] = unquote(value)
        
        # Извлекаем hash
        received_hash = data_dict.pop('hash', '')
        if not received_hash:
            return False
        
        # Создаем строку для проверки
        data_check_string = '\n'.join([f"{k}={v}" for k, v in sorted(data_dict.items())])
        
        # Создаем секретный ключ
        secret_key = hmac.new(
            "WebAppData".encode(),
            bot_token.encode(),
            hashlib.sha256
        ).digest()
        
        # Вычисляем hash
        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return calculated_hash == received_hash
    
    except Exception:
        return False


@router.post("/telegram", response_model=TelegramAuthResponse)
async def authenticate_telegram_user(
    auth_data: TelegramAuthRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Аутентификация пользователя через Telegram
    """
    user_service = UserService(db)
    
    # Проверяем подлинность данных (в продакшене)
    if settings.ENVIRONMENT == "production" and auth_data.init_data:
        if not verify_telegram_auth(auth_data.init_data, settings.TELEGRAM_BOT_TOKEN):
            raise HTTPException(status_code=401, detail="Неверные данные аутентификации")
    
    # Ищем пользователя по Telegram ID
    user = await user_service.get_user_by_telegram_id(auth_data.telegram_id)
    
    if user:
        return TelegramAuthResponse(
            user_id=user.id,
            message="Пользователь найден"
        )
    
    # Создаем нового пользователя
    full_name = auth_data.first_name
    if auth_data.last_name:
        full_name += f" {auth_data.last_name}"
    
    user_data = UserCreate(
        email=f"telegram_{auth_data.telegram_id}@telegram.local",
        full_name=full_name,
        telegram_id=auth_data.telegram_id
    )
    
    user = await user_service.create_user(user_data)
    
    return TelegramAuthResponse(
        user_id=user.id,
        message="Новый пользователь создан"
    )