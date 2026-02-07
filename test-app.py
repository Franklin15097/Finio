#!/usr/bin/env python3
"""
Минимальное тестовое приложение для диагностики
"""

from fastapi import FastAPI
import os
import sys

# Добавляем путь к приложению
sys.path.insert(0, '/var/www/finio/backend')

app = FastAPI(title="Finio Test", version="1.0.0")

@app.get("/")
async def root():
    return {"message": "Finio Test App работает!", "status": "ok"}

@app.get("/health")
async def health():
    return {"status": "healthy", "app": "Finio Test"}

@app.get("/test-imports")
async def test_imports():
    """Тестирует импорты основных модулей"""
    results = {}
    
    # Тест базовых импортов
    try:
        from app.core.config import settings
        results["config"] = "✅ OK"
    except Exception as e:
        results["config"] = f"❌ Error: {str(e)}"
    
    try:
        from app.core.database import Base
        results["database"] = "✅ OK"
    except Exception as e:
        results["database"] = f"❌ Error: {str(e)}"
    
    try:
        from app.models.user import User
        results["models"] = "✅ OK"
    except Exception as e:
        results["models"] = f"❌ Error: {str(e)}"
    
    try:
        from app.api.v1 import api_router
        results["api_router"] = "✅ OK"
    except Exception as e:
        results["api_router"] = f"❌ Error: {str(e)}"
    
    try:
        from app.bot.webhook import bot_router
        results["bot_router"] = "✅ OK"
    except Exception as e:
        results["bot_router"] = f"❌ Error: {str(e)}"
    
    return {"import_tests": results}

@app.get("/test-db")
async def test_db():
    """Тестирует подключение к базе данных"""
    try:
        import aiomysql
        from app.core.config import settings
        
        # Пробуем подключиться к MySQL
        conn = await aiomysql.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            db=settings.DB_NAME
        )
        await conn.ensure_closed()
        
        return {"database": "✅ Подключение к MySQL успешно"}
    except Exception as e:
        return {"database": f"❌ Ошибка подключения к MySQL: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)