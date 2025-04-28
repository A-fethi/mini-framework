import { q, div, ce, button, input, onclick, oninput } from "./core/native.js";
import { useReference } from "./core/reference.js";
import { When, useDependency } from "./core/states.js";

// Initialize app container
const app = q("#app");

// Set up state with References
const todos = useReference([], "todos");
const newTodoText = useReference("", "newTodoText");
const filter = useReference("all", "filter"); // all, active, completed

// Function to create a unique ID for todos
const generateId = () => Math.random().toString(36).substr(2, 9);

// Filter todos based on current filter
const filteredTodos = useDependency(
    todos,
    (allTodos) => {
        return useDependency(
            filter,
            (currentFilter) => {
                if (currentFilter === "all") return allTodos;
                if (currentFilter === "active") return allTodos.filter(todo => !todo.completed);
                if (currentFilter === "completed") return allTodos.filter(todo => todo.completed);
                return allTodos;
            }
        )();
    }
);

// Stats calculations
const totalTodos = useDependency(todos, allTodos => allTodos.length);
const completedTodos = useDependency(todos, allTodos => allTodos.filter(todo => todo.completed).length);
const activeTodos = useDependency(todos, allTodos => allTodos.filter(todo => !todo.completed).length);

// Todo handlers
const addTodo = () => {
    const text = newTodoText().trim();
    if (text) {
        todos(current => [
            ...current,
            { id: generateId(), text, completed: false }
        ]);
        newTodoText("");
    }
};

const toggleTodo = (id) => {
    todos(current => current.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
};

const deleteTodo = (id) => {
    todos(current => current.filter(todo => todo.id !== id));
};

// Create app header
const header = div("header", "Todo App");

// Create todo input
const todoInput = div("todo-input");
const textInput = input("text", "What needs to be done?",
    oninput(e => newTodoText(e.target.value))
);
const addButton = button("Add",
    onclick(addTodo)
);
todoInput.append(textInput, addButton);

// Create filter buttons
const filterButtons = div("filters");
const allButton = button("All",
    onclick(() => filter("all"))
);
const activeButton = button("Active",
    onclick(() => filter("active"))
);
const completedButton = button("Completed",
    onclick(() => filter("completed"))
);

// Update button styles based on current filter
filter.addTrigger(currentFilter => {
    allButton.active.className = currentFilter === "all" ? "filter-btn active" : "filter-btn";
    activeButton.active.className = currentFilter === "active" ? "filter-btn active" : "filter-btn";
    completedButton.active.className = currentFilter === "completed" ? "filter-btn active" : "filter-btn";
});

filterButtons.append(allButton, activeButton, completedButton);

// Create todo list container
const todoList = ce("ul", "todo-list");

// Function to render todos
const renderTodos = () => {
    // Clear existing todos
    todoList.active.innerHTML = "";

    // Get filtered todos
    const currentTodos = filteredTodos();

    // Render each todo
    currentTodos.forEach(todo => {
        const todoItem = ce("li", todo.completed ? "todo-item completed" : "todo-item");

        // Create checkbox
        const checkbox = ce("input");
        checkbox.active.type = "checkbox";
        checkbox.active.checked = todo.completed;
        checkbox.active.onclick = () => toggleTodo(todo.id);

        // Create todo text
        const todoText = div("todo-text", todo.text);

        // Create delete button
        const deleteButton = button("✕",
            onclick(() => deleteTodo(todo.id))
        );
        deleteButton.active.className = "delete-btn";

        todoItem.append(checkbox, todoText, deleteButton);
        todoList.active.appendChild(todoItem.active);
    });
};

// Update todo list when todos or filter changes
todos.addTrigger(renderTodos);
filter.addTrigger(renderTodos);

// Create stats display
const stats = div("stats");
const updateStats = () => {
    stats.active.textContent = `${totalTodos()} total, ${activeTodos()} active, ${completedTodos()} completed`;
};
todos.addTrigger(updateStats);

// Create the main app container
const appContainer = div("app-container");
appContainer.append(header, todoInput, todoList, filterButtons, stats);

// Add the app to the DOM
app.append(appContainer);

// Initialize with some todos
todos([
    { id: generateId(), text: "Learn Native Framework", completed: true },
    { id: generateId(), text: "Build a Todo App", completed: false },
    { id: generateId(), text: "Write documentation", completed: false }
]);