"""
Pydantic схемы для транзакций
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from decimal import Decimal
from app.models.category import TransactionType


class TransactionBase(BaseModel):
    type: TransactionType
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    transaction_date: date
    category_id: Optional[int] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    type: Optional[TransactionType] = None
    amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    transaction_date: Optional[date] = None
    category_id: Optional[int] = None


class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    created_at: datetime
    category_name: Optional[str] = Field(None, description="Category name (computed field)")
    
    class Config:
        from_attributes = True
        
    @classmethod
    def from_attributes(cls, obj):
        """Create response from SQLAlchemy object"""
        data = {
            'id': obj.id,
            'user_id': obj.user_id,
            'type': obj.type,
            'amount': obj.amount,
            'title': obj.title,
            'description': obj.description,
            'transaction_date': obj.transaction_date,
            'category_id': obj.category_id,
            'created_at': obj.created_at,
            'category_name': obj.category.name if obj.category else None
        }
        return cls(**data)


class TransactionStats(BaseModel):
    total_income: Decimal
    total_expense: Decimal
    balance: Decimal
    transactions_count: int