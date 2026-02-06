"""
Сервис для работы с пользователями
"""
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_user(self, user_data: UserCreate) -> User:
        """Создание нового пользователя"""
        hashed_password = get_password_hash(user_data.password)
        
        db_user = User(
            email=user_data.email,
            password_hash=hashed_password,
            full_name=user_data.full_name
        )
        
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        return db_user
    
    async def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Получение пользователя по ID"""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Получение пользователя по email"""
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
    
    async def get_user_by_telegram_id(self, telegram_id: str) -> Optional[User]:
        """Получение пользователя по Telegram ID"""
        result = await self.db.execute(
            select(User).where(User.telegram_id == telegram_id)
        )
        return result.scalar_one_or_none()
    
    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Аутентификация пользователя"""
        user = await self.get_user_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            return None
        return user
    
    async def update_user(self, user_id: int, user_data: UserUpdate) -> Optional[User]:
        """Обновление данных пользователя"""
        user = await self.get_user_by_id(user_id)
        if not user:
            return None
        
        update_data = user_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def link_telegram(self, user_id: int, telegram_id: str) -> Optional[User]:
        """Привязка Telegram аккаунта к пользователю"""
        user = await self.get_user_by_id(user_id)
        if not user:
            return None
        
        user.telegram_id = telegram_id
        await self.db.commit()
        await self.db.refresh(user)
        return user