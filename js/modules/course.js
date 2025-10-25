// 课程数据存储
let courses = [];

// 初始化数据
function initializeData() {
    // 从localStorage获取数据，如果没有则使用默认数据
    const savedCourses = localStorage.getItem('courses');
    if (savedCourses) {
        courses = JSON.parse(savedCourses);
        
        // 更新所有课程的容量为20
        let needsUpdate = false;
        courses.forEach(course => {
            if (course.capacity !== 20) {
                course.capacity = 20;
                needsUpdate = true;
            }
        });
        
        // 检查是否需要添加新课程
        const existingCourseNames = courses.map(course => course.name);
        if (!existingCourseNames.includes('校内辅导课')) {
            // 添加新课程
            const newCourse = {
                id: Math.max(...courses.map(c => c.id)) + 1,
                name: '校内辅导课',
                level: '初级',
                description: '校内辅导课程，针对学校课程进行辅导和答疑',
                capacity: 20,
                enrollCount: 0
            };
            courses.push(newCourse);
            needsUpdate = true;
        }
        
        // 如果有更新，保存到localStorage
        if (needsUpdate) {
            localStorage.setItem('courses', JSON.stringify(courses));
        }
    } else {
        // 默认数据
        courses = [
            {
                id: 1,
                name: 'Scratch基础班',
                level: '初级',
                description: '图形化编程入门课程，适合8-12岁零基础学员',
                capacity: 20,
                enrollCount: 0
            },
            {
                id: 2,
                name: 'Scratch进阶班',
                level: '中级',
                description: '进阶课程，学习复杂项目开发，适合已掌握Scratch基础的学员',
                capacity: 20,
                enrollCount: 0
            },
            {
                id: 3,
                name: 'Python基础班',
                level: '初级',
                description: 'Python编程基础语法与简单应用开发，适合12岁以上零基础学员',
                capacity: 20,
                enrollCount: 0
            },
            {
                id: 4,
                name: 'Python进阶班',
                level: '中级',
                description: 'Python高级特性与项目实战，适合已掌握Python基础的学员',
                capacity: 20,
                enrollCount: 0
            },
            {
                id: 5,
                name: 'Web开发班',
                level: '中级',
                description: 'HTML、CSS和JavaScript基础，网站开发实战课程',
                capacity: 20,
                enrollCount: 0
            },
            {
                id: 6,
                name: '游戏开发班',
                level: '中级',
                description: '使用Unity引擎开发2D和3D游戏，需要编程基础',
                capacity: 20,
                enrollCount: 0
            },
            {
                id: 7,
                name: 'C++语法基础班',
                level: '初级',
                description: 'C++编程基础语法，适合12岁以上零基础学员',
                capacity: 20,
                enrollCount: 0
            },
            {
                id: 8,
                name: 'C++算法基础班',
                level: '中级',
                description: '基础算法与数据结构，需要C++语法基础',
                capacity: 20,
                enrollCount: 0
            },
            {
                id: 9,
                name: 'C++算法进阶班',
                level: '初级',
                description: '校内无人机，scratch编程课程',
                capacity: 20,
                enrollCount: 0
            },
            {
                id: 10,
                name: '竞赛辅导班',
                level: '高级',
                description: '信息学奥赛、蓝桥杯等比赛辅导，需要较好的算法基础',
                capacity: 20,
                enrollCount: 0
            },
            {
                id: 11,
                name: '校内辅导课',
                level: '初级',
                description: '校内辅导课程，针对学校课程进行辅导和答疑',
                capacity: 20,
                enrollCount: 0
            },
        ];
        // 保存到localStorage
        localStorage.setItem('courses', JSON.stringify(courses));
    }
    // 更新课程报名人数
    updateEnrollmentCount();
}

// 更新课程报名人数
function updateEnrollmentCount() {
    // 获取学生数据
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    
    // 重置所有课程的报名人数
    courses.forEach(course => {
        course.enrollCount = 0;
    });
    
    // 统计每个课程的报名人数
    students.forEach(student => {
        const course = courses.find(c => c.name === student.course);
        if (course) {
            course.enrollCount++;
        }
    });
    
    // 保存更新后的课程数据
    localStorage.setItem('courses', JSON.stringify(courses));
    
    // 如果在课程管理页面，更新显示
    if (document.getElementById('courseTableBody')) {
        updateCourseList();
    }
}

// 获取所有课程列表
function getAllCourses() {
    // 确保courses数据已初始化
    if (courses.length === 0) {
        const savedCourses = localStorage.getItem('courses');
        if (savedCourses) {
            courses = JSON.parse(savedCourses);
        }
    }
    return courses;
}

// 更新课程列表显示
function updateCourseList(coursesToShow = courses) {
    const tableBody = document.getElementById('courseTableBody');
    if (!tableBody) return; // 如果不在课程管理页面，直接返回

    tableBody.innerHTML = '';
    coursesToShow.forEach(course => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${course.id}</td>
            <td>${course.name}</td>
            <td><span class="course-level ${getLevelClass(course.level)}">${course.level}</span></td>
            <td>${course.description}</td>
            <td>${course.capacity}</td>
            <td>${course.enrollCount}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editCourse(${course.id})">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="btn-delete" onclick="deleteCourse(${course.id})">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// 获取课程级别对应的样式类
function getLevelClass(level) {
    switch(level) {
        case '初级':
            return 'beginner';
        case '中级':
            return 'intermediate';
        case '高级':
            return 'advanced';
        default:
            return 'beginner';
    }
}

// 添加新课程
function addCourse(courseData) {
    const newId = courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1;
    const newCourse = {
        id: newId,
        enrollCount: 0,
        ...courseData
    };
    courses.push(newCourse);
    localStorage.setItem('courses', JSON.stringify(courses));
    updateCourseList();
}

// 编辑课程
function editCourse(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (course) {
        const modal = document.getElementById('courseModal');
        const form = document.getElementById('courseForm');
        const modalTitle = modal.querySelector('.modal-header h3');

        // 填充表单数据
        document.getElementById('courseId').value = course.id;
        document.getElementById('courseName').value = course.name;
        document.getElementById('courseLevel').value = course.level;
        document.getElementById('courseDescription').value = course.description;
        document.getElementById('courseCapacity').value = course.capacity;

        // 更改模态框标题
        modalTitle.textContent = '编辑课程';

        // 显示模态框
        modal.style.display = 'block';

        // 更新表单提交处理
        form.onsubmit = (e) => {
            e.preventDefault();
            const updatedCourse = {
                id: parseInt(document.getElementById('courseId').value),
                name: document.getElementById('courseName').value,
                level: document.getElementById('courseLevel').value,
                description: document.getElementById('courseDescription').value,
                capacity: parseInt(document.getElementById('courseCapacity').value),
                enrollCount: course.enrollCount
            };

            // 更新课程数据
            const index = courses.findIndex(c => c.id === courseId);
            courses[index] = updatedCourse;
            localStorage.setItem('courses', JSON.stringify(courses));
            
            // 更新显示并关闭模态框
            updateCourseList();
            modal.style.display = 'none';
        };
    }
};

// 删除课程
window.deleteCourse = function(courseId) {
    if (confirm('确定要删除这个课程吗？')) {
        courses = courses.filter(c => c.id !== courseId);
        localStorage.setItem('courses', JSON.stringify(courses));
        updateCourseList();
    }
};

// 搜索和筛选功能
function filterCourses() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const levelFilter = document.getElementById('levelFilter').value;

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.name.toLowerCase().includes(searchTerm) ||
                            course.description.toLowerCase().includes(searchTerm);
        const matchesLevel = !levelFilter || course.level === levelFilter;
        return matchesSearch && matchesLevel;
    });

    updateCourseList(filteredCourses);
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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    
    // 如果在课程管理页面，设置事件监听器
    if (document.getElementById('courseTableBody')) {
        updateCourseList();
        
        // 添加课程按钮点击事件
        const addCourseBtn = document.getElementById('addCourseBtn');
        const modal = document.getElementById('courseModal');
        const form = document.getElementById('courseForm');
        const closeBtn = modal.querySelector('.close-btn');
        const cancelBtn = document.getElementById('cancelBtn');

        if (addCourseBtn) {
            addCourseBtn.onclick = () => {
                const modalTitle = modal.querySelector('.modal-header h3');
                modalTitle.textContent = '添加课程';
                form.reset();
                modal.style.display = 'block';

                // 设置表单提交处理
                form.onsubmit = (e) => {
                    e.preventDefault();
                    const newCourse = {
                        name: document.getElementById('courseName').value,
                        level: document.getElementById('courseLevel').value,
                        description: document.getElementById('courseDescription').value,
                        capacity: parseInt(document.getElementById('courseCapacity').value)
                    };
                    addCourse(newCourse);
                    modal.style.display = 'none';
                };
            };
        }

        // 关闭模态框
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
            };
        }

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

        // 搜索和筛选事件监听
        const searchInput = document.getElementById('searchInput');
        const levelFilter = document.getElementById('levelFilter');
        
        if (searchInput) {
            searchInput.addEventListener('input', filterCourses);
        }
        
        if (levelFilter) {
            levelFilter.addEventListener('change', filterCourses);
        }
    }

    setupSidebarToggle();
});

// 导出函数供其他模块使用
window.getAllCourses = getAllCourses;
window.updateEnrollmentCount = updateEnrollmentCount;
window.editCourse = editCourse;
window.deleteCourse = deleteCourse; 