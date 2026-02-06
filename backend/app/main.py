"""
FastAPI приложение - точка входа
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import init_db
from app.api.v1 import api_router
from app.bot.webhook import bot_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Управление жизненным циклом приложения"""
    # Инициализация БД при запуске
    await init_db()
    yield
    # Очистка ресурсов при завершении
    pass


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Finio - Умный контроль финансов",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(api_router, prefix="/api/v1")

# Bot webhook
app.include_router(bot_router, prefix="/bot-webhook")

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "app": settings.APP_NAME}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )