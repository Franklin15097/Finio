// Finio Frontend App
const API_BASE = window.location.origin;

class FinioApp {
    constructor() {
        this.tg = null;
        this.user = null;
        this.currentUserId = 1;
        this.init();
    }

    init() {
        // Инициализация Telegram WebApp
        if (window.Telegram && window.Telegram.WebApp) {
            this.tg = window.Telegram.WebApp;
            this.setupTelegramWebApp();
        }

        // Загрузка данных
        this.loadData();
    }

    setupTelegramWebApp() {
        this.tg.ready();
        this.tg.expand();
        this.tg.setHeaderColor('#2481cc');
        this.tg.setBackgroundColor('#ffffff');

        // Получение данных пользователя
        if (this.tg.initDataUnsafe && this.tg.initDataUnsafe.user) {
            this.user = this.tg.initDataUnsafe.user;
            document.getElementById('user-info').textContent = `Привет, ${this.user.first_name}! 👋`;
        }

        // Настройка главной кнопки
        this.tg.MainButton.setText('🔄 Обновить данные');
        this.tg.MainButton.onClick(() => this.loadData());
        this.tg.MainButton.show();
    }

    async loadData() {
        try {
            this.showLoading();
            this.hideError();

            // Аутентификация через Telegram
            if (this.user && this.user.id) {
                await this.authenticateUser();
            } else {
                // Инициализация демо данных для веб-версии
                await this.initDemoData();
            }

            // Загрузка статистики и транзакций
            await Promise.all([
                this.loadStats(),
                this.loadTransactions()
            ]);

            this.hideLoading();
            this.showData();

            // Обновление главной кнопки
            if (this.tg && this.tg.MainButton) {
                this.tg.MainButton.setText('✅ Обновлено');
                setTimeout(() => {
                    this.tg.MainButton.setText('🔄 Обновить данные');
                }, 2000);
            }

        } catch (error) {
            console.error('Ошибка загрузки:', error);
            this.showError('Ошибка загрузки данных: ' + error.message);
            this.hideLoading();

            if (this.tg && this.tg.showAlert) {
                this.tg.showAlert('Ошибка: ' + error.message);
            }
        }
    }

    async authenticateUser() {
        try {
            const response = await fetch(`${API_BASE}/api/auth/telegram`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegram_id: this.user.id.toString(),
                    first_name: this.user.first_name,
                    last_name: this.user.last_name || '',
                    username: this.user.username || ''
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            this.currentUserId = data.user_id;
        } catch (error) {
            console.error('Ошибка аутентификации:', error);
            // Продолжаем с демо данными
        }
    }

    async initDemoData() {
        try {
            const response = await fetch(`${API_BASE}/api/init-demo-data`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            this.currentUserId = data.user_id || 1;
        } catch (error) {
            console.error('Ошибка инициализации демо данных:', error);
        }
    }

    async loadStats() {
        const response = await fetch(`${API_BASE}/api/users/${this.currentUserId}/stats`);
        
        if (!response.ok) {
            throw new Error(`Ошибка загрузки статистики: HTTP ${response.status}`);
        }

        const stats = await response.json();
        this.displayStats(stats);
    }

    async loadTransactions() {
        const response = await fetch(`${API_BASE}/api/users/${this.currentUserId}/transactions`);
        
        if (!response.ok) {
            throw new Error(`Ошибка загрузки транзакций: HTTP ${response.status}`);
        }

        const transactions = await response.json();
        this.displayTransactions(transactions);
    }

    displayStats(stats) {
        document.getElementById('income').textContent = this.formatAmount(stats.total_income);
        document.getElementById('expense').textContent = this.formatAmount(stats.total_expense);
        document.getElementById('balance').textContent = this.formatAmount(stats.balance);
        document.getElementById('count').textContent = stats.transactions_count;

        // Цвет баланса
        const balanceEl = document.getElementById('balance');
        balanceEl.className = `value ${stats.balance >= 0 ? 'income' : 'expense'}`;
    }

    displayTransactions(transactions) {
        const container = document.getElementById('transactions-list');
        
        if (transactions.length === 0) {
            container.innerHTML = '<div class="loading">Нет операций</div>';
            return;
        }

        container.innerHTML = transactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <h4>${this.escapeHtml(transaction.title)}</h4>
                    <p>${this.formatDate(transaction.date)}</p>
                    ${transaction.description ? `<p>${this.escapeHtml(transaction.description)}</p>` : ''}
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${this.formatAmount(transaction.amount)}
                </div>
            </div>
        `).join('');
    }

    formatAmount(amount) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB'
        }).format(amount);
    }

    formatDate(dateString) {
        if (!dateString) return 'Сегодня';
        return new Date(dateString).toLocaleDateString('ru-RU');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showData() {
        document.getElementById('stats').style.display = 'grid';
        document.getElementById('transactions').style.display = 'block';
    }

    showError(message) {
        const errorEl = document.getElementById('error');
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }

    hideError() {
        document.getElementById('error').style.display = 'none';
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    new FinioApp();
});