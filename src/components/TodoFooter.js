import { Vnode } from '../../framework/index.js';
import { getTodos, setTodos } from '../store.js';

export function TodoFooter() {
    const todos = getTodos();
    const completedCount = todos.filter(todo => todo.completed).length;
    return Vnode('footer', { class: 'footer' }, [
        Vnode('span', { class: 'todo-count' },
            `${getTodos().filter(t => !t.completed).length} item left!`
        ),
        Vnode('ul', { class: 'filters', "data-testid": "footer-navigation" }, [
            Vnode('li', {}, [
                Vnode('a', { href: '#/', class: location.hash === '#/' ? 'selected' : '' }, 'All')
            ]),
            Vnode('li', {}, [
                Vnode('a', { href: '#/active', class: location.hash === '#/active' ? 'selected' : '' }, 'Active')
            ]),
            Vnode('li', {}, [
                Vnode('a', { href: '#/completed', class: location.hash === '#/completed' ? 'selected' : '' }, 'Completed')
            ])
        ]),
        Vnode('button', {
            onClick: () => setTodos(getTodos().filter(todo => !todo.completed)),
            class: 'clear-completed',
            disabled: completedCount === 0,
        }, 'Clear completed')
    ]);
} 