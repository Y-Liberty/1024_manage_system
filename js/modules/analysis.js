// 获取数据
function getData() {
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    return { students, courses };
}

// 更新数据概览
function updateStatsOverview() {
    const { students, courses } = getData();

    // 更新总学生数
    document.getElementById('totalStudents').textContent = students.length;

    // 更新总课程数
    document.getElementById('totalCourses').textContent = courses.length;

    // 计算平均成绩
    const averageGrade = students.length > 0
        ? (students.reduce((sum, student) => sum + student.grade, 0) / students.length).toFixed(1)
        : 0;
    document.getElementById('averageGrade').textContent = averageGrade;

    // 计算课程报名率
    const totalCapacity = courses.reduce((sum, course) => sum + course.capacity, 0);
    const totalEnrolled = courses.reduce((sum, course) => sum + course.enrolled, 0);
    const enrollmentRate = totalCapacity > 0
        ? ((totalEnrolled / totalCapacity) * 100).toFixed(1)
        : 0;
    document.getElementById('enrollmentRate').textContent = enrollmentRate + '%';
}

// 创建课程报名情况图表
function createEnrollmentChart() {
    const { courses } = getData();
    const ctx = document.getElementById('enrollmentChart').getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: courses.map(course => course.name),
            datasets: [{
                label: '已报名人数',
                data: courses.map(course => course.enrolled),
                backgroundColor: 'rgba(52, 152, 219, 0.8)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 1
            }, {
                label: '课程容量',
                data: courses.map(course => course.capacity),
                backgroundColor: 'rgba(46, 204, 113, 0.8)',
                borderColor: 'rgba(46, 204, 113, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 创建成绩分布图表
function createGradeDistributionChart() {
    const { students } = getData();
    const ctx = document.getElementById('gradeDistributionChart').getContext('2d');

    // 计算成绩分布
    const gradeRanges = {
        '90-100': 0,
        '80-89': 0,
        '70-79': 0,
        '60-69': 0,
        '0-59': 0
    };

    students.forEach(student => {
        if (student.grade >= 90) gradeRanges['90-100']++;
        else if (student.grade >= 80) gradeRanges['80-89']++;
        else if (student.grade >= 70) gradeRanges['70-79']++;
        else if (student.grade >= 60) gradeRanges['60-69']++;
        else gradeRanges['0-59']++;
    });

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(gradeRanges),
            datasets: [{
                data: Object.values(gradeRanges),
                backgroundColor: [
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(241, 196, 15, 0.8)',
                    'rgba(231, 76, 60, 0.8)',
                    'rgba(155, 89, 182, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true
        }
    });
}

// 创建年龄分布图表
function createAgeDistributionChart() {
    const { students } = getData();
    const ctx = document.getElementById('ageDistributionChart').getContext('2d');

    // 计算年龄分布
    const ageRanges = {
        '6-8岁': 0,
        '9-11岁': 0,
        '12-14岁': 0,
        '15-16岁': 0
    };

    students.forEach(student => {
        if (student.age <= 8) ageRanges['6-8岁']++;
        else if (student.age <= 11) ageRanges['9-11岁']++;
        else if (student.age <= 14) ageRanges['12-14岁']++;
        else ageRanges['15-16岁']++;
    });

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(ageRanges),
            datasets: [{
                data: Object.values(ageRanges),
                backgroundColor: [
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(241, 196, 15, 0.8)',
                    'rgba(231, 76, 60, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true
        }
    });
}

// 创建课程级别分布图表
function createCourseLevelChart() {
    const { courses } = getData();
    const ctx = document.getElementById('courseLevelChart').getContext('2d');

    // 计算课程级别分布
    const levelCount = {
        '初级': 0,
        '中级': 0,
        '高级': 0
    };

    courses.forEach(course => {
        levelCount[course.level]++;
    });

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(levelCount),
            datasets: [{
                data: Object.values(levelCount),
                backgroundColor: [
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(241, 196, 15, 0.8)',
                    'rgba(231, 76, 60, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true
        }
    });
}

// 更新详细数据表格
function updateDetailedDataTable() {
    const { courses, students } = getData();
    const tableBody = document.getElementById('detailedDataBody');
    tableBody.innerHTML = '';

    courses.forEach(course => {
        // 计算该课程的平均成绩
        const courseStudents = students.filter(student => student.course === course.name);
        const averageGrade = courseStudents.length > 0
            ? (courseStudents.reduce((sum, student) => sum + student.grade, 0) / courseStudents.length).toFixed(1)
            : 0;

        // 计算报名率
        const enrollmentRate = ((course.enrolled / course.capacity) * 100).toFixed(1);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${course.name}</td>
            <td>${course.enrolled}</td>
            <td>${averageGrade}</td>
            <td>${enrollmentRate}%</td>
        `;
        tableBody.appendChild(row);
    });
}

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    updateStatsOverview();
    createEnrollmentChart();
    createGradeDistributionChart();
    createAgeDistributionChart();
    createCourseLevelChart();
    updateDetailedDataTable();

    // 时间范围选择事件监听
    document.getElementById('timeRange').addEventListener('change', () => {
        // 这里可以添加根据时间范围筛选数据的逻辑
        updateStatsOverview();
        updateDetailedDataTable();
    });
}); 