// Selectors

const toDoInput = document.querySelector('.todo-input');
const toDoBtn = document.querySelector('.todo-btn');
const toDoList = document.querySelector('.todo-list');
const standardTheme = document.querySelector('.standard-theme');
const lightTheme = document.querySelector('.light-theme');
const darkerTheme = document.querySelector('.darker-theme');
const TODO_STORAGE_KEY = 'todos';
let draggedTodo = null;


// Event Listeners

toDoBtn.addEventListener('click', addToDo);
toDoList.addEventListener('click', deletecheck);
toDoList.addEventListener('dragstart', handleDragStart);
toDoList.addEventListener('dragover', handleDragOver);
toDoList.addEventListener('drop', handleDrop);
toDoList.addEventListener('dragend', handleDragEnd);
document.addEventListener("DOMContentLoaded", getTodos);
standardTheme.addEventListener('click', () => changeTheme('standard'));
lightTheme.addEventListener('click', () => changeTheme('light'));
darkerTheme.addEventListener('click', () => changeTheme('darker'));

// Check if one theme has been set previously and apply it (or std theme if not found):
let savedTheme = localStorage.getItem('savedTheme');
savedTheme === null ?
    changeTheme('standard')
    : changeTheme(localStorage.getItem('savedTheme'));

// Functions;
function addToDo(event) {
    // Prevents form from submitting / Prevents form from relaoding;
    event.preventDefault();

    if (toDoInput.value === '') {
            alert("You must write something!");
        } 
    else {
        const newTodo = { text: toDoInput.value, completed: false };
        const toDoDiv = buildToDoElement(newTodo.text, newTodo.completed);

        // Adding to local storage;
        savelocal(newTodo);

        // Append to list;
        toDoList.appendChild(toDoDiv);

        // CLearing the input;
        toDoInput.value = '';
    }

}   


function deletecheck(event){

    // console.log(event.target);
    const item = event.target;

    // delete
    if(item.classList[0] === 'delete-btn')
    {
        // item.parentElement.remove();
        // animation
        item.parentElement.classList.add("fall");

        //removing local todos;
        removeLocalTodos(item.parentElement);

        item.parentElement.addEventListener('transitionend', function(){
            item.parentElement.remove();
        })
    }

    // check
    if(item.classList[0] === 'check-btn')
    {
        item.parentElement.classList.toggle("completed");
        persistTodoCompletion(item.parentElement);
    }


}


function buildToDoElement(todoText, isCompleted = false) {
    // toDo DIV;
    const toDoDiv = document.createElement("div");
    toDoDiv.classList.add('todo', `${savedTheme}-todo`);
    toDoDiv.setAttribute('draggable', 'true');

    // Create LI
    const newToDo = document.createElement('li');
    newToDo.innerText = todoText;
    newToDo.classList.add('todo-item');
    toDoDiv.appendChild(newToDo);

    if (isCompleted) {
        toDoDiv.classList.add('completed');
    }

    // check btn;
    const checked = document.createElement('button');
    checked.innerHTML = '<i class="fas fa-check"></i>';
    checked.classList.add('check-btn', `${savedTheme}-button`);
    toDoDiv.appendChild(checked);

    // delete btn;
    const deleted = document.createElement('button');
    deleted.innerHTML = '<i class="fas fa-trash"></i>';
    deleted.classList.add('delete-btn', `${savedTheme}-button`);
    toDoDiv.appendChild(deleted);

    return toDoDiv;
}


// Saving to local storage:
function normalizeStoredTodo(todo) {
    if (typeof todo === 'string') {
        return { text: todo, completed: false };
    }

    if (!todo || typeof todo !== 'object' || typeof todo.text !== 'string') {
        return null;
    }

    return {
        text: todo.text,
        completed: Boolean(todo.completed)
    };
}


function getStoredTodos() {
    const rawTodos = localStorage.getItem(TODO_STORAGE_KEY);
    if (rawTodos === null) {
        return [];
    }

    try {
        const parsedTodos = JSON.parse(rawTodos);
        if (!Array.isArray(parsedTodos)) {
            return [];
        }

        return parsedTodos
            .map(normalizeStoredTodo)
            .filter(Boolean);
    } catch (error) {
        return [];
    }
}


function setStoredTodos(todos) {
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
}


function getTodoIndex(todoElement) {
    return Array.from(toDoList.querySelectorAll('.todo')).indexOf(todoElement);
}


function persistTodoCompletion(todoElement) {
    const todos = getStoredTodos();
    const todoIndex = getTodoIndex(todoElement);
    if (todoIndex === -1 || !todos[todoIndex]) {
        return;
    }

    todos[todoIndex].completed = todoElement.classList.contains('completed');
    setStoredTodos(todos);
}


function savelocal(todo){
    const todos = getStoredTodos();
    const normalizedTodo = normalizeStoredTodo(todo);
    if (!normalizedTodo) {
        return;
    }

    todos.push(normalizedTodo);
    setStoredTodos(todos);
}


function persistCurrentOrder() {
    const orderedTodos = Array.from(toDoList.querySelectorAll('.todo')).map(todo => ({
        text: todo.querySelector('.todo-item').innerText,
        completed: todo.classList.contains('completed')
    }));

    setStoredTodos(orderedTodos);
}



function getTodos() {
    const todos = getStoredTodos();
    setStoredTodos(todos);

    todos.forEach(function(todo) {
        const toDoDiv = buildToDoElement(todo.text, todo.completed);

        // Append to list;
        toDoList.appendChild(toDoDiv);
    });
}


function removeLocalTodos(todo){
    const todos = getStoredTodos();
    const todoIndex = getTodoIndex(todo);
    if (todoIndex === -1) {
        return;
    }

    todos.splice(todoIndex, 1);
    setStoredTodos(todos);
}


function handleDragStart(event) {
    const todo = event.target.closest('.todo');
    if (!todo) {
        return;
    }

    draggedTodo = todo;
    draggedTodo.classList.add('dragging');
    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', todo.querySelector('.todo-item').innerText);
    }
}


function handleDragOver(event) {
    if (!draggedTodo) {
        return;
    }

    event.preventDefault();
    const nextTodo = getDropTarget(event.clientY);
    if (!nextTodo) {
        toDoList.appendChild(draggedTodo);
        return;
    }

    if (nextTodo !== draggedTodo) {
        toDoList.insertBefore(draggedTodo, nextTodo);
    }
}


function handleDrop(event) {
    if (!draggedTodo) {
        return;
    }

    event.preventDefault();
    persistCurrentOrder();
}


function handleDragEnd() {
    if (!draggedTodo) {
        return;
    }

    draggedTodo.classList.remove('dragging');
    draggedTodo = null;
}


function getDropTarget(clientY) {
    const todoElements = [...toDoList.querySelectorAll('.todo:not(.dragging)')];

    return todoElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = clientY - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        }

        return closest;
    }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
}

function setThemeSelectorState(color) {
    const selectorState = [
        { name: 'standard', element: standardTheme },
        { name: 'light', element: lightTheme },
        { name: 'darker', element: darkerTheme }
    ];

    selectorState.forEach(theme => {
        theme.element.setAttribute('aria-pressed', theme.name === color ? 'true' : 'false');
    });
}

// Change theme function:
function changeTheme(color) {
    localStorage.setItem('savedTheme', color);
    savedTheme = localStorage.getItem('savedTheme');

    document.body.className = color;
    setThemeSelectorState(color);
    // Change blinking cursor for darker theme:
    color === 'darker' ? 
        document.getElementById('title').classList.add('darker-title')
        : document.getElementById('title').classList.remove('darker-title');

    document.querySelector('input').className = `${color}-input`;
    // Change todo color without changing their status (completed or not):
    document.querySelectorAll('.todo').forEach(todo => {
        Array.from(todo.classList).some(item => item === 'completed') ? 
            todo.className = `todo ${color}-todo completed`
            : todo.className = `todo ${color}-todo`;
    });
    // Change buttons color according to their type (todo, check or delete):
    document.querySelectorAll('button').forEach(button => {
        Array.from(button.classList).some(item => {
            if (item === 'check-btn') {
              button.className = `check-btn ${color}-button`;  
            } else if (item === 'delete-btn') {
                button.className = `delete-btn ${color}-button`; 
            } else if (item === 'todo-btn') {
                button.className = `todo-btn ${color}-button`;
            }
        });
    });
}
