import { Vnode } from '../../framework/index.js';
import { getTodos, setTodos } from '../store.js';
import { TodoInput } from './TodoInput.js';
import { TodoList } from './TodoList.js';
import { TodoFooter } from './TodoFooter.js';

export function TodoApp(filterFn) {
    return Vnode('body', {}, [
        Vnode('section', { class: 'todoapp', id: 'root' }, [
            Vnode('header', {}, [
                Vnode('h1', {}, 'todos'),
                Vnode('div', { class: "input-container" }, [TodoInput(),
                Vnode('label', { class: "visually-hidden", for: "todo-input" }, "New Todo Input")
                ]),
            ]),
            Vnode('main', { class: 'main', "data-testid": "main" }, [
                getTodos().length > 0 ? Vnode('div', { class: 'toggle-all-container' }, [
                    Vnode('input', {
                        type: 'checkbox',
                        id: 'toggle-all',
                        class: 'toggle-all',
                        "data-testid": 'toggle-all',
                        checked: getTodos().every(todo => todo.completed),
                        onClick: () => {
                            const allCompleted = getTodos().every(todo => todo.completed);
                            setTodos(getTodos().map(todo => ({ ...todo, completed: !allCompleted })));
                        },
                    }),
                    Vnode('label', { class: 'toggle-all-label', for: 'toggle-all' }, "Toggle All Input")
                ]) : null,
                TodoList(filterFn),
            ]),
            getTodos().length > 0 ? TodoFooter() : null
        ]),
        Vnode('footer', { class: 'info' }, [
            Vnode('p', {}, 'Double-click to edit a todo'),
            Vnode('p', {}, [
                'Created by ',
                Vnode('a', { href: '../utils/index.html', target: '_blank' }, 'US'),
                ' 😜​'
            ]),
            Vnode('p', {}, ['Part of ',
                Vnode('a', { href: 'https://zone01oujda.ma/', target: '_blank' }, 'Zone01 Oujda Cursus')
            ]),
        ])
    ]);
}
