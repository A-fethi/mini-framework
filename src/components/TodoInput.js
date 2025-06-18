import { Vnode } from '../../framework/index.js';
import { getNew, setNew, todoStore } from '../store.js';

export function TodoInput() {
    return Vnode('input', {
        type: 'text',
        class: 'new-todo',
        id: 'todo-input',
        "data-testid": 'text-input',
        value: getNew(),
        onInput: e => setNew(e.target.value),
        placeholder: "What needs to be done?",
        onKeydown: e => {
            if (e.key === 'Enter') {
                const text = getNew().trim();
                if (!text || text.length < 2) return;
                todoStore.addTodo(text);
            }
        }
    });
} 