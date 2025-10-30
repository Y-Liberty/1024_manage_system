// 模拟数据存储
let students = [];
let courses = [];
let activities = [];

// 初始化数据
function initializeData() {
    // 获取学生和课程数据
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

    // 更新统计数据
    updateStats(students.length, courses.length);

    // 更新课程表
    updateSchedule();

    // 设置导出和导入按钮事件
    const exportBtn = document.getElementById('exportDataBtn');
    const importBtn = document.getElementById('importDataBtn');
    const importInput = document.getElementById('importDataInput');

    if (exportBtn) {
        exportBtn.onclick = exportAllData;
    }

    if (importBtn && importInput) {
        // 点击导入按钮时触发文件选择
        importBtn.onclick = () => {
            importInput.click();
        };

        // 当选择文件后处理导入
        importInput.onchange = async (e) => {
            if (e.target.files.length > 0) {
                await importData(e.target.files[0]);
                // 清除文件选择，允许重复导入相同文件
                e.target.value = '';
            }
        };
    }
}

// 更新课程表
function updateSchedule() {
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const schedule = JSON.parse(localStorage.getItem('schedule')) || {};
    const slots = document.querySelectorAll('.empty-slot');
    
    // 定义颜色映射
    const colorMap = {
        '': '#ffffff',
        'no_course': '#f8f9fa'
    };
    
    // 为每个课程动态分配颜色
    const defaultColors = [
        '#e3f2fd', // 浅蓝
        '#f3e5f5', // 浅紫
        '#e8f5e9', // 浅绿
        '#fff3e0', // 浅橙
        '#fce4ec', // 浅粉
        '#e0f7fa', // 浅青
        '#f1f8e9', // 浅草绿
        '#fff8e1', // 浅黄
        '#e8eaf6', // 浅靛蓝
        '#f9fbe7'  // 浅青柠
    ];
    
    // 为所有课程分配颜色
    courses.forEach((course, index) => {
        colorMap[course.id] = defaultColors[index % defaultColors.length];
    });
    
    slots.forEach((slot, index) => {
        // 创建新的select元素
        const select = document.createElement('select');
        select.className = 'course-select';
        
        // 添加空白选项
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = ' ';
        select.appendChild(emptyOption);
        
        // 添加默认选项
        const defaultOption = document.createElement('option');
        defaultOption.value = 'no_course';
        defaultOption.textContent = '暂无课程';
        select.appendChild(defaultOption);
        
        // 添加课程选项
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = course.name;
            select.appendChild(option);
        });
        
        // 如果该时间段已有选择的课程，则设置选中状态
        const currentValue = schedule[index] || '';
        select.value = currentValue;
        slot.style.backgroundColor = colorMap[currentValue] || colorMap[''];
        
        // 监听选择变化
        select.addEventListener('change', function() {
            const newSchedule = JSON.parse(localStorage.getItem('schedule')) || {};
            const selectedValue = this.value;
            
            if (selectedValue === '') {
                // 空白选项
                delete newSchedule[index];
                slot.style.backgroundColor = colorMap[''];
            } else {
                // 暂无课程或具体课程
                newSchedule[index] = selectedValue;
                slot.style.backgroundColor = colorMap[selectedValue];
            }
            
            localStorage.setItem('schedule', JSON.stringify(newSchedule));
        });
        
        // 清空slot内容并添加新的select
        while (slot.firstChild) {
            slot.removeChild(slot.firstChild);
        }
        slot.appendChild(select);
    });
}

// 设置侧边栏切换
function setupSidebarToggle() {
    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    if (toggleBtn) {
        toggleBtn.onclick = function() {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        };
    }
}

// 导出所有数据
async function exportAllData() {
    if (!window.XLSX) {
        alert('导出功能需要加载XLSX库，请检查网络连接！');
        return;
    }
    
    // 获取所有数据
    const data = {
        students: JSON.parse(localStorage.getItem('students') || '[]'),
        courses: JSON.parse(localStorage.getItem('courses') || '[]'),
        transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
        attendance: JSON.parse(localStorage.getItem('attendance') || '{}'),
        leaveRecords: JSON.parse(localStorage.getItem('leaveRecords') || '{}'),
        schedule: JSON.parse(localStorage.getItem('schedule') || '{}'),
        pointsStoreProducts: JSON.parse(localStorage.getItem('pointsStoreProducts') || '[]'),
        exportDate: new Date().toISOString(),
        version: '2.1'
    };

    // 创建文件名（包含日期）
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
    const baseFileName = `少儿编程机构数据备份_${dateStr}_${timeStr}`;

    try {
        // 获取用户选择的目录句柄
        const dirHandle = await window.showDirectoryPicker({
            id: 'backup',
            mode: 'readwrite',
            startIn: 'downloads'
        });

        // 导出JSON完整备份
        const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        await saveFile(dirHandle, `${baseFileName}.json`, jsonBlob);

        // 导出所有表格数据到Excel
        await exportStudentExcel(data.students, baseFileName, dirHandle);

        // 导出课程表为PNG
        // 创建Canvas
        const scheduleCanvas = document.createElement('canvas');
        const ctx = scheduleCanvas.getContext('2d');
        
        // 设置画布大小
        scheduleCanvas.width = 1400;
        scheduleCanvas.height = 800;
        
        // 设置背景色
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, scheduleCanvas.width, scheduleCanvas.height);
        
        // 设置标题
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 24px Arial';
        const title = `壹零贰肆少儿编程机构 ${dateStr} 课程表`;
        const titleWidth = ctx.measureText(title).width;
        ctx.fillText(title, (scheduleCanvas.width - titleWidth) / 2, 50);
        
        // 定义表格参数
        const startX = 50;
        const startY = 100;
        const timeColWidth = 150;
        const dayColWidth = 170;
        const rowHeight = 60;
        const headerBgColor = '#f5f5f5';  // 表头背景色
        
        // 定义时间段
        const timeSlots = [
            '时间段',
            '08:00-10:00',
            '10:00-12:00',
            '14:30-16:30',
            '16:30-18:30',
            '18:30-20:00'
        ];
        
        // 定义星期
        const weekDays = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];

        // 从当前课程表中获取数据
        const scheduleData = {};
        const scheduleTable = document.querySelector('.schedule-table');
        if (scheduleTable) {
            const rows = scheduleTable.querySelectorAll('tr');
            rows.forEach((row, rowIndex) => {
                if (rowIndex === 0) return; // 跳过表头行
                const timeSlot = timeSlots[rowIndex];
                scheduleData[timeSlot] = {};
                
                const cells = row.querySelectorAll('td');
                cells.forEach((cell, cellIndex) => {
                    if (cellIndex === 0) return; // 跳过时间段列
                    const day = weekDays[cellIndex - 1];
                    const select = cell.querySelector('select');
                    const courseName = select ? select.options[select.selectedIndex].text.trim() : '';
                    const cellStyle = window.getComputedStyle(cell);
                    const backgroundColor = cellStyle.backgroundColor;
                    
                    scheduleData[timeSlot][day] = {
                        name: courseName === ' ' ? '-' : courseName,
                        color: backgroundColor
                    };
                });
            });
        }
        
        // 绘制表格边框和表头
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.font = 'bold 16px Arial';
        
        // 绘制时间列
        timeSlots.forEach((time, index) => {
            const y = startY + index * rowHeight;
            
            // 绘制单元格背景 - 所有时间格子使用表头背景色
            ctx.fillStyle = headerBgColor;
            ctx.fillRect(startX, y, timeColWidth, rowHeight);
            
            // 绘制边框
            ctx.strokeRect(startX, y, timeColWidth, rowHeight);
            
            // 绘制文字
            ctx.fillStyle = '#333333';
            const textWidth = ctx.measureText(time).width;
            ctx.fillText(time, startX + (timeColWidth - textWidth) / 2, y + rowHeight / 2 + 6);
        });
        
        // 绘制星期列和课程内容
        weekDays.forEach((day, dayIndex) => {
            const x = startX + timeColWidth + dayIndex * dayColWidth;
            
            // 绘制表头
            ctx.fillStyle = headerBgColor;
            ctx.fillRect(x, startY, dayColWidth, rowHeight);
            ctx.strokeRect(x, startY, dayColWidth, rowHeight);
            
            // 绘制星期文字
            ctx.fillStyle = '#333333';
            ctx.font = 'bold 16px Arial';  // 确保星期文字加粗
            const dayWidth = ctx.measureText(day).width;
            ctx.fillText(day, x + (dayColWidth - dayWidth) / 2, startY + rowHeight / 2 + 6);
            
            // 绘制每个时间段的课程
            for (let timeIndex = 1; timeIndex < timeSlots.length; timeIndex++) {
                const y = startY + timeIndex * rowHeight;
                const timeSlot = timeSlots[timeIndex];
                const courseInfo = scheduleData[timeSlot]?.[day];
                
                // 设置单元格背景色
                ctx.fillStyle = courseInfo?.color || '#ffffff';
                ctx.fillRect(x, y, dayColWidth, rowHeight);
                
                // 绘制边框
                ctx.strokeRect(x, y, dayColWidth, rowHeight);
                
                // 绘制课程名称
                if (courseInfo?.name) {
                    ctx.fillStyle = '#333333';
                    ctx.font = 'bold 14px Arial';  // 课程名称加粗
                    const text = courseInfo.name;
                    const textWidth = ctx.measureText(text).width;
                    
                    // 如果文字过长，进行截断
                    let displayText = text;
                    if (textWidth > dayColWidth - 20) {
                        while (ctx.measureText(displayText + '...').width > dayColWidth - 20) {
                            displayText = displayText.slice(0, -1);
                        }
                        displayText += '...';
                    }
                    
                    ctx.fillText(
                        displayText,
                        x + (dayColWidth - ctx.measureText(displayText).width) / 2,
                        y + rowHeight / 2 + 6
                    );
                }
            }
        });
        
        // 将Canvas转换为PNG图片并保存
        const pngBlob = await new Promise(resolve => {
            scheduleCanvas.toBlob(resolve, 'image/png');
        });
        await saveFile(dirHandle, `${baseFileName}_课程表.png`, pngBlob);

        alert('数据导出成功！');
    } catch (err) {
        if (err.name !== 'AbortError') {
            alert('导出失败：' + err.message);
        }
    }
}

// 导出Excel格式的学生数据
async function exportStudentExcel(students, baseFileName, dirHandle) {
    // 创建工作簿
    const wb = XLSX.utils.book_new();
    
    // 定义样式
    const headerStyle = {
        s: {
            fill: { 
                fgColor: { rgb: "4472C4" },  // 更改为深蓝色
                patternType: "solid"
            },
            font: { 
                name: "微软雅黑",
                sz: 12,
                bold: true,
                color: { rgb: "FFFFFF" }
            },
            alignment: { 
                horizontal: "center",
                vertical: "center",
                wrapText: true
            },
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
            }
        }
    };

    const dataStyle = {
        s: {
            font: { 
                name: "微软雅黑",
                sz: 11,
                color: { rgb: "333333" }
            },
            alignment: { 
                horizontal: "center",
                vertical: "center",
                wrapText: true
            },
            border: {
                top: { style: "thin", color: { rgb: "E0E0E0" } },
                bottom: { style: "thin", color: { rgb: "E0E0E0" } },
                left: { style: "thin", color: { rgb: "E0E0E0" } },
                right: { style: "thin", color: { rgb: "E0E0E0" } }
            }
        }
    };

    const alternateRowStyle = {
        s: {
            ...dataStyle.s,
            fill: { 
                fgColor: { rgb: "F2F2F2" },  // 更改为浅灰色
                patternType: "solid"
            }
        }
    };

    // 1. 导出学生基本信息
    const basicHeaders = ['ID', '姓名', '性别', '年龄', '学校', '家长姓名', '联系方式', '课程类型', '剩余课时', '当前积分'];
    const basicRows = students.map(student => [
        student.id,
        student.name,
        student.gender,
        student.age,
        student.school,
        student.parentName,
        student.parentPhone,
        student.course,
        student.remainingHours,
        student.points || 0
    ]);

    // 创建学生信息工作表并应用样式
    const basicWs = XLSX.utils.aoa_to_sheet([basicHeaders, ...basicRows]);
    
    // 设置列宽
    const basicColWidths = [8, 12, 8, 8, 20, 12, 15, 15, 10, 10];
    basicWs['!cols'] = basicColWidths.map(width => ({ wch: width }));
    
    // 设置行高
    basicWs['!rows'] = Array(basicRows.length + 1).fill({ hpt: 25 });
    
    // 应用样式到每个单元格
    const basicRange = XLSX.utils.decode_range(basicWs['!ref']);
    for(let R = basicRange.s.r; R <= basicRange.e.r; R++) {
        for(let C = basicRange.s.c; C <= basicRange.e.c; C++) {
            const cellRef = XLSX.utils.encode_cell({r: R, c: C});
            if(!basicWs[cellRef]) basicWs[cellRef] = { v: '', t: 's' };
            
            if(R === 0) {
                // 表头样式
                basicWs[cellRef] = { ...basicWs[cellRef], ...headerStyle };
            } else {
                // 数据行样式
                basicWs[cellRef] = { ...basicWs[cellRef], ...(R % 2 === 0 ? alternateRowStyle : dataStyle) };
            }
        }
    }
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, basicWs, "学生信息");

    // 2. 导出消课记录（使用相同的样式逻辑）
    const consumeHeaders = ['学生ID', '学生姓名', '日期', '课时', '备注'];
    const consumeRows = [];
    students.forEach(student => {
        if (student.consumeRecords) {
            student.consumeRecords.forEach(record => {
                consumeRows.push([
                    student.id,
                    student.name,
                    record.date,
                    record.hours,
                    record.note || ''
                ]);
            });
        }
    });

    const consumeWs = XLSX.utils.aoa_to_sheet([consumeHeaders, ...consumeRows]);
    
    // 设置列宽
    const consumeColWidths = [8, 12, 15, 8, 30];
    consumeWs['!cols'] = consumeColWidths.map(width => ({ wch: width }));
    
    // 设置行高
    consumeWs['!rows'] = Array(consumeRows.length + 1).fill({ hpt: 25 });
    
    // 应用样式
    const consumeRange = XLSX.utils.decode_range(consumeWs['!ref']);
    for(let R = consumeRange.s.r; R <= consumeRange.e.r; R++) {
        for(let C = consumeRange.s.c; C <= consumeRange.e.c; C++) {
            const cellRef = XLSX.utils.encode_cell({r: R, c: C});
            if(!consumeWs[cellRef]) consumeWs[cellRef] = { v: '', t: 's' };
            
            if(R === 0) {
                consumeWs[cellRef] = { ...consumeWs[cellRef], ...headerStyle };
            } else {
                consumeWs[cellRef] = { ...consumeWs[cellRef], ...(R % 2 === 0 ? alternateRowStyle : dataStyle) };
            }
        }
    }
    
    XLSX.utils.book_append_sheet(wb, consumeWs, "消课记录");

    // 3. 导出积分记录（使用相同的样式逻辑）
    const pointsHeaders = ['学生ID', '学生姓名', '日期', '积分变更', '原因'];
    const pointsRows = [];
    students.forEach(student => {
        if (student.pointsHistory) {
            student.pointsHistory.forEach(record => {
                pointsRows.push([
                    student.id,
                    student.name,
                    record.date,
                    record.change,
                    record.note || ''
                ]);
            });
        }
    });

    const pointsWs = XLSX.utils.aoa_to_sheet([pointsHeaders, ...pointsRows]);
    
    // 设置列宽
    const pointsColWidths = [8, 12, 15, 10, 30];
    pointsWs['!cols'] = pointsColWidths.map(width => ({ wch: width }));
    
    // 设置行高
    pointsWs['!rows'] = Array(pointsRows.length + 1).fill({ hpt: 25 });
    
    // 应用样式
    const pointsRange = XLSX.utils.decode_range(pointsWs['!ref']);
    for(let R = pointsRange.s.r; R <= pointsRange.e.r; R++) {
        for(let C = pointsRange.s.c; C <= pointsRange.e.c; C++) {
            const cellRef = XLSX.utils.encode_cell({r: R, c: C});
            if(!pointsWs[cellRef]) pointsWs[cellRef] = { v: '', t: 's' };
            
            if(R === 0) {
                pointsWs[cellRef] = { ...pointsWs[cellRef], ...headerStyle };
            } else {
                pointsWs[cellRef] = { ...pointsWs[cellRef], ...(R % 2 === 0 ? alternateRowStyle : dataStyle) };
            }
        }
    }
    
    XLSX.utils.book_append_sheet(wb, pointsWs, "积分记录");

    // 4. 导出财务记录（使用相同的样式逻辑）
    const financeHeaders = ['日期', '类型', '金额', '分类', '备注'];
    const financeRows = JSON.parse(localStorage.getItem('transactions') || '[]')
        .map(transaction => [
            transaction.date,
            transaction.type,
            transaction.amount,
            transaction.category,
            transaction.note || ''
        ]);

    // 按日期降序排序
    financeRows.sort((a, b) => new Date(b[0]) - new Date(a[0]));

    const financeWs = XLSX.utils.aoa_to_sheet([financeHeaders, ...financeRows]);
    
    // 设置列宽
    const financeColWidths = [15, 10, 12, 15, 30];
    financeWs['!cols'] = financeColWidths.map(width => ({ wch: width }));
    
    // 设置行高
    financeWs['!rows'] = Array(financeRows.length + 1).fill({ hpt: 25 });
    
    // 应用样式
    const financeRange = XLSX.utils.decode_range(financeWs['!ref']);
    for(let R = financeRange.s.r; R <= financeRange.e.r; R++) {
        for(let C = financeRange.s.c; C <= financeRange.e.c; C++) {
            const cellRef = XLSX.utils.encode_cell({r: R, c: C});
            if(!financeWs[cellRef]) financeWs[cellRef] = { v: '', t: 's' };
            
            if(R === 0) {
                financeWs[cellRef] = { ...financeWs[cellRef], ...headerStyle };
            } else {
                financeWs[cellRef] = { ...financeWs[cellRef], ...(R % 2 === 0 ? alternateRowStyle : dataStyle) };
            }
        }
    }
    
    XLSX.utils.book_append_sheet(wb, financeWs, "财务记录");

    // 5. 导出签到记录
    const attendanceRecords = JSON.parse(localStorage.getItem('attendance') || '{}');
    const attendanceHeaders = ['日期', '星期', '学生ID', '姓名', '课程', '签到时间', '签退时间', '状态', '请假原因'];
    const attendanceRows = [];
    
    // 按日期排序
    const sortedDates = Object.keys(attendanceRecords).sort((a, b) => new Date(b) - new Date(a));
    
    sortedDates.forEach(date => {
        const records = attendanceRecords[date];
        const weekDay = ['日', '一', '二', '三', '四', '五', '六'][new Date(date).getDay()];
        
        Object.keys(records).forEach(studentId => {
            const student = students.find(s => s.id == studentId);
            if (student) {
                const record = records[studentId];
                const formatTime = (timeStr) => {
                    if (!timeStr) return '-';
                    const date = new Date(timeStr);
                    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                };
                const getStatusText = (record) => {
                    if (record.onLeave) return '请假';
                    if (!record.checkIn) return '未签到';
                    if (record.status === 'late') return '迟到';
                    return '已签到';
                };
                
                attendanceRows.push([
                    date,
                    `星期${weekDay}`,
                    studentId,
                    student.name,
                    student.course,
                    formatTime(record.checkIn),
                    formatTime(record.checkOut),
                    getStatusText(record),
                    record.leaveReason || '-'
                ]);
            }
        });
    });
    
    if (attendanceRows.length > 0) {
        const attendanceWs = XLSX.utils.aoa_to_sheet([attendanceHeaders, ...attendanceRows]);
        attendanceWs['!cols'] = [12, 10, 10, 12, 15, 12, 12, 10, 20].map(width => ({ wch: width }));
        attendanceWs['!rows'] = Array(attendanceRows.length + 1).fill({ hpt: 25 });
        
        const attendanceRange = XLSX.utils.decode_range(attendanceWs['!ref']);
        for(let R = attendanceRange.s.r; R <= attendanceRange.e.r; R++) {
            for(let C = attendanceRange.s.c; C <= attendanceRange.e.c; C++) {
                const cellRef = XLSX.utils.encode_cell({r: R, c: C});
                if(!attendanceWs[cellRef]) attendanceWs[cellRef] = { v: '', t: 's' };
                
                if(R === 0) {
                    attendanceWs[cellRef] = { ...attendanceWs[cellRef], ...headerStyle };
                } else {
                    attendanceWs[cellRef] = { ...attendanceWs[cellRef], ...(R % 2 === 0 ? alternateRowStyle : dataStyle) };
                }
            }
        }
        
        XLSX.utils.book_append_sheet(wb, attendanceWs, "签到记录");
    }
    
    // 6. 导出请假记录
    const leaveRecords = JSON.parse(localStorage.getItem('leaveRecords') || '{}');
    const leaveHeaders = ['学生ID', '姓名', '课程', '开始日期', '结束日期', '请假天数', '请假原因', '申请时间'];
    const leaveRows = [];
    
    Object.keys(leaveRecords).forEach(studentId => {
        const student = students.find(s => s.id == studentId);
        if (student) {
            leaveRecords[studentId].forEach(leave => {
                const startDate = new Date(leave.startDate);
                const endDate = new Date(leave.endDate);
                const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                
                leaveRows.push([
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
    
    if (leaveRows.length > 0) {
        const leaveWs = XLSX.utils.aoa_to_sheet([leaveHeaders, ...leaveRows]);
        leaveWs['!cols'] = [10, 12, 15, 12, 12, 10, 25, 20].map(width => ({ wch: width }));
        leaveWs['!rows'] = Array(leaveRows.length + 1).fill({ hpt: 25 });
        
        const leaveRange = XLSX.utils.decode_range(leaveWs['!ref']);
        for(let R = leaveRange.s.r; R <= leaveRange.e.r; R++) {
            for(let C = leaveRange.s.c; C <= leaveRange.e.c; C++) {
                const cellRef = XLSX.utils.encode_cell({r: R, c: C});
                if(!leaveWs[cellRef]) leaveWs[cellRef] = { v: '', t: 's' };
                
                if(R === 0) {
                    leaveWs[cellRef] = { ...leaveWs[cellRef], ...headerStyle };
                } else {
                    leaveWs[cellRef] = { ...leaveWs[cellRef], ...(R % 2 === 0 ? alternateRowStyle : dataStyle) };
                }
            }
        }
        
        XLSX.utils.book_append_sheet(wb, leaveWs, "请假记录");
    }
    
    // 7. 导出课程信息
    const courseHeaders = ['课程ID', '课程名称', '级别', '描述', '课程容量', '已报名人数'];
    const courseRows = JSON.parse(localStorage.getItem('courses') || '[]')
        .map(course => [
            course.id,
            course.name,
            course.level,
            course.description || '-',
            course.capacity || 20,
            course.enrollCount || 0
        ]);
    
    if (courseRows.length > 0) {
        const courseWs = XLSX.utils.aoa_to_sheet([courseHeaders, ...courseRows]);
        courseWs['!cols'] = [10, 15, 10, 35, 12, 12].map(width => ({ wch: width }));
        courseWs['!rows'] = Array(courseRows.length + 1).fill({ hpt: 25 });
        
        const courseRange = XLSX.utils.decode_range(courseWs['!ref']);
        for(let R = courseRange.s.r; R <= courseRange.e.r; R++) {
            for(let C = courseRange.s.c; C <= courseRange.e.c; C++) {
                const cellRef = XLSX.utils.encode_cell({r: R, c: C});
                if(!courseWs[cellRef]) courseWs[cellRef] = { v: '', t: 's' };
                
                if(R === 0) {
                    courseWs[cellRef] = { ...courseWs[cellRef], ...headerStyle };
                } else {
                    courseWs[cellRef] = { ...courseWs[cellRef], ...(R % 2 === 0 ? alternateRowStyle : dataStyle) };
                }
            }
        }
        
        XLSX.utils.book_append_sheet(wb, courseWs, "课程信息");
    }
    
    // 8. 导出积分商城商品
    const productsHeaders = ['商品ID', '商品名称', '商品类别', '所需积分', '库存数量', '商品描述', '图片URL'];
    const productsData = JSON.parse(localStorage.getItem('pointsStoreProducts') || '[]');
    const productsRows = productsData.map(product => [
        product.id,
        product.name,
        product.category || '未分类',
        product.points,
        product.stock,
        product.description || '-',
        product.image || '-'
    ]);
    
    if (productsRows.length > 0) {
        const productsWs = XLSX.utils.aoa_to_sheet([productsHeaders, ...productsRows]);
        productsWs['!cols'] = [15, 15, 12, 10, 10, 30, 30].map(width => ({ wch: width }));
        productsWs['!rows'] = Array(productsRows.length + 1).fill({ hpt: 25 });
        
        const productsRange = XLSX.utils.decode_range(productsWs['!ref']);
        for(let R = productsRange.s.r; R <= productsRange.e.r; R++) {
            for(let C = productsRange.s.c; C <= productsRange.e.c; C++) {
                const cellRef = XLSX.utils.encode_cell({r: R, c: C});
                if(!productsWs[cellRef]) productsWs[cellRef] = { v: '', t: 's' };
                
                if(R === 0) {
                    productsWs[cellRef] = { ...productsWs[cellRef], ...headerStyle };
                } else {
                    productsWs[cellRef] = { ...productsWs[cellRef], ...(R % 2 === 0 ? alternateRowStyle : dataStyle) };
                }
            }
        }
        
        XLSX.utils.book_append_sheet(wb, productsWs, "积分商城商品");
    }

    // 导出Excel文件
    const excelBuffer = XLSX.write(wb, { 
        bookType: 'xlsx', 
        type: 'array',
        cellStyles: true,
        bookSST: true
    });
    const excelBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    await saveFile(dirHandle, `${baseFileName}.xlsx`, excelBlob);
}

// 保存文件到指定目录的函数
async function saveFile(dirHandle, fileName, blob) {
    try {
        const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
    } catch (err) {
        throw new Error(`保存文件 ${fileName} 失败：${err.message}`);
    }
}

// 导入数据
async function importData(file) {
    try {
        const data = await readFileAsync(file);
        const parsedData = JSON.parse(data);
        
        // 验证数据格式
        if (!parsedData.version || !parsedData.exportDate) {
            throw new Error('无效的备份文件格式');
        }

        // 确认导入
        const confirmed = window.confirm('导入将覆盖现有数据，是否继续？');
        if (confirmed) {
            // 保存所有数据到localStorage
            if (parsedData.students) localStorage.setItem('students', JSON.stringify(parsedData.students));
            if (parsedData.courses) localStorage.setItem('courses', JSON.stringify(parsedData.courses));
            if (parsedData.transactions) localStorage.setItem('transactions', JSON.stringify(parsedData.transactions));
            if (parsedData.schedule) localStorage.setItem('schedule', JSON.stringify(parsedData.schedule));
            if (parsedData.attendance) localStorage.setItem('attendance', JSON.stringify(parsedData.attendance));
            if (parsedData.leaveRecords) localStorage.setItem('leaveRecords', JSON.stringify(parsedData.leaveRecords));
            if (parsedData.pointsStoreProducts) localStorage.setItem('pointsStoreProducts', JSON.stringify(parsedData.pointsStoreProducts));

            // 更新页面显示
            updateStats(
                parsedData.students ? parsedData.students.length : 0,
                parsedData.courses ? parsedData.courses.length : 0
            );
            updateSchedule();

            alert('数据导入成功！');
        }
    } catch (error) {
        alert('导入失败：' + error.message);
    }
}

// 将 FileReader 包装成 Promise
function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsText(file);
    });
}

// 更新统计数据
function updateStats(studentCount, courseCount) {
    document.getElementById('totalStudents').textContent = studentCount;
    document.getElementById('totalCourses').textContent = courseCount;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    setupSidebarToggle();
    
    // 添加课程表导出按钮
    const scheduleSection = document.querySelector('.schedule-section');
    if (scheduleSection) {
        // 创建一个容器div来包含课程表标题和导出按钮
        const headerContainer = document.createElement('div');
        headerContainer.style.display = 'flex';
        headerContainer.style.justifyContent = 'space-between';
        headerContainer.style.alignItems = 'center';
        headerContainer.style.marginBottom = '1rem';

        // 创建标题元素
        const title = document.createElement('h2');
        title.textContent = '课程表';
        headerContainer.appendChild(title);

        // 创建导出按钮
        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn btn-primary';
        exportBtn.style.padding = '0.5rem 1rem';
        exportBtn.innerHTML = '<i class="fas fa-download"></i> 导出课程表';
        exportBtn.onclick = exportSchedule;
        headerContainer.appendChild(exportBtn);

        // 将原有的课程表标题替换为新的headerContainer
        const oldTitle = scheduleSection.querySelector('h2');
        if (oldTitle) {
            scheduleSection.replaceChild(headerContainer, oldTitle);
        } else {
            scheduleSection.insertBefore(headerContainer, scheduleSection.firstChild);
        }
    }
});

// 导出课程表
async function exportSchedule() {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
    const baseFileName = `少儿编程机构课程表_${dateStr}_${timeStr}`;

    try {
        // 获取用户选择的目录句柄
        const dirHandle = await window.showDirectoryPicker({
            id: 'schedule',
            mode: 'readwrite',
            startIn: 'downloads'
        });

        // 创建Canvas
        const scheduleCanvas = document.createElement('canvas');
        const ctx = scheduleCanvas.getContext('2d');
        
        // 设置画布大小
        scheduleCanvas.width = 1400;
        scheduleCanvas.height = 800;
        
        // 设置背景色
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, scheduleCanvas.width, scheduleCanvas.height);
        
        // 设置标题
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 24px Arial';
        const title = `壹零贰肆少儿编程机构 ${dateStr} 课程表`;
        const titleWidth = ctx.measureText(title).width;
        ctx.fillText(title, (scheduleCanvas.width - titleWidth) / 2, 50);
        
        // 定义表格参数
        const startX = 50;
        const startY = 100;
        const timeColWidth = 150;
        const dayColWidth = 170;
        const rowHeight = 60;
        const headerBgColor = '#f5f5f5';  // 表头背景色
        
        // 定义时间段
        const timeSlots = [
            '时间段',
            '08:00-10:00',
            '10:00-12:00',
            '14:30-16:30',
            '16:30-18:30',
            '18:30-20:00'
        ];
        
        // 定义星期
        const weekDays = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];

        // 从当前课程表中获取数据
        const scheduleData = {};
        const scheduleTable = document.querySelector('.schedule-table');
        if (scheduleTable) {
            const rows = scheduleTable.querySelectorAll('tr');
            rows.forEach((row, rowIndex) => {
                if (rowIndex === 0) return; // 跳过表头行
                const timeSlot = timeSlots[rowIndex];
                scheduleData[timeSlot] = {};
                
                const cells = row.querySelectorAll('td');
                cells.forEach((cell, cellIndex) => {
                    if (cellIndex === 0) return; // 跳过时间段列
                    const day = weekDays[cellIndex - 1];
                    const select = cell.querySelector('select');
                    const courseName = select ? select.options[select.selectedIndex].text.trim() : '';
                    const cellStyle = window.getComputedStyle(cell);
                    const backgroundColor = cellStyle.backgroundColor;
                    
                    scheduleData[timeSlot][day] = {
                        name: courseName === ' ' ? '-' : courseName,
                        color: backgroundColor
                    };
                });
            });
        }
        
        // 绘制表格边框和表头
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.font = 'bold 16px Arial';
        
        // 绘制时间列
        timeSlots.forEach((time, index) => {
            const y = startY + index * rowHeight;
            
            // 绘制单元格背景 - 所有时间格子使用表头背景色
            ctx.fillStyle = headerBgColor;
            ctx.fillRect(startX, y, timeColWidth, rowHeight);
            
            // 绘制边框
            ctx.strokeRect(startX, y, timeColWidth, rowHeight);
            
            // 绘制文字
            ctx.fillStyle = '#333333';
            const textWidth = ctx.measureText(time).width;
            ctx.fillText(time, startX + (timeColWidth - textWidth) / 2, y + rowHeight / 2 + 6);
        });
        
        // 绘制星期列和课程内容
        weekDays.forEach((day, dayIndex) => {
            const x = startX + timeColWidth + dayIndex * dayColWidth;
            
            // 绘制表头
            ctx.fillStyle = headerBgColor;
            ctx.fillRect(x, startY, dayColWidth, rowHeight);
            ctx.strokeRect(x, startY, dayColWidth, rowHeight);
            
            // 绘制星期文字
            ctx.fillStyle = '#333333';
            ctx.font = 'bold 16px Arial';  // 确保星期文字加粗
            const dayWidth = ctx.measureText(day).width;
            ctx.fillText(day, x + (dayColWidth - dayWidth) / 2, startY + rowHeight / 2 + 6);
            
            // 绘制每个时间段的课程
            for (let timeIndex = 1; timeIndex < timeSlots.length; timeIndex++) {
                const y = startY + timeIndex * rowHeight;
                const timeSlot = timeSlots[timeIndex];
                const courseInfo = scheduleData[timeSlot]?.[day];
                
                // 设置单元格背景色
                ctx.fillStyle = courseInfo?.color || '#ffffff';
                ctx.fillRect(x, y, dayColWidth, rowHeight);
                
                // 绘制边框
                ctx.strokeRect(x, y, dayColWidth, rowHeight);
                
                // 绘制课程名称
                if (courseInfo?.name) {
                    ctx.fillStyle = '#333333';
                    ctx.font = 'bold 14px Arial';  // 课程名称加粗
                    const text = courseInfo.name;
                    const textWidth = ctx.measureText(text).width;
                    
                    // 如果文字过长，进行截断
                    let displayText = text;
                    if (textWidth > dayColWidth - 20) {
                        while (ctx.measureText(displayText + '...').width > dayColWidth - 20) {
                            displayText = displayText.slice(0, -1);
                        }
                        displayText += '...';
                    }
                    
                    ctx.fillText(
                        displayText,
                        x + (dayColWidth - ctx.measureText(displayText).width) / 2,
                        y + rowHeight / 2 + 6
                    );
                }
            }
        });
        
        // 将Canvas转换为PNG图片并保存
        const pngBlob = await new Promise(resolve => {
            scheduleCanvas.toBlob(resolve, 'image/png');
        });
        await saveFile(dirHandle, `${baseFileName}.png`, pngBlob);
        
        alert('课程表导出成功！');
    } catch (err) {
        if (err.name !== 'AbortError') {
            alert('导出失败：' + err.message);
        }
    }
} 