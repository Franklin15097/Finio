"""
Эндпоинты для работы с категориями
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.category import TransactionType
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.services.category_service import CategoryService

router = APIRouter()


@router.post("/", response_model=CategoryResponse)
async def create_category(
    category_data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Создание новой категории"""
    category_service = CategoryService(db)
    
    category = await category_service.create_category(
        current_user.id, 
        category_data
    )
    
    return category


@router.get("/", response_model=List[CategoryResponse])
async def get_categories(
    transaction_type: Optional[TransactionType] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получение списка категорий пользователя"""
    category_service = CategoryService(db)
    
    categories = await category_service.get_user_categories(
        user_id=current_user.id,
        transaction_type=transaction_type
    )
    
    return categories


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получение категории по ID"""
    category_service = CategoryService(db)
    
    category = await category_service.get_category_by_id(
        category_id, 
        current_user.id
    )
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    return category


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Обновление категории"""
    category_service = CategoryService(db)
    
    category = await category_service.update_category(
        category_id, 
        current_user.id, 
        category_data
    )
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    return category


@router.delete("/{category_id}")
async def delete_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Удаление категории"""
    category_service = CategoryService(db)
    
    success = await category_service.delete_category(
        category_id, 
        current_user.id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found or cannot be deleted"
        )
    
    return {"message": "Category deleted successfully"}