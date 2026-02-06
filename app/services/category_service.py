"""
Сервис для работы с категориями
"""
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.category import Category, TransactionType
from app.schemas.category import CategoryCreate, CategoryUpdate


class CategoryService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_category(self, user_id: int, category_data: CategoryCreate) -> Category:
        """Создание новой категории"""
        db_category = Category(
            user_id=user_id,
            **category_data.dict()
        )
        
        self.db.add(db_category)
        await self.db.commit()
        await self.db.refresh(db_category)
        return db_category
    
    async def get_category_by_id(self, category_id: int, user_id: int) -> Optional[Category]:
        """Получение категории по ID"""
        result = await self.db.execute(
            select(Category).where(
                and_(Category.id == category_id, Category.user_id == user_id)
            )
        )
        return result.scalar_one_or_none()
    
    async def get_user_categories(
        self, 
        user_id: int, 
        transaction_type: Optional[TransactionType] = None
    ) -> List[Category]:
        """Получение категорий пользователя"""
        query = select(Category).where(Category.user_id == user_id)
        
        if transaction_type:
            query = query.where(Category.type == transaction_type)
        
        query = query.order_by(Category.name)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def update_category(
        self, 
        category_id: int, 
        user_id: int, 
        category_data: CategoryUpdate
    ) -> Optional[Category]:
        """Обновление категории"""
        category = await self.get_category_by_id(category_id, user_id)
        if not category:
            return None
        
        update_data = category_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(category, field, value)
        
        await self.db.commit()
        await self.db.refresh(category)
        return category
    
    async def delete_category(self, category_id: int, user_id: int) -> bool:
        """Удаление категории"""
        category = await self.get_category_by_id(category_id, user_id)
        if not category or category.is_default:
            return False
        
        await self.db.delete(category)
        await self.db.commit()
        return True
    
    async def create_default_categories(self, user_id: int):
        """Создание категорий по умолчанию для нового пользователя"""
        default_categories = [
            # Расходы
            {"name": "Еда", "type": TransactionType.EXPENSE, "color": "#FF6B6B", "icon": "🍽️", "is_default": True},
            {"name": "Транспорт", "type": TransactionType.EXPENSE, "color": "#4ECDC4", "icon": "🚗", "is_default": True},
            {"name": "Развлечения", "type": TransactionType.EXPENSE, "color": "#45B7D1", "icon": "🎬", "is_default": True},
            {"name": "Покупки", "type": TransactionType.EXPENSE, "color": "#96CEB4", "icon": "🛍️", "is_default": True},
            {"name": "Здоровье", "type": TransactionType.EXPENSE, "color": "#FFEAA7", "icon": "🏥", "is_default": True},
            {"name": "Образование", "type": TransactionType.EXPENSE, "color": "#DDA0DD", "icon": "📚", "is_default": True},
            
            # Доходы
            {"name": "Зарплата", "type": TransactionType.INCOME, "color": "#00B894", "icon": "💰", "is_default": True},
            {"name": "Фриланс", "type": TransactionType.INCOME, "color": "#00CEC9", "icon": "💻", "is_default": True},
            {"name": "Инвестиции", "type": TransactionType.INCOME, "color": "#6C5CE7", "icon": "📈", "is_default": True},
            {"name": "Подарки", "type": TransactionType.INCOME, "color": "#FD79A8", "icon": "🎁", "is_default": True},
        ]
        
        for cat_data in default_categories:
            category = Category(user_id=user_id, **cat_data)
            self.db.add(category)
        
        await self.db.commit()