# Quick Start Guide

## 1. Install Dependencies
```bash
npm install
```

## 2. Start MySQL Database
```bash
npm run docker:up
```

Wait for MySQL to be ready (check logs for "ready for connections").

## 3. Start Development Servers
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 4. Access the Application
Open http://localhost:5173 in your browser.

## Features
- Add income and expense transactions
- Categorize transactions
- View transaction history
- Set monthly budgets
- Track spending by category

## Database Credentials
- Host: localhost:3306
- User: app_user
- Password: app_password
- Database: financial_db

## Stopping
```bash
npm run docker:down
```

## Troubleshooting

### Port already in use
- Frontend: Change port in `frontend/vite.config.ts`
- Backend: Change PORT in `backend/.env`
- MySQL: Change port in `docker-compose.yml`

### Database connection failed
- Ensure Docker is running
- Check MySQL container: `docker ps`
- View logs: `docker logs financial_app_db`

### Dependencies not installing
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
