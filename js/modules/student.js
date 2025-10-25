// 学生数据存储
let students = [];

// 初始化数据
function initializeData() {
    // 从localStorage获取数据，如果没有则使用默认数据
    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
        students = JSON.parse(savedStudents);
        // 确保所有已存在的学生数据都有consumeRecords和points字段
        students = students.map(student => ({
            ...student,
            consumeRecords: student.consumeRecords || [],
            points: student.points || 0,
            pointsHistory: student.pointsHistory || []
        }));
        // 更新localStorage
        localStorage.setItem('students', JSON.stringify(students));
    } else {
        // 默认数据
        students = [
            {
                id: 1,
                name: '张三',
                gender: '男',
                age: 12,
                school: '第一实验小学',
                parentName: '张明',
                parentPhone: '13800138000',
                course: 'Scratch',
                remainingHours: 20,
                consumeRecords: [],
                points: 0,
                pointsHistory: []
            },
            {
                id: 2,
                name: '李四',
                gender: '女',
                age: 11,
                school: '第二实验小学',
                parentName: '李华',
                parentPhone: '13900139000',
                course: 'Python',
                remainingHours: 15,
                consumeRecords: [],
                points: 0,
                pointsHistory: []
            },
            {
                id: 3,
                name: '王五',
                gender: '男',
                age: 13,
                school: '第三实验小学',
                parentName: '王强',
                parentPhone: '13700137000',
                course: 'C++',
                remainingHours: 10,
                consumeRecords: [],
                points: 0,
                pointsHistory: []
            }
        ];
        localStorage.setItem('students', JSON.stringify(students));
    }
}

// 更新学生列表显示
function updateStudentTable(filteredStudents = students) {
    const tableBody = document.getElementById('studentTableBody');
    tableBody.innerHTML = '';

    // 按ID升序排序
    const sortedStudents = [...filteredStudents].sort((a, b) => parseInt(a.id) - parseInt(b.id));

    sortedStudents.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.gender}</td>
            <td>${student.age}</td>
            <td>${student.school}</td>
            <td>${student.parentName}</td>
            <td>${student.parentPhone}</td>
            <td>${student.course}</td>
            <td>${student.remainingHours}</td>
            <td class="action-buttons">
                <button class="btn-view" onclick="viewStudentDetails(${student.id})">
                    <i class="fas fa-eye"></i> 查看详情
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// 更新课程选择下拉框
function updateCourseSelect() {
    const courseSelect = document.getElementById('studentCourse');
    const filterSelect = document.getElementById('courseFilter');
    
    // 清空现有选项
    courseSelect.innerHTML = '';
    filterSelect.innerHTML = '<option value="">所有课程</option>';
    
    // 获取课程列表
    const courses = window.getAllCourses();
    
    // 添加课程选项
    courses.forEach(course => {
        // 添加到学生表单的课程选择
        const option = document.createElement('option');
        option.value = course.name;
        option.textContent = course.name;
        courseSelect.appendChild(option);
        
        // 添加到筛选下拉框
        const filterOption = document.createElement('option');
        filterOption.value = course.name;
        filterOption.textContent = course.name;
        filterSelect.appendChild(filterOption);
    });
}

// 在添加或编辑学生后更新课程报名人数
function updateCourseEnrollment() {
    if (typeof window.updateEnrollmentCount === 'function') {
        window.updateEnrollmentCount();
    }
}

// 修改添加学生函数
function addStudent(studentData) {
    const newStudent = {
        ...studentData,
        id: parseInt(studentData.id),
        consumeRecords: [],
        points: 0,
        pointsHistory: []
    };
    students.push(newStudent);
    localStorage.setItem('students', JSON.stringify(students));
    updateStudentTable();
    updateCourseEnrollment(); // 更新课程报名人数
}

// 修改编辑学生函数中的表单提交处理
window.editStudent = function(studentId) {
    const student = students.find(s => s.id === studentId);
    if (student) {
        const modal = document.getElementById('studentModal');
        const form = document.getElementById('studentForm');
        const modalTitle = modal.querySelector('.modal-header h3');

        // 确保课程选项是最新的
        updateCourseSelect();

        // 填充表单数据
        document.getElementById('studentId').value = student.id;
        document.getElementById('studentName').value = student.name;
        document.getElementById('studentGender').value = student.gender;
        document.getElementById('studentAge').value = student.age;
        document.getElementById('studentSchool').value = student.school;
        document.getElementById('parentName').value = student.parentName;
        document.getElementById('parentPhone').value = student.parentPhone;
        document.getElementById('studentCourse').value = student.course;
        document.getElementById('remainingHours').value = student.remainingHours;

        // 更改模态框标题
        modalTitle.textContent = '编辑学生';

        // 显示模态框
        modal.style.display = 'block';

        // 更新表单提交处理
        form.onsubmit = (e) => {
            e.preventDefault();
            const updatedStudent = {
                id: parseInt(document.getElementById('studentId').value),
                name: document.getElementById('studentName').value,
                gender: document.getElementById('studentGender').value,
                age: parseInt(document.getElementById('studentAge').value),
                school: document.getElementById('studentSchool').value,
                parentName: document.getElementById('parentName').value,
                parentPhone: document.getElementById('parentPhone').value,
                course: document.getElementById('studentCourse').value,
                remainingHours: parseFloat(document.getElementById('remainingHours').value),
                consumeRecords: student.consumeRecords || [],
                points: student.points || 0,
                pointsHistory: student.pointsHistory || []
            };

            // 更新学生数据
            const index = students.findIndex(s => s.id === studentId);
            students[index] = updatedStudent;
            localStorage.setItem('students', JSON.stringify(students));
            
            // 更新显示并关闭模态框
            updateStudentTable();
            updateCourseEnrollment(); // 更新课程报名人数
            modal.style.display = 'none';
        };
    }
};

// 修改删除学生函数
window.deleteStudent = function(studentId) {
    if (confirm('确定要删除这个学生吗？')) {
        students = students.filter(s => s.id !== studentId);
        localStorage.setItem('students', JSON.stringify(students));
        updateStudentTable();
        updateCourseEnrollment(); // 更新课程报名人数
    }
};

// 搜索和筛选功能
function filterStudents() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const courseFilter = document.getElementById('courseFilter').value;

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm);
        const matchesCourse = !courseFilter || student.course === courseFilter;
        return matchesSearch && matchesCourse;
    });

    updateStudentTable(filteredStudents);
}

// 侧边栏切换功能
function setupSidebarToggle() {
    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            mainContent.classList.toggle('active');
        });
    }
}

// 导出消课记录为CSV
function exportConsumeRecords(student) {
    // 准备CSV数据
    const headers = ['日期', '课时', '备注'];
    const rows = student.consumeRecords.map(record => [
        record.date,
        record.hours,
        record.note || ''
    ]);
    
    // 按日期降序排序
    rows.sort((a, b) => new Date(b[0]) - new Date(a[0]));
    
    // 添加表头信息
    const headerInfo = [
        [`学生姓名: ${student.name}`],
        [`剩余课时: ${student.remainingHours}`],
        [] // 空行
    ];
    
    // 合并所有数据
    const csvData = [
        ...headerInfo,
        headers,
        ...rows
    ];
    
    // 转换为CSV格式
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // 创建Blob对象
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8' });
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${student.name}_消课记录_${new Date().toLocaleDateString()}.csv`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 添加消课记录时生成唯一ID
window.consumeHours = function(studentId) {
    currentStudentId = studentId;
    const student = students.find(s => s.id === studentId);
    if (student) {
        const modal = document.getElementById('consumeModal');
        const form = document.getElementById('consumeForm');
        
        // 设置默认日期为今天
        document.getElementById('consumeDate').valueAsDate = new Date();
        
        // 设置查看历史记录按钮事件
        const viewHistoryBtn = document.getElementById('viewHistoryBtn');
        if (viewHistoryBtn) {
            viewHistoryBtn.onclick = () => {
                modal.style.display = 'none';  // 隐藏消课模态框
                const historyModal = document.getElementById('historyModal');
                document.getElementById('historyStudentName').textContent = student.name;
                document.getElementById('historyRemainingHours').textContent = student.remainingHours;
                updateConsumeHistory(student);
                historyModal.style.display = 'block';
            };
        }
        
        // 设置关闭按钮事件
        const closeBtn = modal.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
            };
        }
        
        // 设置取消按钮事件
        const cancelBtn = document.getElementById('cancelConsumeBtn');
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                modal.style.display = 'none';
            };
        }
        
        // 点击模态框外部关闭
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
        
        form.onsubmit = (e) => {
            e.preventDefault();
            const operation = document.getElementById('courseOperation').value;
            const consumeDate = document.getElementById('consumeDate').value;
            const hours = parseFloat(document.getElementById('consumeHours').value);
            const note = document.getElementById('consumeNote').value.trim();

            if (operation === 'consume' && hours > student.remainingHours) {
                alert('消课课时不能大于剩余课时！');
                return;
            }

            // 生成记录ID
            const recordId = generateId();

            // 更新课时
            if (operation === 'consume') {
                student.remainingHours = parseFloat((student.remainingHours - hours).toFixed(1));
                
                // 计算积分奖励
                let pointsToAdd = 0;
                if (hours === 1) {
                    pointsToAdd = 5;
                } else if (hours === 1.5) {
                    pointsToAdd = 7.5;
                } else if (hours === 2) {
                    pointsToAdd = 10;
                } else if (hours === 3) {
                    pointsToAdd = 15;
                } else if (hours === 4) {
                    pointsToAdd = 20;
                } else {
                    pointsToAdd = hours * 5;
                }
                
                student.points = (student.points || 0) + pointsToAdd;
                
                // 添加积分历史记录，包含关联ID
                student.pointsHistory = student.pointsHistory || [];
                student.pointsHistory.push({
                    id: generateId(),
                    consumeRecordId: recordId, // 添加关联ID
                    date: consumeDate,
                    change: pointsToAdd,
                    note: `消课${hours}课时奖励积分`
                });
            } else {
                student.remainingHours = parseFloat((student.remainingHours + hours).toFixed(1));
            }

            // 添加消课记录
            student.consumeRecords = student.consumeRecords || [];
            student.consumeRecords.push({
                id: recordId,
                date: consumeDate,
                hours: operation === 'consume' ? -hours : hours,
                note: note || (operation === 'consume' ? '消课' : '增加课时')
            });

            // 保存数据
            localStorage.setItem('students', JSON.stringify(students));
            
            // 更新显示
            updateStudentTable();
            updateConsumeHistory(student);
            
            // 关闭模态框
            modal.style.display = 'none';
            
            // 重置表单
            form.reset();
            document.getElementById('courseOperation').value = 'consume';
        };

        // 显示模态框
        modal.style.display = 'block';
    }
};

// 更新消课历史记录显示
function updateConsumeHistory(student) {
    const historyTableBody = document.getElementById('consumeHistoryTableBody');
    if (!historyTableBody) return;
    
    historyTableBody.innerHTML = '';
    
    if (!student.consumeRecords || student.consumeRecords.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" style="text-align: center;">暂无消课记录</td>';
        historyTableBody.appendChild(row);
        return;
    }
    
    // 按日期降序排序（最新的在最前面）
    const sortedRecords = [...student.consumeRecords].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        // 如果日期相同，使用ID来确保最新添加的记录在上面
        if (dateA.getTime() === dateB.getTime()) {
            return b.id.localeCompare(a.id);
        }
        return dateB - dateA;
    });
    
    sortedRecords.forEach(record => {
        const row = document.createElement('tr');
        const hoursClass = record.hours > 0 ? 'text-success' : 'text-danger';
        const hoursPrefix = record.hours > 0 ? '+' : '';
        
        row.innerHTML = `
            <td>${record.date}</td>
            <td class="${hoursClass}">${hoursPrefix}${Math.abs(record.hours)}</td>
            <td>${record.note || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button onclick="editRecord('${record.id}')" class="btn-edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteRecord('${record.id}')" class="btn-delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        historyTableBody.appendChild(row);
    });
}

// 删除记录
window.deleteRecord = function(recordId) {
    if (!confirm('确定要删除这条记录吗？')) return;

    const student = students.find(s => s.id === currentStudentId);
    if (!student) return;

    // 找到要删除的记录
    const deletedRecord = student.consumeRecords.find(r => r.id === recordId);
    if (!deletedRecord) return;

    // 如果是消课记录（hours为负数），则需要删除对应的积分记录
    if (deletedRecord.hours < 0) {
        // 计算需要扣除的积分
        const hours = Math.abs(deletedRecord.hours);
        let pointsToDeduct = 0;
        
        if (hours === 1) {
            pointsToDeduct = 5;
        } else if (hours === 1.5) {
            pointsToDeduct = 7.5;
        } else if (hours === 2) {
            pointsToDeduct = 10;
        } else if (hours === 3) {
            pointsToDeduct = 15;
        } else if (hours === 4) {
            pointsToDeduct = 20;
        } else {
            pointsToDeduct = hours * 5;
        }
        
        // 更新学生积分
        student.points = Math.max(0, (student.points || 0) - pointsToDeduct);
        
        // 删除对应的积分历史记录（使用关联ID精确匹配）
        student.pointsHistory = (student.pointsHistory || []).filter(record => 
            record.consumeRecordId !== recordId
        );
    }

    // 恢复课时
    student.remainingHours = parseFloat((student.remainingHours - deletedRecord.hours).toFixed(1));

    // 删除消课记录
    student.consumeRecords = student.consumeRecords.filter(r => r.id !== recordId);

    // 保存到localStorage
    localStorage.setItem('students', JSON.stringify(students));

    // 更新显示
    updateStudentTable();
    updateConsumeHistory(student);
    
    // 更新历史记录模态框中的剩余课时显示
    const historyRemainingHours = document.getElementById('historyRemainingHours');
    if (historyRemainingHours) {
        historyRemainingHours.textContent = student.remainingHours;
    }
};

// 编辑记录（使用ID而不是日期）
window.editRecord = function(recordId) {
    const student = students.find(s => s.id === currentStudentId);
    if (!student) return;

    const record = student.consumeRecords.find(r => r.id === recordId);
    if (!record) return;

    const modal = document.getElementById('consumeModal');
    const form = document.getElementById('consumeForm');
    
    // 填充表单数据
    document.getElementById('consumeDate').value = record.date;
    document.getElementById('consumeHours').value = Math.abs(record.hours);
    document.getElementById('consumeNote').value = record.note || '';
    document.getElementById('courseOperation').value = record.hours < 0 ? 'consume' : 'add';
    
    // 删除旧记录
    student.consumeRecords = student.consumeRecords.filter(r => r.id !== recordId);
    
    // 恢复课时
    student.remainingHours = parseFloat((student.remainingHours - record.hours).toFixed(1));
    
    // 显示模态框
    modal.style.display = 'block';
};

// 添加全局变量
let currentStudentId = null;

// 事件监听器设置
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    updateCourseSelect(); // 初始化课程选择
    updateStudentTable();
    setupSidebarToggle();

    // 添加学生按钮点击事件
    const addStudentBtn = document.getElementById('addStudentBtn');
    const modal = document.getElementById('studentModal');
    const form = document.getElementById('studentForm');
    const closeBtn = document.querySelector('.close-btn');
    const cancelBtn = document.getElementById('cancelBtn');

    addStudentBtn.onclick = () => {
        const modalTitle = modal.querySelector('.modal-header h3');
        modalTitle.textContent = '添加学生';
        form.reset();
        updateCourseSelect(); // 确保课程选项是最新的
        modal.style.display = 'block';

        // 设置表单提交处理
        form.onsubmit = (e) => {
            e.preventDefault();
            const newStudent = {
                id: document.getElementById('studentId').value,
                name: document.getElementById('studentName').value,
                gender: document.getElementById('studentGender').value,
                age: parseInt(document.getElementById('studentAge').value),
                school: document.getElementById('studentSchool').value,
                parentName: document.getElementById('parentName').value,
                parentPhone: document.getElementById('parentPhone').value,
                course: document.getElementById('studentCourse').value,
                remainingHours: parseInt(document.getElementById('remainingHours').value)
            };
            addStudent(newStudent);
            modal.style.display = 'none';
        };
    };

    // 关闭模态框
    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    cancelBtn.onclick = () => {
        modal.style.display = 'none';
    };

    // 点击模态框外部关闭
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // 搜索和筛选事件监听
    document.getElementById('searchInput').addEventListener('input', filterStudents);
    document.getElementById('courseFilter').addEventListener('change', filterStudents);

    // 设置历史记录模态框的关闭按钮事件
    const historyModal = document.getElementById('historyModal');
    const historyCloseBtn = historyModal.querySelector('.close-btn');
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');

    historyCloseBtn.onclick = () => {
        historyModal.style.display = 'none';
    };

    closeHistoryBtn.onclick = () => {
        historyModal.style.display = 'none';
    };

    // 点击模态框外部关闭
    window.onclick = (event) => {
        if (event.target === historyModal) {
            historyModal.style.display = 'none';
        }
    };
});

// 查看学生详情
window.viewStudentDetails = function(studentId) {
    const student = students.find(s => s.id === studentId);
    if (student) {
        const modal = document.getElementById('studentDetailsModal');
        
        // 填充学生详情
        document.getElementById('detailId').textContent = student.id;
        document.getElementById('detailName').textContent = student.name;
        document.getElementById('detailGender').textContent = student.gender;
        document.getElementById('detailAge').textContent = student.age;
        document.getElementById('detailSchool').textContent = student.school;
        document.getElementById('detailParentName').textContent = student.parentName;
        document.getElementById('detailParentPhone').textContent = student.parentPhone;
        document.getElementById('detailCourse').textContent = student.course;
        document.getElementById('detailRemainingHours').textContent = student.remainingHours;
        document.getElementById('detailPoints').textContent = student.points || 0;

        // 设置积分管理按钮事件
        document.getElementById('managePointsBtn').onclick = () => {
            modal.style.display = 'none';
            managePoints(studentId);
        };

        // 设置消课按钮事件
        document.getElementById('consumeFromDetailsBtn').onclick = () => {
            modal.style.display = 'none';
            consumeHours(studentId);
        };

        // 设置编辑按钮事件
        document.getElementById('editFromDetailsBtn').onclick = () => {
            modal.style.display = 'none';
            editStudent(studentId);
        };

        // 设置删除按钮事件
        document.getElementById('deleteFromDetailsBtn').onclick = () => {
            if (confirm('确定要删除这个学生吗？')) {
                deleteStudent(studentId);
                modal.style.display = 'none';
            }
        };

        // 设置关闭按钮事件
        const closeBtn = modal.querySelector('.close-btn');
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };

        // 显示模态框
        modal.style.display = 'block';
    }
};

// 积分管理功能
window.managePoints = function(studentId) {
    currentStudentId = studentId;  // 保存当前学生ID
    const student = students.find(s => s.id === studentId);
    if (student) {
        const modal = document.getElementById('pointsModal');
        const form = document.getElementById('pointsForm');
        
        // 更新显示信息
        document.getElementById('pointsStudentName').textContent = student.name;
        document.getElementById('currentPoints').textContent = student.points || 0;
        
        // 设置查看历史记录按钮事件
        document.getElementById('viewPointsHistoryBtn').onclick = () => {
            modal.style.display = 'none';  // 隐藏积分管理模态框
            showPointsHistory(student);
        };
        
        // 设置表单提交事件
        form.onsubmit = (e) => {
            e.preventDefault();
            const operation = document.getElementById('pointsOperation').value;
            const change = parseInt(document.getElementById('pointsChange').value);
            const note = document.getElementById('pointsNote').value.trim();
            
            if (operation === 'subtract' && change > student.points) {
                alert('减少的积分不能大于当前积分！');
                return;
            }
            
            // 更新积分
            const pointsChange = operation === 'add' ? change : -change;
            student.points = (student.points || 0) + pointsChange;
            
            // 添加积分历史记录
            student.pointsHistory = student.pointsHistory || [];
            student.pointsHistory.push({
                id: generateId(), // 添加唯一ID
                date: new Date().toISOString().split('T')[0],
                change: pointsChange,
                note: note || (operation === 'add' ? '增加积分' : '减少积分')
            });
            
            // 保存数据
            localStorage.setItem('students', JSON.stringify(students));
            
            // 更新显示
            document.getElementById('currentPoints').textContent = student.points;
            document.getElementById('detailPoints').textContent = student.points;
            
            // 重置表单
            form.reset();
            document.getElementById('pointsOperation').value = 'add';  // 重置为默认值
        };
        
        // 设置取消按钮事件
        const cancelBtn = document.getElementById('cancelPointsBtn');
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                modal.style.display = 'none';
                viewStudentDetails(studentId);
            };
        }
        
        // 设置关闭按钮事件
        const closeBtn = modal.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
                viewStudentDetails(studentId);
            };
        }
        
        // 点击模态框外部关闭
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
                viewStudentDetails(studentId);
            }
        };
        
        // 显示模态框
        modal.style.display = 'block';
    }
};

// 显示积分历史记录
window.showPointsHistory = function(student) {
    if (!student) return;
    
    const pointsModal = document.getElementById('pointsModal');
    const historyModal = document.getElementById('pointsHistoryModal');
    
    // 更新显示信息
    const studentNameElement = document.getElementById('pointsHistoryStudentName');
    const currentPointsElement = document.getElementById('pointsHistoryCurrentPoints');
    
    if (studentNameElement) {
        studentNameElement.textContent = student.name;
    }
    
    if (currentPointsElement) {
        currentPointsElement.textContent = student.points || 0;
    }
    
    // 更新历史记录
    updatePointsHistory(student);
    
    // 设置关闭按钮事件
    const closeBtn = historyModal.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.onclick = () => {
            historyModal.style.display = 'none';
            if (pointsModal) {
                pointsModal.style.display = 'block';  // 重新显示积分管理模态框
            }
        };
    }
    
    // 设置底部关闭按钮事件
    const closeHistoryBtn = document.getElementById('closePointsHistoryBtn');
    if (closeHistoryBtn) {
        closeHistoryBtn.onclick = () => {
            historyModal.style.display = 'none';
            if (pointsModal) {
                pointsModal.style.display = 'block';  // 重新显示积分管理模态框
            }
        };
    }
    
    // 点击模态框外部关闭
    window.onclick = (event) => {
        if (event.target === historyModal) {
            historyModal.style.display = 'none';
            if (pointsModal) {
                pointsModal.style.display = 'block';  // 重新显示积分管理模态框
            }
        }
    };
    
    // 显示历史记录模态框
    if (historyModal) {
        historyModal.style.display = 'block';
    }
};

// 更新积分历史记录显示
function updatePointsHistory(student) {
    const historyTableBody = document.getElementById('pointsHistoryTableBody');
    if (!historyTableBody) return;
    
    historyTableBody.innerHTML = '';
    
    if (!student.pointsHistory || student.pointsHistory.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" style="text-align: center;">暂无积分记录</td>';
        historyTableBody.appendChild(row);
        return;
    }
    
    // 按日期降序排序（最新的在最前面）
    const sortedHistory = [...student.pointsHistory].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        // 如果日期相同，根据记录的顺序保持最新添加的在上面
        if (dateA.getTime() === dateB.getTime()) {
            return student.pointsHistory.indexOf(b) - student.pointsHistory.indexOf(a);
        }
        return dateB - dateA;
    });
    
    sortedHistory.forEach(record => {
        const row = document.createElement('tr');
        const pointsClass = record.change > 0 ? 'text-success' : 'text-danger';
        const pointsPrefix = record.change > 0 ? '+' : '';
        
        // 判断是否为消课获得的积分记录
        const isConsumePoints = record.consumeRecordId !== undefined;
        
        row.innerHTML = `
            <td>${record.date}</td>
            <td class="${pointsClass}">${pointsPrefix}${record.change}</td>
            <td>${record.note || '-'}</td>
            <td>
                <div class="action-buttons">
                    ${!isConsumePoints ? `
                        <button class="points-delete-btn" onclick="deletePointsRecord('${record.id}')">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    ` : ''}
                </div>
            </td>
        `;
        historyTableBody.appendChild(row);
    });
}

// 删除积分记录
window.deletePointsRecord = function(recordId) {
    if (!confirm('确定要删除这条记录吗？')) return;

    const student = students.find(s => s.id === currentStudentId);
    if (!student) return;

    // 找到要删除的记录
    const deletedRecord = student.pointsHistory.find(r => r.id === recordId);
    if (!deletedRecord) return;

    // 如果是消课获得的积分记录，则需要删除对应的消课记录
    if (deletedRecord.consumeRecordId !== undefined) {
        // 找到对应的消课记录
        const consumeRecord = student.consumeRecords.find(r => r.id === deletedRecord.consumeRecordId);
        if (consumeRecord) {
            // 恢复课时
            student.remainingHours = parseFloat((student.remainingHours + consumeRecord.hours).toFixed(1));
            
            // 删除消课记录
            student.consumeRecords = student.consumeRecords.filter(r => r.id !== consumeRecord.id);
        }
    }

    // 更新学生积分
    student.points = Math.max(0, (student.points || 0) - deletedRecord.change);
    
    // 删除积分历史记录
    student.pointsHistory = student.pointsHistory.filter(r => r.id !== recordId);

    // 保存到localStorage
    localStorage.setItem('students', JSON.stringify(students));

    // 更新显示
    document.getElementById('currentPoints').textContent = student.points;
    document.getElementById('detailPoints').textContent = student.points;
    
    // 重置表单
    document.getElementById('pointsOperation').value = 'add';  // 重置为默认值
};

// 事件监听器设置
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    updateCourseSelect(); // 初始化课程选择
    updateStudentTable();
    setupSidebarToggle();

    // 添加学生按钮点击事件
    const addStudentBtn = document.getElementById('addStudentBtn');
    const modal = document.getElementById('studentModal');
    const form = document.getElementById('studentForm');
    const closeBtn = document.querySelector('.close-btn');
    const cancelBtn = document.getElementById('cancelBtn');

    addStudentBtn.onclick = () => {
        const modalTitle = modal.querySelector('.modal-header h3');
        modalTitle.textContent = '添加学生';
        form.reset();
        updateCourseSelect(); // 确保课程选项是最新的
        modal.style.display = 'block';

        // 设置表单提交处理
        form.onsubmit = (e) => {
            e.preventDefault();
            const newStudent = {
                id: document.getElementById('studentId').value,
                name: document.getElementById('studentName').value,
                gender: document.getElementById('studentGender').value,
                age: parseInt(document.getElementById('studentAge').value),
                school: document.getElementById('studentSchool').value,
                parentName: document.getElementById('parentName').value,
                parentPhone: document.getElementById('parentPhone').value,
                course: document.getElementById('studentCourse').value,
                remainingHours: parseInt(document.getElementById('remainingHours').value)
            };
            addStudent(newStudent);
            modal.style.display = 'none';
        };
    };

    // 关闭模态框
    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    cancelBtn.onclick = () => {
        modal.style.display = 'none';
    };

    // 点击模态框外部关闭
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // 搜索和筛选事件监听
    document.getElementById('searchInput').addEventListener('input', filterStudents);
    document.getElementById('courseFilter').addEventListener('change', filterStudents);

    // 设置历史记录模态框的关闭按钮事件
    const historyModal = document.getElementById('historyModal');
    const historyCloseBtn = historyModal.querySelector('.close-btn');
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');

    historyCloseBtn.onclick = () => {
        historyModal.style.display = 'none';
    };

    closeHistoryBtn.onclick = () => {
        historyModal.style.display = 'none';
    };

    // 点击模态框外部关闭
    window.onclick = (event) => {
        if (event.target === historyModal) {
            historyModal.style.display = 'none';
        }
    };
});