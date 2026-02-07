// UI Helper functions
function openTransactionModal(data = null) {
    const modal = document.getElementById('transactionModal');
    const form = document.getElementById('transactionForm');
    const title = document.getElementById('modalTitle');

    if (data) {
        // Edit mode
        title.textContent = 'Редактировать транзакцию';
        document.getElementById('trans_id').value = data.id;
        document.getElementById('amount').value = data.amount;
        document.getElementById('title').value = data.title;
        document.getElementById('date').value = data.transaction_date;
        document.querySelector(`input[name="type"][value="${data.type}"]`).checked = true;
        document.getElementById('category').value = data.category_id || "";
    } else {
        // Create mode
        title.textContent = 'Новая транзакция';
        form.reset();
        document.getElementById('trans_id').value = '';
        document.getElementById('date').valueAsDate = new Date();
    }

    modal.style.display = 'block';
}

function closeTransactionModal() {
    document.getElementById('transactionModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('transactionModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}
