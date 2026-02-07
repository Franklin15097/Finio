"""
FastAPI приложение - точка входа
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Простая конфигурация без внешних зависимостей
class Settings:
    APP_NAME = os.getenv("APP_NAME", "Finio API")
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"
    ALLOWED_HOSTS = ["*"]  # Упрощенная версия

settings = Settings()

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Finio - Умный контроль финансов"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "app": settings.APP_NAME}

@app.get("/")
async def root():
    return {"message": "Finio API работает!", "status": "ok"}

# Простые API эндпоинты для тестирования
@app.get("/api/v1/test")
async def test_api():
    return {"message": "API v1 работает", "status": "success"}

# Простой webhook для бота
@app.post("/bot-webhook/")
async def bot_webhook():
    return {"status": "webhook received"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )