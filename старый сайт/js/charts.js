document.addEventListener('DOMContentLoaded', () => {
    const mainCtx = document.getElementById('mainChart');
    const categoriesCtx = document.getElementById('categoriesChart');

    // Only init if elements exist
    if (!mainCtx || !categoriesCtx) return;

    const token = localStorage.getItem('auth_token');
    const headers = {
        'Authorization': `Bearer ${token}`
    };

    const API_STATS = 'backend/api/statistics';

    // Global defaults for Chart.js
    Chart.defaults.color = '#94A3B8';
    Chart.defaults.borderColor = '#334155';

    let mainChart, categoriesChart;

    async function loadChartData() {
        try {
            const [timelineRes, categoriesRes] = await Promise.all([
                fetch(`${API_STATS}/timeline.php`, { headers }),
                fetch(`${API_STATS}/categories.php`, { headers })
            ]);

            const timelineData = await timelineRes.json();
            const categoriesData = await categoriesRes.json();

            renderMainChart(timelineData);
            renderCategoriesChart(categoriesData);

        } catch (error) {
            console.error("Error loading charts:", error);
        }
    }

    function renderMainChart(data) {
        if (mainChart) mainChart.destroy();

        mainChart = new Chart(mainCtx, {
            type: 'line',
            data: {
                labels: data.labels, // ['Jan', 'Feb', ...]
                datasets: [{
                    label: 'Доходы',
                    data: data.income,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Расходы',
                    data: data.expense,
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#334155' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }

    function renderCategoriesChart(data) {
        if (categoriesChart) categoriesChart.destroy();

        categoriesChart = new Chart(categoriesCtx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { boxWidth: 12 }
                    }
                }
            }
        });
    }

    // Initial Load
    loadChartData();
});
