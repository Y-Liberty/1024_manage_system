// 财务数据存储
let transactions = [];

// 初始化数据
function initializeData() {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
    } else {
        // 示例数据
        transactions = [
            {
                id: 1,
                date: '2024-01-15',
                type: '收入',
                amount: 3000.00,
                category: '学费',
                note: '张三一季度学费'
            },
            {
                id: 2,
                date: '2024-01-20',
                type: '支出',
                amount: 5000.00,
                category: '工资',
                note: '教师工资发放'
            }
        ];
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }
    updateFinanceTable();
    updateStats();
}

// 更新财务统计
function updateStats() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // 计算本月收支
    const monthlyTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getFullYear() === currentYear && 
               transactionDate.getMonth() === currentMonth;
    });

    const monthlyIncome = monthlyTransactions
        .filter(t => t.type === '收入')
        .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpense = monthlyTransactions
        .filter(t => t.type === '支出')
        .reduce((sum, t) => sum + t.amount, 0);

    // 计算总余额
    const totalBalance = transactions.reduce((balance, transaction) => {
        return balance + (transaction.type === '收入' ? transaction.amount : -transaction.amount);
    }, 0);

    // 更新显示
    document.getElementById('monthlyIncome').textContent = `¥${monthlyIncome.toFixed(2)}`;
    document.getElementById('monthlyExpense').textContent = `¥${monthlyExpense.toFixed(2)}`;
    document.getElementById('totalBalance').textContent = `¥${totalBalance.toFixed(2)}`;
}

// 更新财务记录表格
function updateFinanceTable(filteredTransactions = transactions) {
    const tableBody = document.getElementById('financeTableBody');
    tableBody.innerHTML = '';

    // 按日期降序排序
    const sortedTransactions = [...filteredTransactions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

    sortedTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.type}</td>
            <td class="amount ${transaction.type === '收入' ? 'income' : 'expense'}">
                ¥${transaction.amount.toFixed(2)}
            </td>
            <td>${transaction.category}</td>
            <td>${transaction.note || ''}</td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="editTransaction(${transaction.id})">
                    <i class="fas fa-edit"></i> 编辑
                </button>
                <button class="btn-delete" onclick="deleteTransaction(${transaction.id})">
                    <i class="fas fa-trash"></i> 删除
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// 搜索和筛选功能
function filterTransactions() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value;
    const monthFilter = document.getElementById('monthFilter').value;

    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = transaction.note.toLowerCase().includes(searchTerm);
        const matchesType = !typeFilter || transaction.type === typeFilter;
        const matchesMonth = !monthFilter || transaction.date.startsWith(monthFilter);
        return matchesSearch && matchesType && matchesMonth;
    });

    updateFinanceTable(filteredTransactions);
}

// 添加新交易记录
function addTransaction(transactionData) {
    const newTransaction = {
        ...transactionData,
        id: Date.now(),
        amount: parseFloat(transactionData.amount)
    };
    transactions.push(newTransaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateFinanceTable();
    updateStats();
}

// 显示模态框
function showModal(title = '添加收支记录') {
    const modal = document.getElementById('transactionModal');
    const modalTitle = modal.querySelector('.modal-header h3');
    modalTitle.textContent = title;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // 防止背景滚动
}

// 隐藏模态框
function hideModal() {
    const modal = document.getElementById('transactionModal');
    modal.classList.remove('show');
    document.body.style.overflow = ''; // 恢复背景滚动
    document.getElementById('transactionForm').reset();
}

// 编辑交易记录
window.editTransaction = function(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
        const form = document.getElementById('transactionForm');

        // 填充表单数据
        document.getElementById('transactionDate').value = transaction.date;
        document.getElementById('transactionType').value = transaction.type;
        document.getElementById('transactionAmount').value = transaction.amount;
        document.getElementById('transactionCategory').value = transaction.category;
        document.getElementById('transactionNote').value = transaction.note || '';

        // 显示模态框
        showModal('编辑收支记录');

        // 更新表单提交处理
        form.onsubmit = (e) => {
            e.preventDefault();
            const updatedTransaction = {
                id: transaction.id,
                date: document.getElementById('transactionDate').value,
                type: document.getElementById('transactionType').value,
                amount: parseFloat(document.getElementById('transactionAmount').value),
                category: document.getElementById('transactionCategory').value,
                note: document.getElementById('transactionNote').value.trim()
            };

            // 更新数据
            const index = transactions.findIndex(t => t.id === transactionId);
            transactions[index] = updatedTransaction;
            localStorage.setItem('transactions', JSON.stringify(transactions));
            
            // 更新显示并关闭模态框
            updateFinanceTable();
            updateStats();
            hideModal();
        };
    }
};

// 删除交易记录
window.deleteTransaction = function(transactionId) {
    if (confirm('确定要删除这条记录吗？')) {
        transactions = transactions.filter(t => t.id !== transactionId);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        updateFinanceTable();
        updateStats();
    }
};

// 事件监听器设置
document.addEventListener('DOMContentLoaded', () => {
    initializeData();

    // 添加交易按钮点击事件
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    const form = document.getElementById('transactionForm');
    const closeBtn = document.querySelector('.close-btn');
    const cancelBtn = document.getElementById('cancelBtn');

    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0];

    addTransactionBtn.onclick = () => {
        document.getElementById('transactionDate').value = today;
        showModal();
        form.reset();

        // 设置表单提交处理
        form.onsubmit = (e) => {
            e.preventDefault();
            const newTransaction = {
                date: document.getElementById('transactionDate').value,
                type: document.getElementById('transactionType').value,
                amount: parseFloat(document.getElementById('transactionAmount').value),
                category: document.getElementById('transactionCategory').value,
                note: document.getElementById('transactionNote').value.trim()
            };
            addTransaction(newTransaction);
            hideModal();
        };
    };

    // 关闭模态框
    closeBtn.onclick = hideModal;
    cancelBtn.onclick = hideModal;

    // 点击模态框外部关闭
    window.onclick = (event) => {
        const modal = document.getElementById('transactionModal');
        if (event.target === modal) {
            hideModal();
        }
    };

    // 搜索和筛选事件监听
    document.getElementById('searchInput').addEventListener('input', filterTransactions);
    document.getElementById('typeFilter').addEventListener('change', filterTransactions);
    document.getElementById('monthFilter').addEventListener('change', filterTransactions);
}); 