# Financial Literacy Web Application

A full-stack web application for tracking income, expenses, and budgets with a React frontend and Node.js/Express backend.

## 🚀 Telegram Mini App

Finio теперь доступен как Telegram Mini App! Используйте приложение прямо в Telegram без необходимости открывать браузер.

### Быстрая настройка Telegram бота:

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Добавьте токен в `backend/.env`:
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   ```
3. Выполните миграцию БД:
   ```bash
   mysql -u app_user -p financial_db < backend/database/telegram_migration.sql
   ```
4. Настройте Menu Button в BotFather:
   - URL: `https://studiofinance.ru`
   - Text: `Открыть Finio`

📖 Подробная инструкция: [TELEGRAM_SETUP.md](./TELEGRAM_SETUP.md)

## Project Structure

```
.
├── frontend/              # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── index.html
├── backend/              # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── index.ts
│   │   └── db.ts
│   ├── database/
│   │   └── schema.sql
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── docker-compose.yml    # MySQL container
└── package.json         # Root workspace config
```

## Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start MySQL:
```bash
npm run docker:up
```

3. Start development servers:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`
Backend runs on `http://localhost:5000`

## Database

The MySQL database is automatically initialized with:
- **categories** table (income/expense types)
- **transactions** table (income/expense records)
- **budgets** table (monthly budget limits)

## API Endpoints

- `GET /api/transactions` - List all transactions
- `POST /api/transactions` - Create transaction
- `GET /api/categories` - List all categories
- `GET /api/categories/:type` - Filter by type (income/expense)
- `GET /api/budgets` - List all budgets
- `POST /api/budgets` - Create budget

## Build

```bash
npm run build
```

## Stop Docker

```bash
npm run docker:down
```
