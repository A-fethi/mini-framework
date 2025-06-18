import { createState, batch } from '../framework/index.js';

export const [getTodos, setTodos] = createState([]);
export const [getNew, setNew] = createState('');

export const todoStore = {
    addTodo(text) {
        batch(() => {
            const newTodo = {
                id: Date.now(),
                text: text.trim(),
                completed: false,
                editing: false
            };
            setTodos([...getTodos(), newTodo]);
            setNew('');
        });
    },

    toggleTodo(id) {
        batch(() => {
            setTodos(getTodos().map(todo =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            ));
        });
    },

    deleteTodo(id) {
        batch(() => {
            setTodos(getTodos().filter(todo => todo.id !== id));
        });
    },

    updateTodo(id, text, editing = false) {
        batch(() => {
            setTodos(getTodos().map(todo => {
                if (todo.id === id) {
                    return { ...todo, text, editing };
                }
                // If we're entering edit mode, ensure all other todos are not in edit mode
                if (editing) {
                    return { ...todo, editing: false };
                }
                return todo;
            }));
        });
    },

    exitEditMode(id) {
        batch(() => {
            setTodos(getTodos().map(todo =>
                todo.id === id ? { ...todo, editing: false } : todo
            ));
        });
    },

    toggleAll() {
        batch(() => {
            const allCompleted = getTodos().every(todo => todo.completed);
            setTodos(getTodos().map(todo => ({ ...todo, completed: !allCompleted })));
        });
    },

    clearCompleted() {
        batch(() => {
            setTodos(getTodos().filter(todo => !todo.completed));
        });
    }
}; 