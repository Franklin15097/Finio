"""
Finio API - Простое и рабочее приложение
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os
from datetime import datetime, date

app = FastAPI(
    title="Finio API",
    version="1.0.0",
    description="Система управления финансами"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Простое хранилище данных в файлах
DATA_DIR = "/var/lib/finio"
USERS_FILE = f"{DATA_DIR}/users.json"
TRANSACTIONS_FILE = f"{DATA_DIR}/transactions.json"
CATEGORIES_FILE = f"{DATA_DIR}/categories.json"

# Создаем директорию для данных
os.makedirs(DATA_DIR, exist_ok=True)

# Модели данных
class User(BaseModel):
    id: int
    email: str
    name: str
    telegram_id: Optional[str] = None
    created_at: str

class TelegramAuthRequest(BaseModel):
    telegram_id: str
    first_name: str
    last_name: Optional[str] = None
    username: Optional[str] = None
    init_data: str = ""

class Category(BaseModel):
    id: int
    user_id: int
    name: str
    type: str  # income или expense
    color: str = "#3B82F6"

class Transaction(BaseModel):
    id: int
    user_id: int
    category_id: Optional[int] = None
    type: str  # income или expense
    amount: float
    title: str
    description: Optional[str] = None
    date: str
    created_at: str

class TransactionCreate(BaseModel):
    category_id: Optional[int] = None
    type: str
    amount: float
    title: str
    description: Optional[str] = None
    date: str

class CategoryCreate(BaseModel):
    name: str
    type: str
    color: str = "#3B82F6"

# Утилиты для работы с файлами
def load_json(filename: str, default: list = None):
    if default is None:
        default = []
    try:
        if os.path.exists(filename):
            with open(filename, 'r', encoding='utf-8') as f:
                return json.load(f)
        return default
    except:
        return default

def save_json(filename: str, data):
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except:
        return False

def get_next_id(items: list) -> int:
    if not items:
        return 1
    return max(item.get('id', 0) for item in items) + 1

# API эндпоинты
@app.get("/")
async def root():
    return {"message": "Finio API работает!", "status": "ok", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Пользователи
@app.get("/api/users", response_model=List[User])
async def get_users():
    users = load_json(USERS_FILE)
    return users

@app.post("/api/users", response_model=User)
async def create_user(email: str, name: str):
    users = load_json(USERS_FILE)
    
    # Проверяем, что email уникален
    if any(u['email'] == email for u in users):
        raise HTTPException(status_code=400, detail="Email уже используется")
    
    user = {
        "id": get_next_id(users),
        "email": email,
        "name": name,
        "created_at": datetime.now().isoformat()
    }
    
    users.append(user)
    save_json(USERS_FILE, users)
    return user

# Категории
@app.get("/api/users/{user_id}/categories", response_model=List[Category])
async def get_categories(user_id: int):
    categories = load_json(CATEGORIES_FILE)
    user_categories = [c for c in categories if c['user_id'] == user_id]
    return user_categories

@app.post("/api/users/{user_id}/categories", response_model=Category)
async def create_category(user_id: int, category: CategoryCreate):
    categories = load_json(CATEGORIES_FILE)
    
    new_category = {
        "id": get_next_id(categories),
        "user_id": user_id,
        "name": category.name,
        "type": category.type,
        "color": category.color
    }
    
    categories.append(new_category)
    save_json(CATEGORIES_FILE, categories)
    return new_category

# Транзакции
@app.get("/api/users/{user_id}/transactions", response_model=List[Transaction])
async def get_transactions(user_id: int):
    transactions = load_json(TRANSACTIONS_FILE)
    user_transactions = [t for t in transactions if t['user_id'] == user_id]
    # Сортируем по дате (новые сначала)
    user_transactions.sort(key=lambda x: x['created_at'], reverse=True)
    return user_transactions

@app.post("/api/users/{user_id}/transactions", response_model=Transaction)
async def create_transaction(user_id: int, transaction: TransactionCreate):
    transactions = load_json(TRANSACTIONS_FILE)
    
    new_transaction = {
        "id": get_next_id(transactions),
        "user_id": user_id,
        "category_id": transaction.category_id,
        "type": transaction.type,
        "amount": transaction.amount,
        "title": transaction.title,
        "description": transaction.description,
        "date": transaction.date,
        "created_at": datetime.now().isoformat()
    }
    
    transactions.append(new_transaction)
    save_json(TRANSACTIONS_FILE, transactions)
    return new_transaction

@app.delete("/api/transactions/{transaction_id}")
async def delete_transaction(transaction_id: int):
    transactions = load_json(TRANSACTIONS_FILE)
    transactions = [t for t in transactions if t['id'] != transaction_id]
    save_json(TRANSACTIONS_FILE, transactions)
    return {"message": "Транзакция удалена"}

# Статистика
@app.get("/api/users/{user_id}/stats")
async def get_stats(user_id: int):
    transactions = load_json(TRANSACTIONS_FILE)
    user_transactions = [t for t in transactions if t['user_id'] == user_id]
    
    total_income = sum(t['amount'] for t in user_transactions if t['type'] == 'income')
    total_expense = sum(t['amount'] for t in user_transactions if t['type'] == 'expense')
    balance = total_income - total_expense
    
    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": balance,
        "transactions_count": len(user_transactions)
    }

# Telegram webhook (заглушка)
@app.post("/bot-webhook/")
async def bot_webhook():
    return {"status": "webhook received"}

# Telegram аутентификация
@app.post("/api/auth/telegram")
async def authenticate_telegram_user(auth_data: TelegramAuthRequest):
    """Аутентификация пользователя через Telegram"""
    users = load_json(USERS_FILE)
    
    # Ищем пользователя по Telegram ID
    user = next((u for u in users if u.get('telegram_id') == auth_data.telegram_id), None)
    
    if user:
        return {"user_id": user['id'], "message": "Пользователь найден"}
    
    # Создаем нового пользователя
    full_name = auth_data.first_name
    if auth_data.last_name:
        full_name += f" {auth_data.last_name}"
    
    new_user = {
        "id": get_next_id(users),
        "email": f"telegram_{auth_data.telegram_id}@telegram.local",
        "name": full_name,
        "telegram_id": auth_data.telegram_id,
        "created_at": datetime.now().isoformat()
    }
    
    users.append(new_user)
    save_json(USERS_FILE, users)
    
    return {"user_id": new_user['id'], "message": "Новый пользователь создан"}

# Создание тестовых данных
@app.post("/api/init-demo-data")
async def init_demo_data():
    # Создаем тестового пользователя
    users = load_json(USERS_FILE)
    if not users:
        demo_user = {
            "id": 1,
            "email": "demo@finio.ru",
            "name": "Демо пользователь",
            "created_at": datetime.now().isoformat()
        }
        users.append(demo_user)
        save_json(USERS_FILE, users)
    
    # Создаем категории
    categories = load_json(CATEGORIES_FILE)
    if not categories:
        demo_categories = [
            {"id": 1, "user_id": 1, "name": "Зарплата", "type": "income", "color": "#10B981"},
            {"id": 2, "user_id": 1, "name": "Продукты", "type": "expense", "color": "#EF4444"},
            {"id": 3, "user_id": 1, "name": "Транспорт", "type": "expense", "color": "#F59E0B"},
            {"id": 4, "user_id": 1, "name": "Развлечения", "type": "expense", "color": "#8B5CF6"},
        ]
        save_json(CATEGORIES_FILE, demo_categories)
    
    # Создаем транзакции
    transactions = load_json(TRANSACTIONS_FILE)
    if not transactions:
        demo_transactions = [
            {
                "id": 1, "user_id": 1, "category_id": 1, "type": "income",
                "amount": 50000, "title": "Зарплата за январь", "description": "",
                "date": "2024-01-31", "created_at": datetime.now().isoformat()
            },
            {
                "id": 2, "user_id": 1, "category_id": 2, "type": "expense",
                "amount": 3500, "title": "Продукты в Пятерочке", "description": "",
                "date": "2024-02-01", "created_at": datetime.now().isoformat()
            },
            {
                "id": 3, "user_id": 1, "category_id": 3, "type": "expense",
                "amount": 500, "title": "Метро", "description": "",
                "date": "2024-02-02", "created_at": datetime.now().isoformat()
            }
        ]
        save_json(TRANSACTIONS_FILE, demo_transactions)
    
    return {"message": "Демо данные созданы"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)