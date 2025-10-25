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
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    students.forEach(student => {
        const record = records[student.id] || {};
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.course}</td>
            <td>${formatTime(record.checkIn)}</td>
            <td>${formatTime(record.checkOut)}</td>
            <td>
                <span class="status-badge ${getStatusClass(record)}">
                    ${getStatusText(record)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary check-in-btn" data-id="${student.id}" data-name="${student.name}" ${record.onLeave ? 'disabled' : ''}>
                        <i class="fas fa-sign-in-alt"></i> 签到
                    </button>
                    <button class="btn btn-sm btn-warning check-out-btn" data-id="${student.id}" data-name="${student.name}" ${!record.checkIn || record.checkOut || record.onLeave ? 'disabled' : ''}>
                        <i class="fas fa-sign-out-alt"></i> 签退
                    </button>
                    <button class="btn btn-sm btn-info leave-btn" data-id="${student.id}" data-name="${student.name}">
                        <i class="fas fa-calendar-times"></i> 请假
                    </button>
                    <button class="btn btn-sm btn-danger cancel-btn" data-id="${student.id}" data-name="${student.name}" ${!record.checkIn && !record.onLeave ? 'disabled' : ''}>
                        <i class="fas fa-times"></i> 取消
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// 格式化时间显示
function formatTime(timeStr) {
    if (!timeStr) return '-';
    const date = new Date(timeStr);
    return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
}

// 获取状态样式类
function getStatusClass(record) {
    if (record.onLeave) return 'status-leave';
    if (!record.checkIn) return 'status-absent';
    // 使用手动设置的状态
    if (record.status === 'late') return 'status-late';
    return 'status-present';
}

// 获取状态文本
function getStatusText(record) {
    if (record.onLeave) return '请假';
    if (!record.checkIn) return '未签到';
    // 使用手动设置的状态
    if (record.status === 'late') return '迟到';
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
    const searchBtn = document.getElementById('searchBtn');
    const studentSearch = document.getElementById('studentSearch');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    if (studentSearch) {
        studentSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }
    
    // 批量操作按钮
    const batchCheckInBtn = document.getElementById('batchCheckInBtn');
    const batchCheckOutBtn = document.getElementById('batchCheckOutBtn');
    if (batchCheckInBtn) {
        batchCheckInBtn.addEventListener('click', () => showBatchModal('checkIn'));
    }
    if (batchCheckOutBtn) {
        batchCheckOutBtn.addEventListener('click', () => showBatchModal('checkOut'));
    }
    
    // 导出按钮
    const exportBtn = document.getElementById('exportAttendanceBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportAttendance);
    }
    
    // 历史记录筛选
    const historyFilter = document.getElementById('historyDateRange');
    if (historyFilter) {
        historyFilter.addEventListener('change', handleHistoryFilter);
    }
    
    // 单个签到/签退/请假/取消按钮事件（使用事件委托）
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('check-in-btn') || e.target.closest('.check-in-btn')) {
            const btn = e.target.classList.contains('check-in-btn') ? e.target : e.target.closest('.check-in-btn');
            const studentId = btn.getAttribute('data-id');
            const studentName = btn.getAttribute('data-name');
            showTimeInputModal('checkIn', studentId, studentName);
        }
        
        if (e.target.classList.contains('check-out-btn') || e.target.closest('.check-out-btn')) {
            const btn = e.target.classList.contains('check-out-btn') ? e.target : e.target.closest('.check-out-btn');
            const studentId = btn.getAttribute('data-id');
            const studentName = btn.getAttribute('data-name');
            showTimeInputModal('checkOut', studentId, studentName);
        }
        
        if (e.target.classList.contains('leave-btn') || e.target.closest('.leave-btn')) {
            const btn = e.target.classList.contains('leave-btn') ? e.target : e.target.closest('.leave-btn');
            const studentId = btn.getAttribute('data-id');
            const studentName = btn.getAttribute('data-name');
            showLeaveModal(studentId, studentName);
        }
        
        if (e.target.classList.contains('cancel-btn') || e.target.closest('.cancel-btn')) {
            const btn = e.target.classList.contains('cancel-btn') ? e.target : e.target.closest('.cancel-btn');
            const studentId = btn.getAttribute('data-id');
            const studentName = btn.getAttribute('data-name');
            cancelAttendance(studentId, studentName);
        }
    });
    
    // 时间输入模态框事件
    const timeModal = document.getElementById('timeInputModal');
    const closeTimeBtn = timeModal.querySelector('.close-btn');
    const cancelTimeBtn = document.getElementById('cancelTimeBtn');
    
    if (closeTimeBtn) {
        closeTimeBtn.onclick = () => {
            timeModal.style.display = 'none';
        };
    }
    
    if (cancelTimeBtn) {
        cancelTimeBtn.onclick = () => {
            timeModal.style.display = 'none';
        };
    }
    
    // 点击模态框外部关闭
    window.onclick = (event) => {
        const leaveModal = document.getElementById('leaveModal');
        if (event.target === timeModal) {
            timeModal.style.display = 'none';
        }
        if (event.target === leaveModal) {
            leaveModal.style.display = 'none';
        }
    };
    
    // 请假模态框事件
    const leaveModal = document.getElementById('leaveModal');
    const closeLeaveBtn = leaveModal.querySelector('.close-btn');
    const cancelLeaveBtn = document.getElementById('cancelLeaveBtn');
    
    if (closeLeaveBtn) {
        closeLeaveBtn.onclick = () => {
            leaveModal.style.display = 'none';
        };
    }
    
    if (cancelLeaveBtn) {
        cancelLeaveBtn.onclick = () => {
            leaveModal.style.display = 'none';
        };
    }
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

// 显示时间输入模态框
function showTimeInputModal(action, studentId, studentName) {
    const modal = document.getElementById('timeInputModal');
    const title = document.getElementById('timeModalTitle');
    const studentNameSpan = document.getElementById('timeModalStudentName');
    const dateInput = document.getElementById('attendanceDate');
    const timeInput = document.getElementById('attendanceTime');
    const statusSelect = document.getElementById('attendanceStatus');
    const confirmBtn = document.getElementById('confirmTimeBtn');
    
    // 设置模态框标题和学生名称
    title.textContent = action === 'checkIn' ? '签到' : '签退';
    studentNameSpan.textContent = studentName;
    
    // 设置默认日期和时间为当前时间
    const now = new Date();
    dateInput.value = now.toISOString().split('T')[0];
    timeInput.value = now.toTimeString().slice(0, 5);
    
    // 根据操作类型显示/隐藏状态选择
    const statusGroup = statusSelect.closest('.form-group');
    if (action === 'checkIn') {
        statusGroup.style.display = 'block';
        statusSelect.value = 'present'; // 默认正常
    } else {
        statusGroup.style.display = 'none';
    }
    
    // 显示模态框
    modal.style.display = 'flex';
    
    // 设置确认按钮事件
    confirmBtn.onclick = () => {
        const date = dateInput.value;
        const time = timeInput.value;
        const status = statusSelect.value;
        
        if (!date || !time) {
            alert('请输入日期和时间！');
            return;
        }
        
        const dateTimeStr = `${date}T${time}:00`;
        
        if (action === 'checkIn') {
            performCheckIn(studentId, dateTimeStr, status);
        } else {
            performCheckOut(studentId, dateTimeStr);
        }
        
        modal.style.display = 'none';
    };
}

// 执行签到
function performCheckIn(studentId, dateTimeStr, status = 'present') {
    const date = dateTimeStr.split('T')[0];
    const attendanceRecords = JSON.parse(localStorage.getItem('attendance') || '{}');
    
    if (!attendanceRecords[date]) {
        attendanceRecords[date] = {};
    }
    
    if (!attendanceRecords[date][studentId]) {
        attendanceRecords[date][studentId] = {};
    }
    
    attendanceRecords[date][studentId].checkIn = dateTimeStr;
    attendanceRecords[date][studentId].status = status; // 保存手动选择的状态
    
    localStorage.setItem('attendance', JSON.stringify(attendanceRecords));
    loadAttendanceData();
    updateAttendanceStats();
    
    const student = JSON.parse(localStorage.getItem('students') || '[]').find(s => s.id == studentId);
    const statusText = status === 'late' ? '（迟到）' : '';
    if (student) {
        alert(`${student.name} 签到成功！${statusText}`);
    }
}

// 执行签退
function performCheckOut(studentId, dateTimeStr) {
    const date = dateTimeStr.split('T')[0];
    const attendanceRecords = JSON.parse(localStorage.getItem('attendance') || '{}');
    
    if (!attendanceRecords[date]) {
        attendanceRecords[date] = {};
    }
    
    if (!attendanceRecords[date][studentId]) {
        attendanceRecords[date][studentId] = {};
    }
    
    // 检查是否已经签到
    if (!attendanceRecords[date][studentId].checkIn) {
        alert('该学生今天还没有签到！');
        return;
    }
    
    attendanceRecords[date][studentId].checkOut = dateTimeStr;
    
    localStorage.setItem('attendance', JSON.stringify(attendanceRecords));
    loadAttendanceData();
    updateAttendanceStats();
    
    const student = JSON.parse(localStorage.getItem('students') || '[]').find(s => s.id == studentId);
    if (student) {
        alert(`${student.name} 签退成功！`);
    }
}

// 取消签到
function cancelAttendance(studentId, studentName) {
    if (!confirm(`确定要取消 ${studentName} 的签到/请假记录吗？`)) {
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const attendanceRecords = JSON.parse(localStorage.getItem('attendance') || '{}');
    const leaveRecords = JSON.parse(localStorage.getItem('leaveRecords') || '{}');
    
    // 检查是否是请假记录
    const record = attendanceRecords[today]?.[studentId];
    const isLeaveRecord = record?.onLeave;
    
    if (attendanceRecords[today] && attendanceRecords[today][studentId]) {
        delete attendanceRecords[today][studentId];
        
        // 如果当天没有其他记录，删除整个日期条目
        if (Object.keys(attendanceRecords[today]).length === 0) {
            delete attendanceRecords[today];
        }
        
        localStorage.setItem('attendance', JSON.stringify(attendanceRecords));
        
        // 如果是请假记录，需要从leaveRecords中删除对应的记录
        if (isLeaveRecord && leaveRecords[studentId]) {
            // 找到包含今天日期的请假记录并删除
            leaveRecords[studentId] = leaveRecords[studentId].filter(leave => {
                const startDate = new Date(leave.startDate);
                const endDate = new Date(leave.endDate);
                const todayDate = new Date(today);
                
                // 如果今天在请假范围内，说明这是要删除的记录
                if (todayDate >= startDate && todayDate <= endDate) {
                    return false; // 过滤掉这条记录
                }
                return true; // 保留其他记录
            });
            
            // 如果该学生没有其他请假记录了，删除整个学生的请假记录
            if (leaveRecords[studentId].length === 0) {
                delete leaveRecords[studentId];
            }
            
            localStorage.setItem('leaveRecords', JSON.stringify(leaveRecords));
            
            // 删除请假范围内所有日期的记录
            const leaveStartDate = new Date(record.leaveReason ? today : today); // 获取请假开始日期
            Object.keys(attendanceRecords).forEach(date => {
                if (attendanceRecords[date][studentId]?.onLeave && attendanceRecords[date][studentId]?.leaveReason === record.leaveReason) {
                    delete attendanceRecords[date][studentId];
                    if (Object.keys(attendanceRecords[date]).length === 0) {
                        delete attendanceRecords[date];
                    }
                }
            });
            
            localStorage.setItem('attendance', JSON.stringify(attendanceRecords));
        }
        
        loadAttendanceData();
        updateAttendanceStats();
        
        alert(`${studentName} 的记录已取消！`);
    }
}

// 显示请假模态框
function showLeaveModal(studentId, studentName) {
    const modal = document.getElementById('leaveModal');
    const studentNameSpan = document.getElementById('leaveModalStudentName');
    const startDateInput = document.getElementById('leaveStartDate');
    const endDateInput = document.getElementById('leaveEndDate');
    const reasonInput = document.getElementById('leaveReason');
    const confirmBtn = document.getElementById('confirmLeaveBtn');
    
    // 设置学生名称
    studentNameSpan.textContent = studentName;
    
    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0];
    startDateInput.value = today;
    endDateInput.value = today;
    reasonInput.value = '';
    
    // 显示模态框
    modal.style.display = 'flex';
    
    // 设置确认按钮事件
    confirmBtn.onclick = () => {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const reason = reasonInput.value.trim();
        
        if (!startDate || !endDate || !reason) {
            alert('请填写完整的请假信息！');
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
            alert('结束日期不能早于开始日期！');
            return;
        }
        
        submitLeave(studentId, studentName, startDate, endDate, reason);
        modal.style.display = 'none';
    };
}

// 提交请假申请
function submitLeave(studentId, studentName, startDate, endDate, reason) {
    const attendanceRecords = JSON.parse(localStorage.getItem('attendance') || '{}');
    const leaveRecords = JSON.parse(localStorage.getItem('leaveRecords') || '{}');
    
    // 保存请假记录
    if (!leaveRecords[studentId]) {
        leaveRecords[studentId] = [];
    }
    
    leaveRecords[studentId].push({
        startDate,
        endDate,
        reason,
        createTime: new Date().toISOString()
    });
    
    // 在请假日期范围内标记为请假
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        
        if (!attendanceRecords[dateStr]) {
            attendanceRecords[dateStr] = {};
        }
        
        if (!attendanceRecords[dateStr][studentId]) {
            attendanceRecords[dateStr][studentId] = {};
        }
        
        attendanceRecords[dateStr][studentId].onLeave = true;
        attendanceRecords[dateStr][studentId].leaveReason = reason;
    }
    
    localStorage.setItem('attendance', JSON.stringify(attendanceRecords));
    localStorage.setItem('leaveRecords', JSON.stringify(leaveRecords));
    
    loadAttendanceData();
    updateAttendanceStats();
    
    alert(`${studentName} 的请假申请已提交！\n请假时间：${startDate} 至 ${endDate}`);
}

// 单个学生签到（保留旧函数以兼容）
function singleCheckIn(studentId) {
    const today = new Date().toISOString().split('T')[0];
    const attendanceRecords = JSON.parse(localStorage.getItem('attendance') || '{}');
    
    if (!attendanceRecords[today]) {
        attendanceRecords[today] = {};
    }
    
    if (!attendanceRecords[today][studentId]) {
        attendanceRecords[today][studentId] = {};
    }
    
    // 检查是否已经签到
    if (attendanceRecords[today][studentId].checkIn) {
        alert('该学生今天已经签到过了！');
        return;
    }
    
    const now = new Date().toISOString();
    attendanceRecords[today][studentId].checkIn = now;
    
    localStorage.setItem('attendance', JSON.stringify(attendanceRecords));
    loadAttendanceData();
    updateAttendanceStats();
    
    // 显示成功消息
    const student = JSON.parse(localStorage.getItem('students') || '[]').find(s => s.id == studentId);
    if (student) {
        alert(`${student.name} 签到成功！`);
    }
}

// 单个学生签退
function singleCheckOut(studentId) {
    const today = new Date().toISOString().split('T')[0];
    const attendanceRecords = JSON.parse(localStorage.getItem('attendance') || '{}');
    
    if (!attendanceRecords[today]) {
        attendanceRecords[today] = {};
    }
    
    if (!attendanceRecords[today][studentId]) {
        attendanceRecords[today][studentId] = {};
    }
    
    // 检查是否已经签到
    if (!attendanceRecords[today][studentId].checkIn) {
        alert('该学生今天还没有签到！');
        return;
    }
    
    // 检查是否已经签退
    if (attendanceRecords[today][studentId].checkOut) {
        alert('该学生今天已经签退过了！');
        return;
    }
    
    const now = new Date().toISOString();
    attendanceRecords[today][studentId].checkOut = now;
    
    localStorage.setItem('attendance', JSON.stringify(attendanceRecords));
    loadAttendanceData();
    updateAttendanceStats();
    
    // 显示成功消息
    const student = JSON.parse(localStorage.getItem('students') || '[]').find(s => s.id == studentId);
    if (student) {
        alert(`${student.name} 签退成功！`);
    }
}

// 导出签到记录
function exportAttendance() {
    const attendanceRecords = JSON.parse(localStorage.getItem('attendance') || '{}');
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const leaveRecords = JSON.parse(localStorage.getItem('leaveRecords') || '{}');
    
    if (!window.XLSX) {
        alert('导出功能需要加载XLSX库，请检查网络连接！');
        return;
    }
    
    // 创建工作簿
    const wb = XLSX.utils.book_new();
    
    // === 工作表1: 详细签到记录 ===
    const detailData = [];
    const detailHeaders = ['日期', '星期', '学生ID', '姓名', '课程', '签到时间', '签退时间', '状态', '请假原因'];
    detailData.push(detailHeaders);
    
    // 按日期排序（最新的在前）
    const sortedDates = Object.keys(attendanceRecords).sort((a, b) => new Date(b) - new Date(a));
    
    sortedDates.forEach(date => {
        const records = attendanceRecords[date];
        const weekDay = ['日', '一', '二', '三', '四', '五', '六'][new Date(date).getDay()];
        
        Object.keys(records).forEach(studentId => {
            const student = students.find(s => s.id == studentId);
            if (student) {
                const record = records[studentId];
                detailData.push([
                    date,
                    `星期${weekDay}`,
                    studentId,
                    student.name,
                    student.course,
                    record.checkIn ? formatTime(record.checkIn) : '-',
                    record.checkOut ? formatTime(record.checkOut) : '-',
                    getStatusText(record),
                    record.leaveReason || '-'
                ]);
            }
        });
    });
    
    const detailWs = XLSX.utils.aoa_to_sheet(detailData);
    detailWs['!cols'] = [12, 10, 10, 12, 15, 12, 12, 10, 20].map(w => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, detailWs, "详细记录");
    
    // === 工作表2: 学生统计 ===
    const statsData = [];
    const statsHeaders = ['学生ID', '姓名', '课程', '总签到次数', '正常次数', '迟到次数', '请假次数', '出勤率'];
    statsData.push(statsHeaders);
    
    students.forEach(student => {
        let totalAttendance = 0;
        let normalCount = 0;
        let lateCount = 0;
        let leaveCount = 0;
        
        Object.keys(attendanceRecords).forEach(date => {
            const record = attendanceRecords[date][student.id];
            if (record) {
                if (record.onLeave) {
                    leaveCount++;
                } else if (record.checkIn) {
                    totalAttendance++;
                    if (record.status === 'late') {
                        lateCount++;
                    } else {
                        normalCount++;
                    }
                }
            }
        });
        
        const totalDays = Object.keys(attendanceRecords).length;
        const attendanceRate = totalDays > 0 ? ((totalAttendance / totalDays) * 100).toFixed(1) + '%' : '0%';
        
        statsData.push([
            student.id,
            student.name,
            student.course,
            totalAttendance,
            normalCount,
            lateCount,
            leaveCount,
            attendanceRate
        ]);
    });
    
    const statsWs = XLSX.utils.aoa_to_sheet(statsData);
    statsWs['!cols'] = [10, 12, 15, 12, 12, 12, 12, 10].map(w => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, statsWs, "学生统计");
    
    // === 工作表3: 请假记录 ===
    const leaveData = [];
    const leaveHeaders = ['学生ID', '姓名', '课程', '开始日期', '结束日期', '请假天数', '请假原因', '申请时间'];
    leaveData.push(leaveHeaders);
    
    Object.keys(leaveRecords).forEach(studentId => {
        const student = students.find(s => s.id == studentId);
        if (student) {
            leaveRecords[studentId].forEach(leave => {
                const startDate = new Date(leave.startDate);
                const endDate = new Date(leave.endDate);
                const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                
                leaveData.push([
                    studentId,
                    student.name,
                    student.course,
                    leave.startDate,
                    leave.endDate,
                    days,
                    leave.reason,
                    leave.createTime ? new Date(leave.createTime).toLocaleString('zh-CN') : '-'
                ]);
            });
        }
    });
    
    if (leaveData.length > 1) {
        const leaveWs = XLSX.utils.aoa_to_sheet(leaveData);
        leaveWs['!cols'] = [10, 12, 15, 12, 12, 10, 25, 20].map(w => ({ wch: w }));
        XLSX.utils.book_append_sheet(wb, leaveWs, "请假记录");
    }
    
    // === 工作表4: 周出勤率统计 ===
    const weekStatsData = [];
    const weekStatsHeaders = ['周次', '日期范围', '应到人次', '实到人次', '迟到人次', '请假人次', '缺勤人次', '周出勤率'];
    weekStatsData.push(weekStatsHeaders);
    
    // 按周分组统计
    const weekGroups = {};
    sortedDates.forEach(date => {
        const dateObj = new Date(date);
        // 获取该日期所在周的周一日期
        const dayOfWeek = dateObj.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 周日算上一周
        const monday = new Date(dateObj);
        monday.setDate(dateObj.getDate() + diff);
        const weekKey = monday.toISOString().split('T')[0];
        
        if (!weekGroups[weekKey]) {
            weekGroups[weekKey] = {
                dates: [],
                monday: monday
            };
        }
        weekGroups[weekKey].dates.push(date);
    });
    
    // 按周一日期排序
    const sortedWeeks = Object.keys(weekGroups).sort();
    
    sortedWeeks.forEach((weekKey, index) => {
        const week = weekGroups[weekKey];
        const dates = week.dates;
        const monday = week.monday;
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        
        const dateRange = `${monday.getMonth() + 1}/${monday.getDate()}-${sunday.getMonth() + 1}/${sunday.getDate()}`;
        const weekNumber = `第${index + 1}周`;
        
        let totalAttendance = 0; // 总应到人次
        let presentCount = 0;    // 实到人次
        let lateCount = 0;       // 迟到人次
        let leaveCount = 0;      // 请假人次
        let absentCount = 0;     // 缺勤人次
        
        // 统计该周每天的数据
        dates.forEach(date => {
            const records = attendanceRecords[date];
            const dailyTotal = students.length;
            totalAttendance += dailyTotal;
            
            let dailyPresent = 0;
            let dailyLate = 0;
            let dailyLeave = 0;
            
            Object.keys(records).forEach(studentId => {
                const record = records[studentId];
                if (record.onLeave) {
                    dailyLeave++;
                } else if (record.checkIn) {
                    dailyPresent++;
                    if (record.status === 'late') {
                        dailyLate++;
                    }
                }
            });
            
            presentCount += dailyPresent;
            lateCount += dailyLate;
            leaveCount += dailyLeave;
            absentCount += (dailyTotal - dailyPresent - dailyLeave);
        });
        
        const weekRate = totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(1) + '%' : '0%';
        
        weekStatsData.push([
            weekNumber,
            dateRange,
            totalAttendance,
            presentCount,
            lateCount,
            leaveCount,
            absentCount,
            weekRate
        ]);
    });
    
    const weekStatsWs = XLSX.utils.aoa_to_sheet(weekStatsData);
    weekStatsWs['!cols'] = [10, 15, 12, 12, 12, 12, 12, 12].map(w => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, weekStatsWs, "周出勤率统计");
    
    // 导出文件
    const exportDate = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `签到记录_${exportDate}.xlsx`);
    
    alert('签到记录导出成功！');
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