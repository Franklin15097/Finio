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
    category_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class TransactionStats(BaseModel):
    total_income: Decimal
    total_expense: Decimal
    balance: Decimal
    transactions_count: int