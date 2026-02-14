# Financial Literacy Web Application

A full-stack web application for tracking income, expenses, and budgets with a React frontend and Node.js/Express backend.

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
