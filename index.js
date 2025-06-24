// Carrega tarefas do localStorage
const getTasksFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem('tasks')) || [];
};

// Salva tarefas no localStorage
const setTasksInLocalStorage = (tasks) => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
};

// Atualiza contagem de tarefas concluídas no rodapé
const renderTasksProgressDate = (tasks) => {
    let tasksProgress = document.getElementById('tasks-progress');

    if (!tasksProgress) {
        tasksProgress = document.createElement('div');
        tasksProgress.id = 'tasks-progress';
        document.querySelector('footer').appendChild(tasksProgress);
    }

    const doneTasks = tasks.filter(task => task.checked).length;
    const totalTasks = tasks.length;
    tasksProgress.textContent = `${doneTasks}/${totalTasks} Concluídas`;
};

// Cria item da tarefa no DOM
const createTaskListItem = (task) => {
    const list = document.getElementById('todo-list');
    const toDo = document.createElement('li');
    toDo.id = task.id;
    if (task.checked) {
        toDo.classList.add('done');
    }

    // Conteúdo da tarefa (descrição + tag + data)
    const contentContainer = document.createElement('div');
    contentContainer.className = 'task-content';

    const description = document.createElement('span');
    description.className = 'task-desc';
    description.textContent = task.description;

    const tagContainer = document.createElement('div');
    tagContainer.style.display = 'flex';
    tagContainer.style.gap = '1rem';
    tagContainer.style.alignItems = 'center';

    const tag = document.createElement('span');
    tag.className = 'task-tag';
    tag.textContent = task.tag || '';

    const createdAtSpan = document.createElement('span');
    createdAtSpan.className = 'task-created-at';

    // Formata data dd/mm/yyyy
    const formatDate = (isoString) => {
        const date = new Date(isoString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `Criado em: ${day}/${month}/${year}`;
    };

    createdAtSpan.textContent = task.createdAt ? formatDate(task.createdAt) : '';

    tagContainer.appendChild(tag);
    tagContainer.appendChild(createdAtSpan);

    contentContainer.appendChild(description);
    contentContainer.appendChild(tagContainer);

    // Botão Concluir
    const completeTaskButton = document.createElement('button');
    completeTaskButton.textContent = 'Concluir';
    completeTaskButton.className = 'complete-task-btn';
    completeTaskButton.setAttribute('aria-label', 'Concluir tarefa');

    // Se tarefa já concluída, substitui botão por círculo
    if (task.checked) {
        const checkCircle = document.createElement('div');
        checkCircle.className = 'check-circle';
        checkCircle.innerHTML = '✔';
        toDo.appendChild(contentContainer);
        toDo.appendChild(checkCircle);
    } else {
        completeTaskButton.onclick = () => {
            toDo.classList.add('done');

            const checkCircle = document.createElement('div');
            checkCircle.className = 'check-circle';
            checkCircle.innerHTML = '✔';

            completeTaskButton.outerHTML = '';
            toDo.appendChild(checkCircle);

            tasks = tasks.map(t =>
                t.id === task.id ? { ...t, checked: true } : t
            );
            setTasksInLocalStorage(tasks);
            renderTasksProgressDate(tasks);
        };
        toDo.appendChild(contentContainer);
        toDo.appendChild(completeTaskButton);
    }

    // Botão Excluir menor
    const deleteTaskButton = document.createElement('button');
    deleteTaskButton.textContent = '✕';
    deleteTaskButton.title = 'Excluir tarefa';
    deleteTaskButton.className = 'delete-task-btn';

    deleteTaskButton.onclick = () => {
        tasks = tasks.filter(t => t.id !== task.id);
        setTasksInLocalStorage(tasks);
        toDo.remove();
        renderTasksProgressDate(tasks);
    };

    toDo.appendChild(deleteTaskButton);
    list.appendChild(toDo);

    return toDo;
};

// Gera novo ID incremental
const getNewTaskId = () => {
    const lastId = tasks.length > 0 ? tasks[tasks.length - 1].id : 0;
    return lastId + 1;
};

// Lê dados do formulário
const getNewTaskData = (event) => {
    const description = event.target.elements.description.value.trim();
    const tag = event.target.elements['tag-description'].value.trim();
    const id = getNewTaskId();
    const createdAt = new Date().toISOString();
    return { description, tag, id, createdAt };
};

// Simula delay (pode remover se quiser)
const getCreatedTaskInfo = (event) => new Promise((resolve) => {
    setTimeout(() => {
        resolve(getNewTaskData(event));
    }, 3000);
});

// Cria nova tarefa e atualiza lista
const createTask = async (event) => {
    event.preventDefault();

    const saveTaskButton = document.getElementById('save-task');
    saveTaskButton.setAttribute('disabled', true);

    const newTaskData = await getCreatedTaskInfo(event);
    if (!newTaskData.description) {
        saveTaskButton.removeAttribute('disabled');
        return;
    }

    createTaskListItem({ ...newTaskData, checked: false });
    tasks.push({ ...newTaskData, checked: false });
    setTasksInLocalStorage(tasks);

    document.getElementById('description').value = '';
    document.getElementById('tag-description').value = '';
    saveTaskButton.removeAttribute('disabled');
    renderTasksProgressDate(tasks);
};

// Inicialização e renderização inicial
let tasks = getTasksFromLocalStorage();

document.addEventListener('DOMContentLoaded', () => {
    const list = document.getElementById('todo-list');
    tasks.forEach(task => createTaskListItem(task));

    renderTasksProgressDate(tasks);

    const form = document.getElementById('create-task-form');
    form.addEventListener('submit', createTask);
});
