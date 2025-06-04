import { Vnode, startRouter, createState } from './framework.js';
const [getTodos, setTodos] = createState([]);
const [getNew, setNew] = createState('');

function Todos(filterFn) {
    return Vnode('header', {}, [
        Vnode('h1', {}, 'todos'),
        Vnode('div', {}, [
            Vnode('input', {
                type: 'text',
                class: 'new-todo',
                value: getNew(),
                onInput: e => setNew(e.target.value),
                placeholder: "What needs to be done?",
                onKeydown: e => {
                    if (e.key === 'Enter') {
                        const text = getNew().trim();
                        if (!text) return;
                        setTodos([...getTodos(), { id: Date.now(), text, editing: false, completed: false }]);
                        setNew('');
                    }
                }
            }),
        ]),
        getTodos().length > 0 ? Vnode('div', { class: 'toggle-all-container' }, [
            Vnode('input', {
                type: 'checkbox',
                id: 'toggle-all-input',
                class: 'toggle-all',
                checked: getTodos().every(todo => todo.completed),
                onClick: () => {
                    const allCompleted = getTodos().every(todo => todo.completed);
                    setTodos(getTodos().map(todo => ({ ...todo, completed: !allCompleted })));
                }
            }),
            Vnode('label', { class: 'toggle-all-label', for: 'toggle-all-input' })
        ])
            : null,

        Vnode('ul', { class: 'todo-list' }, [
            getTodos().filter(filterFn).map(todo =>
                Vnode('li', {
                    key: todo.id,
                    class: `${todo.completed ? 'completed' : ''} ${todo.editing ? 'editing' : ''}`
                }, [
                    todo.editing
                        ? Vnode('input', {
                            class: 'edit',
                            value: todo.text,
                            onInput: e => {
                                const newText = e.target.value;
                                setTodos(getTodos().map(t =>
                                    t.id === todo.id ? { ...t, text: newText } : t
                                ));
                            },
                            onBlur: () => {
                                setTodos(getTodos().map(t =>
                                    t.id === todo.id ? { ...t, editing: false } : t
                                ));
                            },
                            onKeydown: e => {
                                if (e.key === 'Enter') {
                                    setTodos(getTodos().map(t =>
                                        t.id === todo.id ? { ...t, editing: false } : t
                                    ));
                                }
                            }
                        })
                        : Vnode('div', { class: 'view' }, [
                            Vnode('input', {
                                class: 'toggle',
                                type: 'checkbox',
                                checked: todo.completed,
                                onChange: () => {
                                    setTodos(getTodos().map(t =>
                                        t.id === todo.id ? { ...t, completed: !t.completed } : t
                                    ));
                                }
                            }),
                            Vnode('label', {
                                onDblclick: () => {
                                    setTodos(getTodos().map(t =>
                                        t.id === todo.id ? { ...t, editing: true } : t
                                    ));
                                }
                            }, todo.text),
                            Vnode('button', {
                                class: 'destroy',
                                onClick: () => setTodos(getTodos().filter(t => t.id !== todo.id))
                            }, '')
                        ])
                ])
            )
        ]),

        getTodos().length > 0
            ? Vnode('footer', { class: 'footer' }, [
                Vnode('span', { class: 'todo-count' },
                    `${getTodos().filter(t => !t.completed).length} item left!`
                ),
                Vnode('ul', { class: 'filters' }, [
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
                getTodos().some(todo => todo.completed)
                    ? Vnode('button', {
                        onClick: () => setTodos(getTodos().filter(todo => !todo.completed)),
                        class: 'clear-completed'
                    }, 'Clear completed')
                    : null
            ])
            : null
    ]);
}

const routes = {
    '/': () => Todos(() => true),
    '/active': () => Todos(todo => !todo.completed),
    '/completed': () => Todos(todo => todo.completed)
};
const app = document.getElementById('app');
startRouter(routes, app);