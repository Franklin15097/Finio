document.addEventListener('DOMContentLoaded', () => {
    const assetForm = document.getElementById('assetForm');
    const ruleForm = document.getElementById('ruleForm');
    const assetsGrid = document.getElementById('assets-grid');
    const rulesList = document.getElementById('rules-list');

    // API Paths
    const API_ASSETS = 'backend/api/assets';
    const API_SAVINGS = 'backend/api/savings';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    };

    let assets = [];
    let rules = [];
    let savingsChart;

    // --- Assets Logic ---
    async function loadAssets() {
        try {
            // Fetch everything we need in parallel
            const [assetsRes, rulesRes, incomeRes] = await Promise.all([
                fetch(`${API_ASSETS}/read.php`, { headers }),
                fetch(`${API_SAVINGS}/rules.php`, { headers }),
                fetch('backend/api/statistics/total_income.php', { headers })
            ]);

            assets = await assetsRes.json();
            rules = await rulesRes.json();
            const incomeData = await incomeRes.json();
            const totalIncome = parseFloat(incomeData.total_income || 0);

            renderAssets(totalIncome);
            updateTotalCapital();
            updateRuleAssetSelect();
            renderSavingsAnalysis(totalIncome);
        } catch (err) {
            console.error('Load Assets Error:', err);
        }
    }

    function renderAssets(totalIncome = 0) {
        assetsGrid.innerHTML = '';

        if (assets.length === 0) {
            assetsGrid.innerHTML = '<p style="text-align:center; color:var(--text-secondary); padding:40px;">Нет счетов. Добавьте первый!</p>';
            return;
        }

        assets.forEach((asset, index) => {
            // Find rule for this asset to calc Plan
            const rule = rules.find(r => r.asset_id == asset.id);
            const expected = rule ? (totalIncome * (rule.percentage / 100)) : 0;
            const actual = parseFloat(asset.balance);

            // Progress bar calc
            const progress = expected > 0 ? Math.min((actual / expected) * 100, 100) : 0;
            const progressColor = actual >= expected ? 'var(--success)' : 'var(--warning)';

            const card = document.createElement('div');
            card.className = 'card animate-scale-in';
            card.style.animationDelay = `${index * 0.1}s`;

            card.innerHTML = `
                <div class="flex justify-between items-center mb-4">
                    <h3 style="font-size:1.2rem; font-weight:600;">${asset.name}</h3>
                    <span style="font-size:0.8rem; padding:4px 10px; background:rgba(255,255,255,0.05); border-radius:12px; border: 1px solid var(--border-color);">${translateType(asset.type)}</span>
                </div>
                
                <div class="flex justify-between mb-2">
                    <div style="text-align:left">
                        <div style="font-size:0.8rem; color:var(--text-secondary);">Факт (Сейчас)</div>
                        <div style="font-size:1.4rem; font-weight:700; color:var(--text-primary);">₽ ${actual.toLocaleString('ru-RU')}</div>
                    </div>
                    ${expected > 0 ? `
                    <div style="text-align:right">
                        <div style="font-size:0.8rem; color:var(--text-secondary);">План (${rule.percentage}%)</div>
                        <div style="font-size:1.4rem; font-weight:700; color:var(--primary-accent);">₽ ${expected.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}</div>
                    </div>
                    ` : ''}
                </div>

                ${expected > 0 ? `
                <div style="width:100%; height:6px; background:var(--secondary-bg); border-radius:3px; margin-bottom:15px; overflow:hidden;">
                    <div style="width:${progress}%; height:100%; background:${progressColor}; transition:width 1s ease;"></div>
                </div>
                ` : '<div style="margin-bottom:20px;"></div>'}

                <div class="flex justify-between">
                    <button class="action-btn" onclick='editAsset(${JSON.stringify(asset)})'>✏️ Ред.</button>
                    <button class="action-btn delete" onclick="deleteAsset(${asset.id})">🗑️ Удалить</button>
                </div>
            `;
            assetsGrid.appendChild(card);
        });
    }

    function translateType(type) {
        const types = { 'card': 'Карта', 'cash': 'Наличные', 'deposit': 'Вклад', 'investment': 'Инвестиции' };
        return types[type] || type;
    }

    function updateTotalCapital() {
        const total = assets.reduce((sum, a) => sum + parseFloat(a.balance), 0);
        document.getElementById('total-capital').textContent = `₽ ${total.toLocaleString('ru-RU')}`;
    }

    if (assetForm) {
        assetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(assetForm);
            const data = Object.fromEntries(formData.entries());
            const id = document.getElementById('asset_id').value;
            const url = id ? `${API_ASSETS}/update.php` : `${API_ASSETS}/create.php`;

            if (id) data.id = id;

            try {
                await fetch(url, { method: 'POST', headers, body: JSON.stringify(data) });
                toast.success(id ? 'Счет обновлен' : 'Счет создан');
                closeAssetModal();
                loadAssets();
            } catch (err) {
                console.error('Save Asset Error:', err);
                toast.error('Ошибка при сохранении счета');
            }
        });
    }

    window.editAsset = (asset) => {
        document.getElementById('assetModalTitle').textContent = "Редактировать счет";
        document.getElementById('asset_id').value = asset.id;
        document.getElementById('asset_name').value = asset.name;
        document.getElementById('asset_balance').value = asset.balance;
        document.getElementById('asset_type').value = asset.type;
        document.getElementById('assetModal').style.display = 'block';
    };

    window.deleteAsset = async (id) => {
        // Custom confirm dialog
        const confirmed = await showConfirm('Удалить счет?', 'Это действие нельзя отменить');
        if (!confirmed) return;

        try {
            await fetch(`${API_ASSETS}/delete.php`, { method: 'POST', headers, body: JSON.stringify({ id }) });
            toast.success('Счет успешно удален');
            loadAssets();
            loadRules();
        } catch (err) {
            console.error('Delete Asset Error:', err);
            toast.error('Ошибка при удалении счета');
        }
    };

    // --- Rules Logic ---
    async function loadRules() {
        try {
            const res = await fetch(`${API_SAVINGS}/rules.php`, { headers });
            rules = await res.json();
            renderRules();

            // Reload assets to update Plan/Fact display
            const incomeRes = await fetch('backend/api/statistics/total_income.php', { headers });
            const incomeData = await incomeRes.json();
            const totalIncome = parseFloat(incomeData.total_income || 0);
            renderAssets(totalIncome);
            renderSavingsAnalysis(totalIncome);
        } catch (err) {
            console.error('Load Rules Error:', err);
        }
    }

    function renderRules() {
        rulesList.innerHTML = '';

        if (rules.length === 0) {
            rulesList.innerHTML = '<p style="text-align:center; color:var(--text-secondary); padding:20px;">Нет правил накоплений</p>';
            return;
        }

        rules.forEach(rule => {
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center mb-2 p-2';
            li.style.borderBottom = '1px solid var(--border-color)';
            li.innerHTML = `
                <span><b>${rule.percentage}%</b> от дохода → <b>${rule.asset_name}</b></span>
                <button class="action-btn delete" onclick="deleteRule(${rule.id})">×</button>
            `;
            rulesList.appendChild(li);
        });
    }

    if (ruleForm) {
        ruleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(ruleForm);
            const data = Object.fromEntries(formData.entries());

            try {
                await fetch(`${API_SAVINGS}/rules.php`, { method: 'POST', headers, body: JSON.stringify(data) });
                toast.success('Правило накопления создано');
                closeRuleModal();
                loadRules();
            } catch (err) {
                console.error('Save Rule Error:', err);
                toast.error('Ошибка при создании правила');
            }
        });
    }

    window.deleteRule = async (id) => {
        const confirmed = await showConfirm('Удалить правило?', 'Правило накопления будет удалено');
        if (!confirmed) return;

        try {
            await fetch(`${API_SAVINGS}/rules.php`, { method: 'POST', headers, body: JSON.stringify({ id, action: 'delete' }) });
            toast.success('Правило удалено');
            loadRules();
        } catch (err) {
            console.error('Delete Rule Error:', err);
            toast.error('Ошибка при удалении правила');
        }
    };

    function updateRuleAssetSelect() {
        const select = document.getElementById('rule_asset_id');
        if (!select) return;

        select.innerHTML = '';
        assets.forEach(a => {
            const opt = document.createElement('option');
            opt.value = a.id;
            opt.textContent = a.name;
            select.appendChild(opt);
        });
    }

    // --- Savings Analysis Chart ---
    function renderSavingsAnalysis(totalIncome) {
        const ctx = document.getElementById('savingsChart');
        if (!ctx) return;

        // Calculate expectations per asset
        let chartLabels = [];
        let expectedData = [];
        let actualData = [];

        // Group by asset
        const assetAnalysis = {};

        // Init actuals
        assets.forEach(a => {
            assetAnalysis[a.id] = { expected: 0, actual: parseFloat(a.balance), name: a.name };
        });

        // Calc expected
        rules.forEach(rule => {
            if (assetAnalysis[rule.asset_id]) {
                const expected = totalIncome * (rule.percentage / 100);
                assetAnalysis[rule.asset_id].expected += expected;
            }
        });

        // Only show assets involved in rules or with money
        Object.keys(assetAnalysis).forEach(id => {
            const item = assetAnalysis[id];
            if (item.expected > 0 || item.actual > 0) {
                chartLabels.push(item.name);
                expectedData.push(item.expected);
                actualData.push(item.actual);
            }
        });

        if (savingsChart) savingsChart.destroy();

        savingsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [
                    {
                        label: 'Факт (Есть сейчас)',
                        data: actualData,
                        backgroundColor: '#34D399'
                    },
                    {
                        label: 'План (Должно быть)',
                        data: expectedData,
                        backgroundColor: '#2DD4BF'
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#27272a' },
                        ticks: { color: '#a1a1aa' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#a1a1aa' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    }
                }
            }
        });
    }

    // Modal Helpers
    window.openAssetModal = () => {
        document.getElementById('assetForm').reset();
        document.getElementById('asset_id').value = '';
        document.getElementById('assetModalTitle').textContent = "Новый счет";
        document.getElementById('assetModal').style.display = 'block';
    };

    window.closeAssetModal = () => {
        document.getElementById('assetModal').style.display = 'none';
    };

    window.openRuleModal = () => {
        document.getElementById('ruleForm').reset();
        updateRuleAssetSelect();
        document.getElementById('ruleModal').style.display = 'block';
    };

    window.closeRuleModal = () => {
        document.getElementById('ruleModal').style.display = 'none';
    };

    // Init
    loadAssets();
    loadRules();
});
