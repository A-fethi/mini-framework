import { Vnode } from '../../framework/index.js';
import { getTodos } from '../store.js';
import { TodoItem } from './TodoItem.js';

export function TodoList(filterFn) {
    const todos = getTodos().filter(filterFn);
    return Vnode('ul', { class: 'todo-list', "data-testid": "todo-list" }, todos.map(todo => TodoItem(todo)));
} 