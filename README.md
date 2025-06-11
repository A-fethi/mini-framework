# Reactive Mini-Framework Documentation

## Overview

This framework provides a lightweight solution for building reactive, component-based UIs with virtual DOM diffing and state management. It features:

- Virtual DOM with efficient patching
- Reactive state management
- Component-based architecture
- Built-in routing
- Batched updates for performance

## Core API

### `Vnode(tag, attrs, children)`
Creates a virtual DOM node.

**Parameters:**
- `tag`: HTML tag name or component function
- `attrs`: Object of attributes/props
- `children`: Child nodes (can be array or single node)

**Example:**
```js
const view = Vnode('div', { class: 'container' }, [
  Vnode('h1', {}, 'Hello World'),
  Vnode('button', { 'on:click': () => alert('Hi') }, 'Click me')
]);
```

### `render(component, container)`
Renders a component into a DOM container and sets up reactivity.

**Example:**
```js
render(App, document.getElementById('root'));
```

## Reactivity System

### `createState(initialValue)`
Creates a reactive state with getter/setter pair.

**Returns:**
- `[get, set]` tuple

**Example:**
```js
const [getCount, setCount] = createState(0);

// Get value
console.log(getCount());

// Set value
setCount(5);
```

### `effect(fn)`
Runs a function and tracks dependencies, re-running when dependencies change.

**Example:**
```js
effect(() => {
  console.log('Count changed:', getCount());
});
```

### `batch(fn)`
Batches multiple state updates into a single re-render.

**Example:**
```js
batch(() => {
  setCount(1);
  setUser('Alice');
  // Only one re-render occurs
});
```

## DOM Patching

The framework uses an efficient diffing algorithm that:

1. Compares nodes by type first
2. Uses keys for list reconciliation when available
3. Updates only changed attributes
4. Reorders DOM nodes rather than recreating when possible

**Keyed List Example:**
```js
const items = [{id: 1, text: 'First'}, {id: 2, text: 'Second'}];

function List() {
  return Vnode('ul', {}, 
    items.map(item => 
      Vnode('li', { key: item.id }, item.text)
    )
  );
}
```

## Event Handling

Events are bound using `on:` prefix attributes:

```js
Vnode('button', { 
  'on:click': () => console.log('Clicked!'),
  'on:mouseover': () => console.log('Hovered')
}, 'Interact me');
```

## Form Binding

Form inputs can be bound to state:

```js
const [getText, setText] = createState('');

function Input() {
  return Vnode('input', {
    type: 'text',
    value: getText(),
    'on:input': e => setText(e.target.value)
  });
}
```

## Routing

### `startRouter(routes, container, fallback)`
Sets up hash-based routing.

**Parameters:**
- `routes`: Object mapping paths to components
- `container`: DOM element to render into
- `fallback`: Component to render for unknown routes (optional)

**Example:**
```js
const Home = () => Vnode('div', {}, 'Home Page');
const About = () => Vnode('div', {}, 'About Us');

startRouter({
  '/': Home,
  '/about': About
}, document.getElementById('app'));
```

## Lifecycle Hooks

Components can use hooks via the `hooks` property:

```js
function Component() {
  return Vnode('div', {}, 'Hello', {
    hooks: {
      onMount: (el) => console.log('Mounted', el),
      onUnmount: (el) => console.log('Unmounted', el)
    }
  });
}
```

## Performance Features

1. **Batched Updates**: Multiple state changes in a `batch` trigger a single re-render
2. **Keyed Reconciliation**: Lists with keys minimize DOM operations
3. **Lazy Attribute Updates**: Only modified attributes are applied
4. **Text Node Optimization**: Text content comparisons prevent unnecessary updates
