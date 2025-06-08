document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const addProjectBtn = document.getElementById('add-project-btn');
    const projectModal = document.getElementById('project-modal');
    const projectForm = document.getElementById('project-form');
    const projectsList = document.getElementById('projects-list');
    const quickAddTaskBtn = document.getElementById('quick-add-task');
    const taskModal = document.getElementById('task-modal');
    const taskForm = document.getElementById('task-form');
    const taskBoard = document.getElementById('task-board');
    const taskListView = document.getElementById('task-list-view');
    const taskListBody = document.getElementById('task-list-body');
    const viewOptions = document.querySelectorAll('.view-option');
    const currentProjectTitle = document.getElementById('current-project-title');
    const projectSelect = document.getElementById('task-project');

    // Close modals when clicking the X button
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            projectModal.style.display = 'none';
            taskModal.style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === projectModal) projectModal.style.display = 'none';
        if (e.target === taskModal) taskModal.style.display = 'none';
    });
    
    // Project Modal
    addProjectBtn.addEventListener('click', () => {
        projectModal.style.display = 'flex';
    });
    
    // Task Modal
    quickAddTaskBtn.addEventListener('click', () => {
        document.getElementById('task-modal-title').textContent = 'Add New Task';
        document.getElementById('task-submit-btn').textContent = 'Add Task';
        taskForm.reset();
        taskModal.style.display = 'flex';
    });
    
    // View Options
    viewOptions.forEach(option => {
        option.addEventListener('click', () => {
            viewOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            if (option.dataset.view === 'board') {
                taskBoard.style.display = 'flex';
                taskListView.style.display = 'none';
            } else if (option.dataset.view === 'list') {
                taskBoard.style.display = 'none';
                taskListView.style.display = 'block';
                renderTaskListView();
            } else if (option.dataset.view === 'calendar') {
                taskBoard.style.display = 'none';
                taskListView.style.display = 'none';
                // Calendar view would be implemented here
            }
        });
    });
    
    // Initialize the app
    initApp();
    
    function initApp() {
        // Load data from Local Storage or initialize with default data
        if (!localStorage.getItem('projects')) {
            const defaultProjects = [
                { id: '1', name: 'My Tasks', color: '#4f6bed' },
                { id: '2', name: 'Work', color: '#e54d2e' },
                { id: '3', name: 'Personal', color: '#30a46c' }
            ];
            localStorage.setItem('projects', JSON.stringify(defaultProjects));
        }
        
        if (!localStorage.getItem('tasks')) {
            const defaultTasks = [
                {
                    id: '1',
                    title: 'Design new logo',
                    description: 'Create logo concepts for the new brand identity',
                    dueDate: '2023-12-15',
                    priority: 'high',
                    status: 'todo',
                    projectId: '2'
                },
                {
                    id: '2',
                    title: 'Write blog post',
                    description: 'Write a 1000-word article about productivity tips',
                    dueDate: '2023-12-10',
                    priority: 'medium',
                    status: 'in-progress',
                    projectId: '3'
                },
                {
                    id: '3',
                    title: 'Update dependencies',
                    description: 'Update all project dependencies to their latest versions',
                    dueDate: '2023-12-05',
                    priority: 'low',
                    status: 'done',
                    projectId: '1'
                },
                {
                    id: '4',
                    title: 'Team meeting',
                    description: 'Weekly team sync meeting',
                    dueDate: '2023-12-07',
                    priority: 'medium',
                    status: 'todo',
                    projectId: '2'
                }
            ];
            localStorage.setItem('tasks', JSON.stringify(defaultTasks));
        }
        
        // Render the UI
        renderProjects();
        renderTaskBoard();
        populateProjectSelect();
        
        // Set the first project as active by default
        const firstProject = document.querySelector('.projects-list li:first-child a');
        if (firstProject) {
            firstProject.click();
        }
    }
    
    function renderProjects() {
        const projects = JSON.parse(localStorage.getItem('projects'));
        projectsList.innerHTML = '';
        
        projects.forEach(project => {
            const li = document.createElement('li');
            li.innerHTML = `
                <a href="#" data-project-id="${project.id}" style="color: ${project.color}">
                    ${project.name}
                </a>
            `;
            
            // Set the first project as active by default
            if (project.id === '1') {
                li.classList.add('active');
            }
            
            li.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.projects-list li').forEach(item => {
                    item.classList.remove('active');
                });
                li.classList.add('active');
                currentProjectTitle.textContent = project.name;
                renderTaskBoard();
                renderTaskListView();
            });
            
            projectsList.appendChild(li);
        });
    }
    
    function renderTaskBoard() {
        const tasks = JSON.parse(localStorage.getItem('tasks'));
        const projects = JSON.parse(localStorage.getItem('projects'));
        const activeProjectId = document.querySelector('.projects-list li.active a')?.dataset.projectId || '1';
        
        const columns = [
            { id: 'todo', title: 'To Do' },
            { id: 'in-progress', title: 'In Progress' },
            { id: 'review', title: 'Review' },
            { id: 'done', title: 'Done' }
        ];
        
        taskBoard.innerHTML = '';
        
        columns.forEach(column => {
            const columnTasks = tasks.filter(task => 
                task.status === column.id && 
                (activeProjectId === '1' || task.projectId === activeProjectId)
            );
            
            const columnElement = document.createElement('div');
            columnElement.className = `task-column ${column.id}`;
            columnElement.innerHTML = `
                <div class="column-header">
                    <span class="column-title">${column.title}</span>
                    <span class="task-count">${columnTasks.length}</span>
                </div>
                <div class="tasks-container" data-status="${column.id}">
                    ${columnTasks.map(task => createTaskCard(task, projects)).join('')}
                </div>
                <button class="add-task-btn" data-status="${column.id}">
                    <i class="fas fa-plus"></i> Add Task
                </button>
            `;
            
            // Add task button for each column
            columnElement.querySelector('.add-task-btn').addEventListener('click', () => {
                document.getElementById('task-modal-title').textContent = 'Add New Task';
                document.getElementById('task-submit-btn').textContent = 'Add Task';
                taskForm.reset();
                document.getElementById('task-status').value = column.id;
                taskModal.style.display = 'flex';
            });
            
            taskBoard.appendChild(columnElement);
        });
        
        // Enable drag and drop
        setupDragAndDrop();
    }
    
    function createTaskCard(task, projects) {
        const project = projects.find(p => p.id === task.projectId);
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const isOverdue = dueDate < today && task.status !== 'done';
        
        return `
            <div class="task-card ${task.priority}-priority" draggable="true" data-task-id="${task.id}">
                <div class="task-title">
                    ${task.title}
                    <div class="task-actions">
                        <button class="edit-task" data-task-id="${task.id}"><i class="fas fa-edit"></i></button>
                        <button class="delete-task" data-task-id="${task.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                ${project && project.id !== '1' ? `<span class="task-project" style="background-color: ${project.color}20; color: ${project.color}">${project.name}</span>` : ''}
                <div class="task-due-date ${isOverdue ? 'overdue' : ''}">
                    <i class="fas fa-calendar-alt"></i>
                    ${formatDate(task.dueDate)}
                    ${isOverdue ? '<span class="overdue-text">(Overdue)</span>' : ''}
                </div>
            </div>
        `;
    }
    
    function renderTaskListView() {
        const tasks = JSON.parse(localStorage.getItem('tasks'));
        const projects = JSON.parse(localStorage.getItem('projects'));
        const activeProjectId = document.querySelector('.projects-list li.active a')?.dataset.projectId || '1';
        
        const filteredTasks = tasks.filter(task => 
            activeProjectId === '1' || task.projectId === activeProjectId
        );
        
        taskListBody.innerHTML = '';
        
        filteredTasks.forEach(task => {
            const project = projects.find(p => p.id === task.projectId);
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const isOverdue = dueDate < today && task.status !== 'done';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="task-title">${task.title}</div>
                    ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                </td>
                <td><span class="priority-badge ${task.priority}">${task.priority}</span></td>
                <td><span class="status-badge ${task.status.replace('-', '')}">${task.status.replace('-', ' ')}</span></td>
                <td class="${isOverdue ? 'overdue' : ''}">${formatDate(task.dueDate)} ${isOverdue ? '<span class="overdue-text">(Overdue)</span>' : ''}</td>
                <td>
                    <div class="task-actions-list">
                        <button class="edit-task" data-task-id="${task.id}"><i class="fas fa-edit"></i></button>
                        <button class="delete-task" data-task-id="${task.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            
            taskListBody.appendChild(row);
        });
    }
    
    // Helper function to format date
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
    
    // Function to populate project select in task modal
    function populateProjectSelect() {
        const projects = JSON.parse(localStorage.getItem('projects'));
        projectSelect.innerHTML = '';
        
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            projectSelect.appendChild(option);
        });
    }
    
    // Function to set up drag and drop functionality
    function setupDragAndDrop() {
        const taskCards = document.querySelectorAll('.task-card');
        const columns = document.querySelectorAll('.tasks-container');
        
        taskCards.forEach(task => {
            task.addEventListener('dragstart', dragStart);
            task.addEventListener('dragend', dragEnd);
        });
        
        columns.forEach(column => {
            column.addEventListener('dragover', dragOver);
            column.addEventListener('dragenter', dragEnter);
            column.addEventListener('dragleave', dragLeave);
            column.addEventListener('drop', dragDrop);
        });
        
        function dragStart() {
            this.classList.add('dragging');
            event.dataTransfer.setData('text/plain', this.dataset.taskId);
        }
        
        function dragEnd() {
            this.classList.remove('dragging');
        }
        
        function dragOver(e) {
            e.preventDefault();
        }
        
        function dragEnter(e) {
            e.preventDefault();
            this.classList.add('drop-zone');
        }
        
        function dragLeave() {
            this.classList.remove('drop-zone');
        }
        
        function dragDrop(e) {
            e.preventDefault();
            this.classList.remove('drop-zone');
            
            const taskId = e.dataTransfer.getData('text/plain');
            const draggedTask = document.querySelector(`.task-card[data-task-id="${taskId}"]`);
            const newStatus = this.dataset.status;
            
            // Update task status in local storage
            const tasks = JSON.parse(localStorage.getItem('tasks'));
            const taskIndex = tasks.findIndex(task => task.id === taskId);
            
            if (taskIndex !== -1) {
                tasks[taskIndex].status = newStatus;
                localStorage.setItem('tasks', JSON.stringify(tasks));
                
                // Move task to new column
                this.appendChild(draggedTask);
                
                // Update task counts
                renderTaskBoard();
            }
        }
    }
    
    // Add event listeners for task form submission
    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const taskId = document.getElementById('task-submit-btn').dataset.taskId || generateId();
        
        const newTask = {
            id: taskId,
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-description').value,
            dueDate: document.getElementById('task-due-date').value,
            priority: document.getElementById('task-priority').value,
            status: document.getElementById('task-status').value,
            projectId: document.getElementById('task-project').value
        };
        
        if (document.getElementById('task-submit-btn').dataset.taskId) {
            // Update existing task
            const taskIndex = tasks.findIndex(task => task.id === taskId);
            tasks[taskIndex] = newTask;
        } else {
            // Add new task
            tasks.push(newTask);
        }
        
        localStorage.setItem('tasks', JSON.stringify(tasks));
        taskModal.style.display = 'none';
        renderTaskBoard();
        renderTaskListView();
    });
    
    // Add event listener for project form submission
    projectForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const projects = JSON.parse(localStorage.getItem('projects')) || [];
        const newProject = {
            id: generateId(),
            name: document.getElementById('project-name').value,
            color: document.getElementById('project-color').value
        };
        
        projects.push(newProject);
        localStorage.setItem('projects', JSON.stringify(projects));
        
        projectModal.style.display = 'none';
        renderProjects();
        populateProjectSelect();
    });
    
    // Helper function to generate unique ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Add event delegation for edit and delete buttons
    document.addEventListener('click', function(e) {
        // Edit task
        if (e.target.classList.contains('edit-task') || e.target.parentElement.classList.contains('edit-task')) {
            const taskId = e.target.dataset.taskId || e.target.parentElement.dataset.taskId;
            editTask(taskId);
        }
        
        // Delete task
        if (e.target.classList.contains('delete-task') || e.target.parentElement.classList.contains('delete-task')) {
            const taskId = e.target.dataset.taskId || e.target.parentElement.dataset.taskId;
            deleteTask(taskId);
        }
    });
    
    function editTask(taskId) {
        const tasks = JSON.parse(localStorage.getItem('tasks'));
        const task = tasks.find(task => task.id === taskId);
        
        if (task) {
            document.getElementById('task-modal-title').textContent = 'Edit Task';
            document.getElementById('task-submit-btn').textContent = 'Update Task';
            document.getElementById('task-submit-btn').dataset.taskId = taskId;
            
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-description').value = task.description || '';
            document.getElementById('task-due-date').value = task.dueDate;
            document.getElementById('task-priority').value = task.priority;
            document.getElementById('task-status').value = task.status;
            document.getElementById('task-project').value = task.projectId;
            
            taskModal.style.display = 'flex';
        }
    }
    
    function deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            const tasks = JSON.parse(localStorage.getItem('tasks'));
            const updatedTasks = tasks.filter(task => task.id !== taskId);
            
            localStorage.setItem('tasks', JSON.stringify(updatedTasks));
            renderTaskBoard();
            renderTaskListView();
        }
    }
});