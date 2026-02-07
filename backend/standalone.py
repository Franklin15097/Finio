"""
Standalone FastAPI приложение - работает без зависимостей от app пакета
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="Finio API",
    version="1.0.0",
    description="Finio - Умный контроль финансов"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Finio API работает!", "status": "ok"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "app": "Finio API"}

@app.get("/api/v1/test")
async def test_api():
    return {"message": "API v1 работает", "status": "success"}

@app.post("/bot-webhook/")
async def bot_webhook():
    return {"status": "webhook received"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
