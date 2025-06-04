// 签到管理模块

// 初始化签到管理页面
function initializeAttendance() {
    // 加载签到数据
    loadAttendanceData();
    
    // 设置事件监听器
    setupEventListeners();
    
    // 更新统计数据
    updateAttendanceStats();
}

// 加载签到数据
function loadAttendanceData() {
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const today = new Date().toISOString().split('T')[0];
    
    // 获取今天的签到记录
    const attendanceRecords = JSON.parse(localStorage.getItem('attendance') || '{}');
    const todayRecords = attendanceRecords[today] || {};
    
    // 更新表格
    updateAttendanceTable(students, todayRecords);
}

// 更新签到表格
function updateAttendanceTable(students, records) {
    const tbody = document.getElementById('attendanceTableBody');
    tbody.innerHTML = '';
    
    students.forEach(student => {
        const record = records[student.id] || {};
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.course}</td>
            <td>${record.checkIn || '-'}</td>
            <td>${record.checkOut || '-'}</td>
            <td>
                <span class="status-badge ${getStatusClass(record)}">
                    ${getStatusText(record)}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary check-in-btn" data-id="${student.id}">
                    <i class="fas fa-sign-in-alt"></i> 签到
                </button>
                <button class="btn btn-sm btn-warning check-out-btn" data-id="${student.id}">
                    <i class="fas fa-sign-out-alt"></i> 签退
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// 获取状态样式类
function getStatusClass(record) {
    if (!record.checkIn) return 'status-absent';
    if (isLate(record.checkIn)) return 'status-late';
    return 'status-present';
}

// 获取状态文本
function getStatusText(record) {
    if (!record.checkIn) return '未签到';
    if (isLate(record.checkIn)) return '迟到';
    return '已签到';
}

// 判断是否迟到
function isLate(checkInTime) {
    const checkInHour = new Date(checkInTime).getHours();
    return checkInHour >= 9; // 9点之后算迟到
}

// 更新统计数据
function updateAttendanceStats() {
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const today = new Date().toISOString().split('T')[0];
    const attendanceRecords = JSON.parse(localStorage.getItem('attendance') || '{}');
    const todayRecords = attendanceRecords[today] || {};
    
    // 计算今日签到数
    const todayCount = Object.values(todayRecords).filter(record => record.checkIn).length;
    document.getElementById('todayAttendance').textContent = todayCount;
    
    // 计算本周签到率
    const weeklyRate = calculateWeeklyRate(attendanceRecords, students.length);
    document.getElementById('weeklyRate').textContent = `${weeklyRate}%`;
    
    // 计算本月平均签到率
    const monthlyRate = calculateMonthlyRate(attendanceRecords, students.length);
    document.getElementById('monthlyRate').textContent = `${monthlyRate}%`;
}

// 计算本周签到率
function calculateWeeklyRate(records, totalStudents) {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    let totalDays = 0;
    let totalAttendance = 0;
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        if (records[dateStr]) {
            totalDays++;
            totalAttendance += Object.values(records[dateStr]).filter(record => record.checkIn).length;
        }
    }
    
    return totalDays > 0 ? Math.round((totalAttendance / (totalStudents * totalDays)) * 100) : 0;
}

// 计算本月平均签到率
function calculateMonthlyRate(records, totalStudents) {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    let totalDays = 0;
    let totalAttendance = 0;
    
    for (let i = 0; i < today.getDate(); i++) {
        const date = new Date(monthStart);
        date.setDate(monthStart.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        if (records[dateStr]) {
            totalDays++;
            totalAttendance += Object.values(records[dateStr]).filter(record => record.checkIn).length;
        }
    }
    
    return totalDays > 0 ? Math.round((totalAttendance / (totalStudents * totalDays)) * 100) : 0;
}

// 设置事件监听器
function setupEventListeners() {
    // 搜索功能
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('studentSearch').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // 批量操作按钮
    document.getElementById('batchCheckInBtn').addEventListener('click', () => showBatchModal('checkIn'));
    document.getElementById('batchCheckOutBtn').addEventListener('click', () => showBatchModal('checkOut'));
    
    // 导出按钮
    document.getElementById('exportAttendanceBtn').addEventListener('click', exportAttendance);
    
    // 历史记录筛选
    document.getElementById('historyDateRange').addEventListener('change', handleHistoryFilter);
}

// 处理搜索
function handleSearch() {
    const searchTerm = document.getElementById('studentSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#attendanceTableBody tr');
    
    rows.forEach(row => {
        const name = row.cells[1].textContent.toLowerCase();
        const id = row.cells[0].textContent.toLowerCase();
        row.style.display = name.includes(searchTerm) || id.includes(searchTerm) ? '' : 'none';
    });
}

// 显示批量操作模态框
function showBatchModal(action) {
    const modal = document.getElementById('batchModal');
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const studentList = document.getElementById('batchStudentList');
    
    studentList.innerHTML = students.map(student => `
        <div class="student-item">
            <input type="checkbox" id="student-${student.id}" value="${student.id}">
            <label for="student-${student.id}">${student.name} (${student.id})</label>
        </div>
    `).join('');
    
    modal.style.display = 'flex';
    
    // 设置确认按钮事件
    document.getElementById('confirmBatchBtn').onclick = () => {
        const selectedStudents = Array.from(document.querySelectorAll('.student-item input:checked'))
            .map(input => input.value);
        
        if (selectedStudents.length > 0) {
            if (action === 'checkIn') {
                batchCheckIn(selectedStudents);
            } else {
                batchCheckOut(selectedStudents);
            }
        }
        
        modal.style.display = 'none';
    };
    
    // 设置取消按钮事件
    document.getElementById('cancelBatchBtn').onclick = () => {
        modal.style.display = 'none';
    };
}

// 批量签到
function batchCheckIn(studentIds) {
    const today = new Date().toISOString().split('T')[0];
    const attendanceRecords = JSON.parse(localStorage.getItem('attendance') || '{}');
    
    if (!attendanceRecords[today]) {
        attendanceRecords[today] = {};
    }
    
    const now = new Date().toISOString();
    studentIds.forEach(id => {
        if (!attendanceRecords[today][id]) {
            attendanceRecords[today][id] = {};
        }
        attendanceRecords[today][id].checkIn = now;
    });
    
    localStorage.setItem('attendance', JSON.stringify(attendanceRecords));
    loadAttendanceData();
    updateAttendanceStats();
}

// 批量签退
function batchCheckOut(studentIds) {
    const today = new Date().toISOString().split('T')[0];
    const attendanceRecords = JSON.parse(localStorage.getItem('attendance') || '{}');
    
    if (!attendanceRecords[today]) {
        attendanceRecords[today] = {};
    }
    
    const now = new Date().toISOString();
    studentIds.forEach(id => {
        if (!attendanceRecords[today][id]) {
            attendanceRecords[today][id] = {};
        }
        attendanceRecords[today][id].checkOut = now;
    });
    
    localStorage.setItem('attendance', JSON.stringify(attendanceRecords));
    loadAttendanceData();
    updateAttendanceStats();
}

// 导出签到记录
function exportAttendance() {
    const attendanceRecords = JSON.parse(localStorage.getItem('attendance') || '{}');
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    
    // 创建工作簿
    const wb = XLSX.utils.book_new();
    
    // 准备数据
    const data = [];
    const headers = ['日期', '学生ID', '姓名', '课程', '签到时间', '签退时间', '状态'];
    data.push(headers);
    
    // 按日期排序
    const sortedDates = Object.keys(attendanceRecords).sort((a, b) => new Date(b) - new Date(a));
    
    sortedDates.forEach(date => {
        const records = attendanceRecords[date];
        Object.keys(records).forEach(studentId => {
            const student = students.find(s => s.id === studentId);
            if (student) {
                const record = records[studentId];
                data.push([
                    date,
                    studentId,
                    student.name,
                    student.course,
                    record.checkIn || '-',
                    record.checkOut || '-',
                    getStatusText(record)
                ]);
            }
        });
    });
    
    // 创建工作表
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // 设置列宽
    const colWidths = [12, 10, 12, 15, 20, 20, 10];
    ws['!cols'] = colWidths.map(width => ({ wch: width }));
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, "签到记录");
    
    // 导出文件
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `签到记录_${date}.xlsx`);
}

// 处理历史记录筛选
function handleHistoryFilter() {
    const range = document.getElementById('historyDateRange').value;
    const customRange = document.getElementById('customDateRange');
    
    if (range === 'custom') {
        customRange.style.display = 'flex';
    } else {
        customRange.style.display = 'none';
        loadHistoryRecords(range);
    }
}

// 加载历史记录
function loadHistoryRecords(range) {
    const attendanceRecords = JSON.parse(localStorage.getItem('attendance') || '{}');
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const historyRecords = document.getElementById('historyRecords');
    
    let filteredRecords = [];
    const today = new Date();
    
    switch (range) {
        case 'today':
            const todayStr = today.toISOString().split('T')[0];
            filteredRecords = attendanceRecords[todayStr] ? [{
                date: todayStr,
                records: attendanceRecords[todayStr]
            }] : [];
            break;
        case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            for (let i = 0; i < 7; i++) {
                const date = new Date(weekStart);
                date.setDate(weekStart.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                if (attendanceRecords[dateStr]) {
                    filteredRecords.push({
                        date: dateStr,
                        records: attendanceRecords[dateStr]
                    });
                }
            }
            break;
        case 'month':
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            for (let i = 0; i < today.getDate(); i++) {
                const date = new Date(monthStart);
                date.setDate(monthStart.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                if (attendanceRecords[dateStr]) {
                    filteredRecords.push({
                        date: dateStr,
                        records: attendanceRecords[dateStr]
                    });
                }
            }
            break;
    }
    
    // 按日期降序排序
    filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 更新历史记录显示
    historyRecords.innerHTML = filteredRecords.map(record => `
        <div class="history-item">
            <div class="history-date">${formatDate(record.date)}</div>
            <div class="history-stats">
                <span>签到: ${Object.values(record.records).filter(r => r.checkIn).length}</span>
                <span>签退: ${Object.values(record.records).filter(r => r.checkOut).length}</span>
            </div>
        </div>
    `).join('');
}

// 格式化日期
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializeAttendance); 