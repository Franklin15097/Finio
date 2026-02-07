"""
Эндпоинты для работы с транзакциями
"""
from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.transaction import (
    TransactionCreate, 
    TransactionUpdate, 
    TransactionResponse, 
    TransactionStats
)
from app.services.transaction_service import TransactionService

router = APIRouter()


@router.post("/", response_model=TransactionResponse)
async def create_transaction(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Создание новой транзакции"""
    transaction_service = TransactionService(db)
    
    transaction = await transaction_service.create_transaction(
        current_user.id, 
        transaction_data
    )
    
    return transaction


@router.get("/", response_model=List[TransactionResponse])
async def get_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    category_id: Optional[int] = Query(None),
    transaction_type: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получение списка транзакций пользователя"""
    transaction_service = TransactionService(db)
    
    transactions = await transaction_service.get_user_transactions(
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        category_id=category_id,
        transaction_type=transaction_type,
        date_from=date_from,
        date_to=date_to
    )
    
    # Добавляем название категории к каждой транзакции
    result = []
    for transaction in transactions:
        result.append(TransactionResponse.from_attributes(transaction))
    
    return result


@router.get("/stats", response_model=TransactionStats)
async def get_transaction_stats(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получение статистики по транзакциям"""
    transaction_service = TransactionService(db)
    
    stats = await transaction_service.get_user_stats(
        user_id=current_user.id,
        date_from=date_from,
        date_to=date_to
    )
    
    return stats


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получение транзакции по ID"""
    transaction_service = TransactionService(db)
    
    transaction = await transaction_service.get_transaction_by_id(
        transaction_id, 
        current_user.id
    )
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return transaction


@router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: int,
    transaction_data: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Обновление транзакции"""
    transaction_service = TransactionService(db)
    
    transaction = await transaction_service.update_transaction(
        transaction_id, 
        current_user.id, 
        transaction_data
    )
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return transaction


@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Удаление транзакции"""
    transaction_service = TransactionService(db)
    
    success = await transaction_service.delete_transaction(
        transaction_id, 
        current_user.id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return {"message": "Transaction deleted successfully"}