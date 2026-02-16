# 📡 API Documentation

Полная документация API endpoints для Finio.

## Base URL

```
Production: https://studiofinance.ru/api
Development: http://localhost:5000/api
```

## Авторизация

Все защищённые endpoints требуют JWT токен в заголовке:

```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication

### POST /auth/telegram
Авторизация через Telegram Mini App

**Request:**
```json
{
  "initData": "query_id=...&user=...&hash=..."
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "tg123456@telegram.user",
    "name": "John Doe",
    "telegram_id": 123456,
    "telegram_username": "johndoe"
  }
}
```

### POST /auth/telegram-widget
Авторизация через Telegram Login Widget

**Request:**
```json
{
  "id": 123456,
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "auth_date": 1234567890,
  "hash": "abc123..."
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "tg123456@telegram.user",
    "name": "John Doe",
    "telegram_id": 123456,
    "telegram_username": "johndoe"
  }
}
```

### GET /auth/me
Получить текущего пользователя

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "tg123456@telegram.user",
    "name": "John Doe",
    "telegram_id": 123456,
    "telegram_username": "johndoe",
    "created_at": "2026-01-01T00:00:00.000Z"
  }
}
```

---

## 💰 Transactions

### GET /transactions
Получить все транзакции пользователя

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "category_id": 5,
    "account_id": 1,
    "amount": 500.00,
    "description": "Продукты",
    "transaction_date": "2026-02-16",
    "transaction_type": "expense",
    "category_name": "Еда",
    "category_icon": "ShoppingCart",
    "category_color": "#ef4444",
    "created_at": "2026-02-16T10:00:00.000Z"
  }
]
```

### POST /transactions
Создать транзакцию

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "category_id": 5,
  "account_id": 1,
  "amount": 500.00,
  "description": "Продукты",
  "transaction_date": "2026-02-16"
}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "category_id": 5,
  "account_id": 1,
  "amount": 500.00,
  "description": "Продукты",
  "transaction_date": "2026-02-16",
  "created_at": "2026-02-16T10:00:00.000Z"
}
```

### PUT /transactions/:id
Обновить транзакцию

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "amount": 600.00,
  "description": "Продукты и напитки"
}
```

**Response:**
```json
{
  "message": "Transaction updated successfully"
}
```

### DELETE /transactions/:id
Удалить транзакцию

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Transaction deleted successfully"
}
```

---

## 📂 Categories

### GET /categories
Получить все категории пользователя

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Еда",
    "icon": "ShoppingCart",
    "color": "#ef4444",
    "type": "expense",
    "created_at": "2026-01-01T00:00:00.000Z"
  }
]
```

### POST /categories
Создать категорию

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "Транспорт",
  "icon": "Car",
  "color": "#3b82f6",
  "type": "expense"
}
```

**Response:**
```json
{
  "id": 2,
  "user_id": 1,
  "name": "Транспорт",
  "icon": "Car",
  "color": "#3b82f6",
  "type": "expense",
  "created_at": "2026-02-16T10:00:00.000Z"
}
```

### PUT /categories/:id
Обновить категорию

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "Общественный транспорт",
  "color": "#6366f1"
}
```

**Response:**
```json
{
  "message": "Category updated successfully"
}
```

### DELETE /categories/:id
Удалить категорию

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Category deleted successfully"
}
```

---

## 💳 Accounts

### GET /accounts
Получить все счета пользователя

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Основная карта",
    "icon": "wallet",
    "percentage": 60,
    "planned_balance": 50000.00,
    "actual_balance": 45000.00,
    "created_at": "2026-01-01T00:00:00.000Z"
  }
]
```

### POST /accounts
Создать счёт

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "Сбережения",
  "icon": "savings",
  "percentage": 40,
  "planned_balance": 100000.00
}
```

**Response:**
```json
{
  "id": 2,
  "user_id": 1,
  "name": "Сбережения",
  "icon": "savings",
  "percentage": 40,
  "planned_balance": 100000.00,
  "actual_balance": 0.00,
  "created_at": "2026-02-16T10:00:00.000Z"
}
```

### PUT /accounts/:id
Обновить счёт

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "actual_balance": 105000.00
}
```

**Response:**
```json
{
  "message": "Account updated successfully"
}
```

### DELETE /accounts/:id
Удалить счёт

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Account deleted successfully"
}
```

---

## 📊 Dashboard

### GET /dashboard/stats
Получить общую статистику

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "balance": 45000.00,
  "totalIncome": 100000.00,
  "totalExpense": 55000.00,
  "recentTransactions": [
    {
      "id": 1,
      "amount": 500.00,
      "description": "Продукты",
      "transaction_date": "2026-02-16",
      "transaction_type": "expense",
      "category_name": "Еда",
      "category_icon": "ShoppingCart",
      "category_color": "#ef4444"
    }
  ]
}
```

---

## 📈 Analytics

### GET /analytics/categories
Статистика по категориям

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD
- `type` (optional): income | expense

**Response:**
```json
[
  {
    "id": 1,
    "name": "Еда",
    "icon": "ShoppingCart",
    "color": "#ef4444",
    "type": "expense",
    "transaction_count": 25,
    "total_amount": 15000.00,
    "avg_amount": 600.00,
    "min_amount": 100.00,
    "max_amount": 2000.00
  }
]
```

### GET /analytics/heatmap
Тепловая карта расходов

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD

**Response:**
```json
[
  {
    "day_of_week": 1,
    "hour_of_day": 12,
    "transaction_count": 5,
    "total_amount": 2500.00
  }
]
```

### GET /analytics/compare-periods
Сравнение периодов

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `period1Start`: YYYY-MM-DD (required)
- `period1End`: YYYY-MM-DD (required)
- `period2Start`: YYYY-MM-DD (required)
- `period2End`: YYYY-MM-DD (required)

**Response:**
```json
[
  {
    "period": "period1",
    "total_income": 50000.00,
    "total_expense": 30000.00,
    "transaction_count": 45,
    "categories_used": 8
  },
  {
    "period": "period2",
    "total_income": 45000.00,
    "total_expense": 35000.00,
    "transaction_count": 52,
    "categories_used": 10
  }
]
```

### GET /analytics/forecast
Прогноз баланса

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `days` (optional): number (default: 30)

**Response:**
```json
{
  "current_balance": 45000.00,
  "avg_daily_change": 150.00,
  "forecast": [
    {
      "date": "2026-02-17",
      "predicted_balance": 45150.00,
      "confidence": 98
    }
  ]
}
```

### GET /analytics/top-expenses
Топ категорий расходов

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): number (default: 10)
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD

**Response:**
```json
[
  {
    "id": 1,
    "name": "Еда",
    "icon": "ShoppingCart",
    "color": "#ef4444",
    "transaction_count": 25,
    "total_amount": 15000.00,
    "avg_amount": 600.00,
    "percentage": 27.27
  }
]
```

### GET /analytics/trends
Анализ трендов

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `period` (optional): day | week | month (default: month)

**Response:**
```json
[
  {
    "period": "2026-01",
    "income": 50000.00,
    "expense": 30000.00,
    "balance": 20000.00
  }
]
```

### GET /analytics/export/csv
Экспорт в CSV

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD

**Response:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="transactions_1234567890.csv"

Дата,Категория,Тип,Сумма,Описание
16.02.2026,Еда,expense,500,Продукты
```

### GET /analytics/export/excel
Экспорт в Excel

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD

**Response:**
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="transactions_1234567890.xlsx"

[Binary Excel file]
```

### GET /analytics/export/pdf
Экспорт в PDF

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD

**Response:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="transactions_1234567890.pdf"

[Binary PDF file]
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## 📝 Notes

- Все даты в формате ISO 8601 (YYYY-MM-DD)
- Все суммы в рублях (RUB)
- JWT токены действительны 30 дней
- Rate limit: 100 запросов в минуту на IP

## 🔗 Links

- **Production API:** https://studiofinance.ru/api
- **GitHub:** https://github.com/Franklin15097/Finio
- **Support:** support@studiofinance.ru
