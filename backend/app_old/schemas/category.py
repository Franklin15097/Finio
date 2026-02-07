"""
Pydantic схемы для категорий
"""
from pydantic import BaseModel, Field
from typing import Optional
from app.models.category import TransactionType


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    type: TransactionType
    color: str = Field(default="#3B82F6", regex=r"^#[0-9A-Fa-f]{6}$")
    icon: Optional[str] = Field(None, max_length=50)


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    color: Optional[str] = Field(None, regex=r"^#[0-9A-Fa-f]{6}$")
    icon: Optional[str] = Field(None, max_length=50)


class CategoryResponse(CategoryBase):
    id: int
    user_id: int
    is_default: bool
    
    class Config:
        from_attributes = True