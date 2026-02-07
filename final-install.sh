#!/bin/bash

# ФИНАЛЬНЫЙ ПРОСТОЙ УСТАНОВЩИК FINIO
# Использование: sudo ./final-install.sh

set -e

if [ "$EUID" -ne 0 ]; then
    echo "Запустите с правами root: sudo ./final-install.sh"
    exit 1
fi

echo "🚀 ФИНАЛЬНАЯ УСТАНОВКА FINIO"
echo "============================"

PROJECT_DIR="/var/www/finio"
DOMAIN="studiofinance.ru"

# 1. Полная очистка
echo "1. Полная очистка..."
systemctl stop finio 2>/dev/null || true
systemctl stop nginx 2>/dev/null || true
systemctl disable finio 2>/dev/null || true
rm -f /etc/systemd/system/finio.service
rm -rf $PROJECT_DIR
rm -rf /var/www/html
userdel -r finio 2>/dev/null || true
systemctl daemon-reload

# 2. Установка базовых пакетов
echo "2. Установка пакетов..."
apt update -qq
apt install -y python3 python3-pip python3-venv nginx curl

# 3. Создание пользователя и директорий
echo "3. Создание структуры..."
adduser --system --group --home $PROJECT_DIR --shell /bin/bash finio
mkdir -p $PROJECT_DIR/backend
mkdir -p /var/lib/finio /var/log/finio /var/www/html
chown -R finio:finio $PROJECT_DIR /var/lib/finio /var/log/finio

# 4. Создание backend приложения
echo "4. Создание backend..."
cd $PROJECT_DIR/backend

# Создание venv и установка зависимостей
sudo -u finio python3 -m venv venv
sudo -u finio $PROJECT_DIR/backend/venv/bin/pip install --upgrade pip
sudo -u finio $PROJECT_DIR/backend/venv/bin/pip install fastapi uvicorn python-multipart

# Создание main.py
cat > main.py << 'EOF'
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os
from datetime import datetime

app = FastAPI(title="Finio API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = "/var/lib/finio"
os.makedirs(DATA_DIR, exist_ok=True)

class Transaction(BaseModel):
    id: int
    type: str
    amount: float
    title: str
    description: Optional[str] = None
    date: str
    created_at: str

def load_json(filename: str, default=None):
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

@app.get("/")
async def root():
    return {"message": "Finio API работает!", "status": "ok"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/transactions")
async def get_transactions():
    transactions = load_json(f"{DATA_DIR}/transactions.json")
    return transactions

@app.post("/api/transactions")
async def create_transaction(type: str, amount: float, title: str, description: str = ""):
    transactions = load_json(f"{DATA_DIR}/transactions.json")
    
    new_id = max([t.get('id', 0) for t in transactions], default=0) + 1
    
    transaction = {
        "id": new_id,
        "type": type,
        "amount": amount,
        "title": title,
        "description": description,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "created_at": datetime.now().isoformat()
    }
    
    transactions.append(transaction)
    save_json(f"{DATA_DIR}/transactions.json", transactions)
    return transaction

@app.get("/api/stats")
async def get_stats():
    transactions = load_json(f"{DATA_DIR}/transactions.json")
    
    total_income = sum(t['amount'] for t in transactions if t['type'] == 'income')
    total_expense = sum(t['amount'] for t in transactions if t['type'] == 'expense')
    balance = total_income - total_expense
    
    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": balance,
        "transactions_count": len(transactions)
    }

@app.post("/api/init-demo")
async def init_demo():
    demo_transactions = [
        {
            "id": 1, "type": "income", "amount": 50000, "title": "Зарплата",
            "description": "Зарплата за январь", "date": "2024-01-31",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": 2, "type": "expense", "amount": 3500, "title": "Продукты",
            "description": "Покупки в магазине", "date": "2024-02-01",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": 3, "type": "expense", "amount": 1200, "title": "Транспорт",
            "description": "Проездной билет", "date": "2024-02-02",
            "created_at": datetime.now().isoformat()
        }
    ]
    
    save_json(f"{DATA_DIR}/transactions.json", demo_transactions)
    return {"message": "Демо данные созданы"}

@app.post("/bot-webhook/")
async def bot_webhook():
    return {"status": "webhook received"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

chown finio:finio main.py

# 5. Тест backend
echo "5. Тест backend..."
if sudo -u finio timeout 5s $PROJECT_DIR/backend/venv/bin/python main.py &>/dev/null; then
    echo "✅ Backend работает"
else
    echo "⚠️ Backend тест не прошел, но продолжаем..."
fi

# 6. Создание простого frontend
echo "6. Создание frontend..."
cat > /var/www/html/index.html << 'EOF'
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Finio - Управление финансами</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f8fafc; color: #1e293b; line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { 
            background: white; padding: 30px; border-radius: 12px; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 30px; text-align: center;
        }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .stats { 
            display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 20px; margin-bottom: 30px; 
        }
        .stat-card { 
            background: white; padding: 24px; border-radius: 12px; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;
        }
        .stat-card h3 { 
            font-size: 0.875rem; color: #64748b; margin-bottom: 8px; 
            text-transform: uppercase; letter-spacing: 0.05em;
        }
        .stat-card .value { font-size: 2rem; font-weight: 700; }
        .income { color: #10b981; }
        .expense { color: #ef4444; }
        .balance { color: #3b82f6; }
        .transactions { 
            background: white; border-radius: 12px; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;
        }
        .transactions-header { padding: 24px; border-bottom: 1px solid #e2e8f0; }
        .transaction-item { 
            padding: 20px 24px; border-bottom: 1px solid #f1f5f9; 
            display: flex; justify-content: space-between; align-items: center;
        }
        .transaction-item:last-child { border-bottom: none; }
        .transaction-info h4 { margin-bottom: 4px; }
        .transaction-info p { font-size: 0.875rem; color: #64748b; }
        .transaction-amount { font-size: 1.125rem; font-weight: 600; }
        .btn { 
            background: #3b82f6; color: white; border: none; padding: 12px 24px; 
            border-radius: 8px; cursor: pointer; font-size: 0.875rem; margin: 10px;
        }
        .btn:hover { background: #2563eb; }
        .btn-success { background: #10b981; }
        .btn-success:hover { background: #059669; }
        .loading { text-align: center; padding: 40px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💰 Finio</h1>
            <p>Система управления финансами</p>
            <button class="btn btn-success" onclick="initDemo()">Создать демо данные</button>
            <button class="btn" onclick="loadData()">Обновить</button>
        </div>

        <div class="stats" id="stats">
            <div class="stat-card">
                <h3>Доходы</h3>
                <div class="value income" id="income">0 ₽</div>
            </div>
            <div class="stat-card">
                <h3>Расходы</h3>
                <div class="value expense" id="expense">0 ₽</div>
            </div>
            <div class="stat-card">
                <h3>Баланс</h3>
                <div class="value balance" id="balance">0 ₽</div>
            </div>
            <div class="stat-card">
                <h3>Транзакций</h3>
                <div class="value balance" id="count">0</div>
            </div>
        </div>

        <div class="transactions">
            <div class="transactions-header">
                <h2>Транзакции</h2>
            </div>
            <div id="transactions-list">
                <div class="loading">Загрузка...</div>
            </div>
        </div>
    </div>

    <script>
        function formatMoney(amount) {
            return new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB'
            }).format(amount);
        }

        function formatDate(dateString) {
            return new Date(dateString).toLocaleDateString('ru-RU');
        }

        async function loadData() {
            try {
                const [statsResponse, transactionsResponse] = await Promise.all([
                    fetch('/api/stats'),
                    fetch('/api/transactions')
                ]);

                const stats = await statsResponse.json();
                const transactions = await transactionsResponse.json();

                // Обновляем статистику
                document.getElementById('income').textContent = formatMoney(stats.total_income);
                document.getElementById('expense').textContent = formatMoney(stats.total_expense);
                document.getElementById('balance').textContent = formatMoney(stats.balance);
                document.getElementById('count').textContent = stats.transactions_count;

                // Обновляем список транзакций
                const listElement = document.getElementById('transactions-list');
                if (transactions.length === 0) {
                    listElement.innerHTML = '<div class="loading">Нет транзакций</div>';
                } else {
                    listElement.innerHTML = transactions.map(t => `
                        <div class="transaction-item">
                            <div class="transaction-info">
                                <h4>${t.title}</h4>
                                <p>${formatDate(t.date)}</p>
                                ${t.description ? `<p>${t.description}</p>` : ''}
                            </div>
                            <div class="transaction-amount ${t.type}">
                                ${t.type === 'income' ? '+' : '-'}${formatMoney(t.amount)}
                            </div>
                        </div>
                    `).join('');
                }
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
                document.getElementById('transactions-list').innerHTML = 
                    '<div class="loading">Ошибка загрузки данных</div>';
            }
        }

        async function initDemo() {
            try {
                await fetch('/api/init-demo', { method: 'POST' });
                await loadData();
                alert('Демо данные созданы!');
            } catch (error) {
                alert('Ошибка создания демо данных');
            }
        }

        // Загружаем данные при загрузке страницы
        document.addEventListener('DOMContentLoaded', loadData);
    </script>
</body>
</html>
EOF

chown -R www-data:www-data /var/www/html

# 7. Создание systemd сервиса
echo "7. Создание сервиса..."
cat > /etc/systemd/system/finio.service << EOF
[Unit]
Description=Finio API
After=network.target

[Service]
Type=simple
User=finio
Group=finio
WorkingDirectory=$PROJECT_DIR/backend
Environment=PATH=$PROJECT_DIR/backend/venv/bin
ExecStart=$PROJECT_DIR/backend/venv/bin/python main.py
Restart=always
RestartSec=3
StandardOutput=append:/var/log/finio/app.log
StandardError=append:/var/log/finio/error.log

[Install]
WantedBy=multi-user.target
EOF

# 8. Настройка Nginx
echo "8. Настройка Nginx..."
cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    root /var/www/html;
    index index.html;
    
    server_name _;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        proxy_set_header Host $host;
    }
    
    location /bot-webhook/ {
        proxy_pass http://127.0.0.1:8000/bot-webhook/;
        proxy_set_header Host $host;
    }
}
EOF

# 9. Запуск сервисов
echo "9. Запуск сервисов..."
systemctl daemon-reload
systemctl enable finio
systemctl start finio
systemctl restart nginx

# 10. Проверка
echo "10. Проверка..."
sleep 10

echo ""
echo "=== РЕЗУЛЬТАТЫ ПРОВЕРКИ ==="

if systemctl is-active --quiet finio; then
    echo "✅ Finio сервис: РАБОТАЕТ"
else
    echo "❌ Finio сервис: НЕ РАБОТАЕТ"
    journalctl -u finio -n 5 --no-pager
fi

if systemctl is-active --quiet nginx; then
    echo "✅ Nginx: РАБОТАЕТ"
else
    echo "❌ Nginx: НЕ РАБОТАЕТ"
fi

if curl -f -s http://localhost:8000/health >/dev/null 2>&1; then
    echo "✅ API: ОТВЕЧАЕТ"
else
    echo "❌ API: НЕ ОТВЕЧАЕТ"
fi

if curl -f -s http://localhost/ >/dev/null 2>&1; then
    echo "✅ Frontend: ДОСТУПЕН"
else
    echo "❌ Frontend: НЕДОСТУПЕН"
fi

echo ""
echo "🎉 УСТАНОВКА ЗАВЕРШЕНА!"
echo ""
echo "🌐 Откройте в браузере: http://$DOMAIN"
echo "🔧 API документация: http://$DOMAIN/api"
echo "❤️ Проверка здоровья: http://$DOMAIN/health"
echo ""
echo "📊 Мониторинг:"
echo "   sudo systemctl status finio"
echo "   sudo journalctl -u finio -f"
echo ""
echo "🎯 Готово для верстки фронтенда!"