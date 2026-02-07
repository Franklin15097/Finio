"""
Подключение к базе данных MySQL
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings


# Создаем асинхронный движок для MySQL
engine = create_async_engine(
    settings.database_url,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_recycle=3600,  # MySQL рекомендует больше времени
    pool_size=10,
    max_overflow=20,
    # MySQL специфичные настройки
    connect_args={
        "charset": "utf8mb4",
        "use_unicode": True,
    }
)

# Создаем фабрику сессий
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


class Base(DeclarativeBase):
    """Базовый класс для всех моделей"""
    pass


async def get_db() -> AsyncSession:
    """Dependency для получения сессии БД"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """Инициализация базы данных MySQL"""
    # Импортируем все модели для создания таблиц
    from app.models import user, transaction, category, budget
    
    async with engine.begin() as conn:
        # В продакшене используйте Alembic для миграций
        if settings.DEBUG:
            await conn.run_sync(Base.metadata.create_all)