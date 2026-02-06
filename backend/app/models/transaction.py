"""
Модель транзакции
"""
from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey, Enum, Numeric, func
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.category import TransactionType


class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(TransactionType), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    title = Column(String(100), nullable=False)
    description = Column(Text)
    transaction_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")