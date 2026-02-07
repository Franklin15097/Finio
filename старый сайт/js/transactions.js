document.addEventListener('DOMContentLoaded', () => {
    const transactionForm = document.getElementById('transactionForm');
    const transactionsList = document.getElementById('transactions-list');

    // API Paths
    const API_URL = 'backend/api/transactions';
    const API_RECURRING = 'backend/api/expenses/recurring.php';
    const STATS_URL = 'backend/api/statistics';

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // Global State
    let currentFilterType = null;

    // --- Init ---
    // Check URL params for Income/Expense view
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type');

    // --- Strict Mode Logic ---
    function setPageMode(type) {
        const topGrid = document.getElementById('top-section');
        const recurringBlock = document.getElementById('recurring-block');
        const pageTitle = document.getElementById('page-title');
        const chartTitle = document.getElementById('chart-title');

        // Reset state
        if (topGrid) topGrid.classList.remove('split');
        if (recurringBlock) {
            recurringBlock.style.display = 'none';
            recurringBlock.classList.remove('animate-fade-in');
        }

        if (type === 'income') {
            document.querySelector('#nav-income').classList.add('active');
            document.querySelector('#nav-expense').classList.remove('active');
            if (pageTitle) pageTitle.textContent = 'Доходы';
            if (chartTitle) chartTitle.textContent = 'Динамика доходов';

            // Strict Filter
            currentFilterType = 'income';

            // Modal: Lock to Income
            window.openTransactionModal = () => {
                document.getElementById('transactionModal').style.display = 'block';
                setTransactionModalType('income');
            };

        } else if (type === 'expense') {
            document.querySelector('#nav-expense').classList.add('active');
            document.querySelector('#nav-income').classList.remove('active');
            if (pageTitle) pageTitle.textContent = 'Расходы';
            if (chartTitle) chartTitle.textContent = 'Динамика расходов';

            // Layout Split for Recurring
            if (topGrid) topGrid.classList.add('split');
            if (recurringBlock) {
                recurringBlock.style.display = 'block';
                recurringBlock.classList.add('animate-fade-in');
                loadRecurringExpenses();
            }

            // Strict Filter
            currentFilterType = 'expense';

            // Modal: Lock to Expense
            window.openTransactionModal = () => {
                document.getElementById('transactionModal').style.display = 'block';
                setTransactionModalType('expense');
            };
        }

        // Load initial data
        loadTransactions();
        loadChartData();
    }

    // Auto-init based on URL
    if (typeParam) {
        setPageMode(typeParam);
    } else {
        loadTransactions();
        loadChartData();
    }
    // We don't load generic stats here anymore, as we have specific views

    // --- Event Listeners ---
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.addEventListener('input', debounce(loadTransactions, 500));

    const catFilter = document.getElementById('filter-category');
    if (catFilter) catFilter.addEventListener('change', loadTransactions);

    const dateFilter = document.getElementById('filter-date');
    if (dateFilter) dateFilter.addEventListener('change', loadTransactions);

    // Filter Helper
    window.filterTransactions = function (type) {
        currentFilterType = type;
        loadTransactions();
        loadChartData(); // Also update chart when filter changes
    };

    // --- Chart Data Independence ---
    async function loadChartData() {
        const periodSelect = document.getElementById('chart-period');
        const period = periodSelect ? periodSelect.value : 'month'; // month, year, all

        const params = new URLSearchParams();
        if (currentFilterType) params.append('type', currentFilterType);

        // Date Logic for Period
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');

        if (period === 'month') {
            params.append('date', `${year}-${month}`);
        } else if (period === 'year') {
            params.append('date', `${year}`);
        }
        // 'all' sends no date param, which means all records

        try {
            const res = await fetch(`${API_URL}/read.php?${params.toString()}`, { headers });
            const data = await res.json();
            const records = Array.isArray(data) ? data : (data.records || []);
            if (typeof renderTrendChart === 'function') {
                renderTrendChart(records);
            }
        } catch (e) {
            console.error('Chart Load Error', e);
        }
    }

    // Chart Period Listener
    const chartPeriodSelect = document.getElementById('chart-period');
    if (chartPeriodSelect) {
        chartPeriodSelect.addEventListener('change', () => loadChartData());
    }

    // --- Transactions CRUD ---
    async function loadTransactions() {
        if (!transactionsList) return;

        const search = searchInput ? searchInput.value : '';
        const category = catFilter ? catFilter.value : '';
        const date = dateFilter ? dateFilter.value : '';

        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category_id', category);
        if (date) params.append('date', date);
        if (currentFilterType) params.append('type', currentFilterType);

        try {
            const res = await fetch(`${API_URL}/read.php?${params.toString()}`, { headers });
            const data = await res.json();

            // Handle both array or { records: [] } format
            const records = Array.isArray(data) ? data : (data.records || []);

            renderTransactions(records);

            // Update Header Stat (Using List Data is correct for "Visible" total)
            const total = records.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
            const headerTotal = document.getElementById('header-total-amount');
            if (headerTotal) headerTotal.textContent = `₽ ${total.toLocaleString('ru-RU')}`;

            // NOTE: We do NOT update chart here anymore to keep it independent

        } catch (err) {
            console.error(err);
            transactionsList.innerHTML = '<tr><td colspan="4" class="text-center">Ошибка загрузки</td></tr>';
        }
    }

    function renderTransactions(transactions) {
        transactionsList.innerHTML = '';
        if (transactions.length === 0) {
            transactionsList.innerHTML = '<tr><td colspan="4" class="text-center text-secondary">Нет подтвержденных операций</td></tr>';
            return;
        }

        transactions.forEach(t => {
            const tr = document.createElement('tr');
            const amountClass = t.type === 'income' ? 'text-success' : 'text-danger';
            const sign = t.type === 'income' ? '+' : '-';

            tr.innerHTML = `
                <td>${t.transaction_date}</td>
                <td>${t.title}</td>
                <td class="${amountClass}" style="font-weight:600;">${sign} ₽ ${Math.abs(t.amount).toLocaleString('ru-RU')}</td>
                <td>
                    <button class="action-btn" onclick='editTransaction(${JSON.stringify(t)})'>✎</button>
                    <button class="action-btn delete" onclick="deleteTransaction(${t.id})">×</button>
                </td>
            `;
            transactionsList.appendChild(tr);
        });
    }

    // Modal Handling
    if (transactionForm) {
        transactionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(transactionForm);
            const data = Object.fromEntries(formData.entries());
            const id = document.getElementById('trans_id').value;
            const url = id ? `${API_URL}/update.php` : `${API_URL}/create.php`;
            if (id) data.id = id;

            try {
                const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(data) });
                const result = await res.json();

                if (res.ok) {
                    toast.success(id ? 'Обновлено' : 'Создано');
                    closeTransactionModal();
                    loadTransactions();
                } else {
                    toast.error(result.error || 'Ошибка');
                }
            } catch (err) {
                console.error(err);
                toast.error('Ошибка сети');
            }
        });
    }

    window.editTransaction = (t) => openTransactionModal(t);

    window.deleteTransaction = async (id) => {
        if (!await showConfirm('Удалить?', 'Это действие нельзя отменить')) return;

        try {
            const res = await fetch(`${API_URL}/delete.php`, { method: 'POST', headers, body: JSON.stringify({ id }) });
            if (res.ok) {
                toast.success('Удалено');
                loadTransactions();
            } else {
                toast.error('Ошибка удаления');
            }
        } catch (err) {
            toast.error('Ошибка сети');
        }
    };

    function setTransactionModalType(type) {
        const radios = document.querySelectorAll('#transactionForm input[name="type"]');
        radios.forEach(r => {
            if (r.value === type) r.checked = true;
            // Hide the parent label if we want strict mode, or just disable
            // User requested: "In Income I want to specify/count incomes." suggesting strictly income.
            r.parentElement.style.display = (type && r.value !== type) ? 'none' : 'block';
        });
        // Trigger change event to filter categories
        const checked = document.querySelector('#transactionForm input[name="type"]:checked');
        if (checked) checked.dispatchEvent(new Event('change'));
    }

    async function loadRecurringExpenses() {
        try {
            const res = await fetch(API_RECURRING, { headers });
            if (!res.ok) return;

            const items = await res.json();
            const list = document.getElementById('recurring-list');
            list.innerHTML = '';

            let totalMonth = 0;

            items.forEach(item => {
                const amount = parseFloat(item.amount);
                const yearAmount = amount * 12;
                totalMonth += amount;

                const div = document.createElement('div');
                div.className = 'flex justify-between items-center p-3';
                div.style.background = 'rgba(255,255,255,0.03)';
                div.style.borderRadius = '8px';
                div.innerHTML = `
                    <div style="min-width:0;">
                        <span style="display:block; font-weight:500;">${item.title}</span>
                        <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">
                             <span>${amount.toLocaleString('ru-RU')} ₽/мес</span> • 
                             <span>${yearAmount.toLocaleString('ru-RU')} ₽/год</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                         <button class="action-btn" onclick='editRecurring(${JSON.stringify(item)})'>✎</button>
                         <button class="action-btn delete" onclick="deleteRecurring(${item.id})">×</button>
                    </div>
                `;
                list.appendChild(div);
            });

            document.getElementById('recurring-total-month').textContent = `₽ ${totalMonth.toLocaleString('ru-RU')}`;
            document.getElementById('recurring-total-year').textContent = `₽ ${(totalMonth * 12).toLocaleString('ru-RU')}`;

        } catch (err) { console.error('Recurring fetch error:', err); }
    }

    if (recurringForm) {
        recurringForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(recurringForm);
            const data = Object.fromEntries(formData.entries());
            // Check if hidden ID exists (adding it dynamically or via hidden input)
            const idInput = recurringForm.querySelector('input[name="id"]');
            if (idInput && idInput.value) {
                data.id = idInput.value;
            }

            try {
                const res = await fetch(API_RECURRING, { method: 'POST', headers, body: JSON.stringify(data) });
                const result = await res.json();

                if (res.ok) {
                    toast.success(data.id ? 'Обновлено' : 'Добавлено');
                    closeRecurringModal();
                    loadRecurringExpenses();
                } else {
                    toast.error(result.details || result.error || 'Ошибка сохранения');
                    console.error('Server Error:', result);
                }
            } catch (err) { toast.error('Ошибка сети: ' + err.message); }
        });
    }

    window.editRecurring = (item) => {
        const form = document.getElementById('recurringForm');
        // Reset form
        form.reset();

        // Populate
        form.querySelector('input[name="title"]').value = item.title;
        form.querySelector('input[name="amount"]').value = item.amount;

        // Handle ID
        let idInput = form.querySelector('input[name="id"]');
        if (!idInput) {
            idInput = document.createElement('input');
            idInput.type = 'hidden';
            idInput.name = 'id';
            form.appendChild(idInput);
        }
        idInput.value = item.id;

        // Change Title
        const title = document.querySelector('#recurringModal h2');
        if (title) title.textContent = 'Редактировать платеж';

        // Show Button text
        const btn = form.querySelector('button[type="submit"]');
        if (btn) btn.textContent = 'Сохранить';

        document.getElementById('recurringModal').style.display = 'block';
    };

    window.deleteRecurring = async (id) => {
        if (!await showConfirm('Удалить?', 'Удалить обязательный платеж?')) return;
        try {
            await fetch(API_RECURRING, { method: 'POST', headers, body: JSON.stringify({ id, action: 'delete' }) });
            loadRecurringExpenses();
        } catch (err) { toast.error('Ошибка'); }
    };

    window.openRecurringModal = () => {
        const form = document.getElementById('recurringForm');
        form.reset();
        const idInput = form.querySelector('input[name="id"]');
        if (idInput) idInput.value = ''; // Clear ID

        const title = document.querySelector('#recurringModal h2');
        if (title) title.textContent = 'Ежемесячный платеж';
        const btn = form.querySelector('button[type="submit"]');
        if (btn) btn.textContent = 'Добавить';

        document.getElementById('recurringModal').style.display = 'block';
    };
    window.closeRecurringModal = () => document.getElementById('recurringModal').style.display = 'none';

    // Helpers
    function debounce(func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }

    // --- Category Creation Logic ---
    window.openCategoryModal = () => document.getElementById('categoryModal').style.display = 'block';
    window.closeCategoryModal = () => document.getElementById('categoryModal').style.display = 'none';

    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(categoryForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const res = await fetch('backend/api/categories/create.php', { method: 'POST', headers, body: JSON.stringify(data) });
                if (res.ok) {
                    toast.success('Категория создана');
                    closeCategoryModal();
                    loadCategories(); // Reload select boxes
                } else {
                    const err = await res.json();
                    toast.error(err.error || 'Ошибка');
                }
            } catch (err) { toast.error('Ошибка сети'); }
        });
    }

    // Load categories helper
    async function loadCategories() {
        try {
            const res = await fetch('backend/api/categories/read.php', { headers });
            const cats = await res.json();

            // Populate Create Category Type Lock
            if (currentFilterType) {
                const typeRadios = document.querySelectorAll('#categoryForm input[name="type"]');
                typeRadios.forEach(r => {
                    if (r.value === currentFilterType) r.checked = true;
                    r.parentElement.style.display = (r.value === currentFilterType) ? 'block' : 'none';
                });
            }

            // Populate Filter
            if (catFilter) {
                const currentVal = catFilter.value;
                catFilter.innerHTML = '<option value="">Все категории</option>';
                cats.forEach(c => {
                    if (currentFilterType && c.type !== currentFilterType) return; // Strict Filter
                    const opt = document.createElement('option');
                    opt.value = c.id;
                    opt.textContent = c.name;
                    catFilter.appendChild(opt);
                });
                catFilter.value = currentVal;
            }

            // Populate Transaction Modal Select
            const modalCat = document.getElementById('category');
            if (modalCat) {
                modalCat.innerHTML = '<option value="">Без категории</option>';
                // Add "Create New" option
                const createOpt = document.createElement('option');
                createOpt.value = 'NEW';
                createOpt.textContent = '+ Создать новую...';
                createOpt.style.fontWeight = 'bold';
                modalCat.appendChild(createOpt);

                cats.forEach(c => {
                    // Filter by modal type context if we want, but dynamic is better
                    // We will filter dynamically when Type radio changes in Transaction Modal
                    const opt = document.createElement('option');
                    opt.value = c.id;
                    opt.textContent = c.name;
                    opt.dataset.type = c.type; // Store type
                    modalCat.appendChild(opt);
                });

                // Handler for "Create New"
                modalCat.onchange = function () {
                    if (this.value === 'NEW') {
                        this.value = '';
                        openCategoryModal();
                    }
                };
            }
        } catch (e) { }
    }

    // Call loadCategories on init
    loadCategories();

    // Strict Type Locking for Transaction Modal
    const transTypeRadios = document.querySelectorAll('#transactionForm input[name="type"]');
    transTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            // Filter categories in modal based on selected type
            const selectedType = radio.value;
            const modalCat = document.getElementById('category');
            Array.from(modalCat.options).forEach(opt => {
                if (opt.value === 'NEW' || opt.value === '') {
                    opt.hidden = false;
                    return;
                }
                opt.hidden = (opt.dataset.type !== selectedType);
            });
            modalCat.value = ''; // Reset selection
        });
    });

    // --- Chart Logic ---
    let trendChartInstance = null;
    // (Listener moved up)

    function renderTrendChart(transactions) {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;

        // Filter Data based on chart period (Client Side for now, or we can use backend)
        // Since loadTransactions fetches filtered list, we might only have "Month" data if date filter is set.
        // But user wants Chart filter to be possibly different from List filter?
        // Limitation: Current implementation links list and chart data.
        // User asked: "Make chart filterable by month, all time, year".
        // To do this *properly* while List is separate, we need separate data. 
        // For this step, let's filter the *current* dataset if it's broad, or we simply rely on the fetch.
        // BETTER APPROACH: "loadTransactions" uses global filters. 
        // We really should just let the Chart filter drive the 'date' param passed to fetching if the user wants ONLY chart to change?
        // But the design implies one page context.
        // Let's assume Chart Filter applies to the view.

        // Visual Config
        const isIncome = currentFilterType === 'income';
        const color = isIncome ? '#34D399' : '#F87171'; // Green : Red
        const bg = isIncome ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)';

        // Ensure we strictly filter by current period logic if implemented client side
        // But let's just use what we have.

        // Group by Date
        const grouped = {};
        transactions.forEach(t => {
            const date = t.transaction_date.split(' ')[0]; // YYYY-MM-DD
            if (!grouped[date]) grouped[date] = 0;
            // Always absolute for chart height
            grouped[date] += Math.abs(parseFloat(t.amount));
        });

        const labels = Object.keys(grouped).sort();
        const data = labels.map(d => grouped[d]);

        if (trendChartInstance) trendChartInstance.destroy();

        trendChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels.map(l => new Date(l).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })),
                datasets: [{
                    label: 'Сумма (₽)',
                    data: data,
                    borderColor: color,
                    backgroundColor: bg,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4, // Smooth curves
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#18181b',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#27272A',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                            label: (ctx) => `₽ ${Number(ctx.raw).toLocaleString('ru-RU')}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false, drawBorder: false },
                        ticks: { color: '#71717A' }
                    },
                    y: {
                        grid: { color: '#27272A', borderDash: [5, 5], drawBorder: false },
                        ticks: { color: '#71717A', callback: (val) => '₽' + val }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
            }
        });
    }

    window.exportCSV = function () {
        const token = localStorage.getItem('auth_token');
        const params = new URLSearchParams();
        params.append('token', token);
        if (catFilter && catFilter.value) params.append('category_id', catFilter.value);
        if (dateFilter && dateFilter.value) params.append('date', dateFilter.value);
        window.location.href = `backend/api/reports/export.php?${params.toString()}`;
    };
});
