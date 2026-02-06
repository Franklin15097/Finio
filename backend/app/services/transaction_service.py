"""
Сервис для работы с транзакциями
"""
from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from sqlalchemy.orm import selectinload
from app.models.transaction import Transaction
from app.models.category import Category
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionStats


class TransactionService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_transaction(self, user_id: int, transaction_data: TransactionCreate) -> Transaction:
        """Создание новой транзакции"""
        db_transaction = Transaction(
            user_id=user_id,
            **transaction_data.dict()
        )
        
        self.db.add(db_transaction)
        await self.db.commit()
        await self.db.refresh(db_transaction)
        return db_transaction
    
    async def get_transaction_by_id(self, transaction_id: int, user_id: int) -> Optional[Transaction]:
        """Получение транзакции по ID"""
        result = await self.db.execute(
            select(Transaction)
            .options(selectinload(Transaction.category))
            .where(and_(Transaction.id == transaction_id, Transaction.user_id == user_id))
        )
        return result.scalar_one_or_none()
    
    async def get_user_transactions(
        self, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 100,
        category_id: Optional[int] = None,
        transaction_type: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None
    ) -> List[Transaction]:
        """Получение транзакций пользователя с фильтрами"""
        query = select(Transaction).options(selectinload(Transaction.category)).where(Transaction.user_id == user_id)
        
        if category_id:
            query = query.where(Transaction.category_id == category_id)
        
        if transaction_type:
            query = query.where(Transaction.type == transaction_type)
        
        if date_from:
            query = query.where(Transaction.transaction_date >= date_from)
        
        if date_to:
            query = query.where(Transaction.transaction_date <= date_to)
        
        query = query.order_by(desc(Transaction.transaction_date), desc(Transaction.created_at))
        query = query.offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def update_transaction(
        self, 
        transaction_id: int, 
        user_id: int, 
        transaction_data: TransactionUpdate
    ) -> Optional[Transaction]:
        """Обновление транзакции"""
        transaction = await self.get_transaction_by_id(transaction_id, user_id)
        if not transaction:
            return None
        
        update_data = transaction_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(transaction, field, value)
        
        await self.db.commit()
        await self.db.refresh(transaction)
        return transaction
    
    async def delete_transaction(self, transaction_id: int, user_id: int) -> bool:
        """Удаление транзакции"""
        transaction = await self.get_transaction_by_id(transaction_id, user_id)
        if not transaction:
            return False
        
        await self.db.delete(transaction)
        await self.db.commit()
        return True
    
    async def get_user_stats(
        self, 
        user_id: int,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None
    ) -> TransactionStats:
        """Получение статистики по транзакциям пользователя"""
        query = select(
            func.sum(func.case((Transaction.type == 'income', Transaction.amount), else_=0)).label('total_income'),
            func.sum(func.case((Transaction.type == 'expense', Transaction.amount), else_=0)).label('total_expense'),
            func.count(Transaction.id).label('transactions_count')
        ).where(Transaction.user_id == user_id)
        
        if date_from:
            query = query.where(Transaction.transaction_date >= date_from)
        
        if date_to:
            query = query.where(Transaction.transaction_date <= date_to)
        
        result = await self.db.execute(query)
        row = result.first()
        
        total_income = row.total_income or Decimal('0')
        total_expense = row.total_expense or Decimal('0')
        balance = total_income - total_expense
        
        return TransactionStats(
            total_income=total_income,
            total_expense=total_expense,
            balance=balance,
            transactions_count=row.transactions_count or 0
        )