# Overview

This is a minimalist JavaScript framework that enables reactive, component-based UI development using virtual nodes (vnodes), a simple diffing algorithm, and reactivity primitives. It provides a clean abstraction over the DOM, basic reactivity, and support for routing.

---

## Vnode Function

The `Vnode` function creates a virtual representation of an HTML element or component. It takes three arguments:

- `tag`: a string (e.g. `"div"`) or a component function.
- `attrs`: an object containing attributes and event handlers (e.g. `{ id: "main", "on:click": handler }`).
- `children`: either a single child or an array of children (text, Vnode objects, or both).

Example:

```js
const button = Vnode("button", { class: "btn", "on:click": () => alert("Hello") }, "Click me");
```

---

## Reactivity: `createState` and `effect`

### `createState(initial)`

This function returns a getter and a setter for a reactive value:

```js
const [getCount, setCount] = createState(0);
```

- When a reactive value is accessed inside an effect, the effect is subscribed.
- When the setter is called and the value changes, all subscribed effects re-run.

### `effect(fn)`

Runs a reactive effect. The function you pass will re-run whenever any `get()` inside it changes.

```js
effect(() => {
  console.log("Current count:", getCount());
});
```

---

## Rendering: `render`

```js
render(App, document.getElementById("root"));
```

- The `render` function mounts a component function into a DOM container.
- Internally, it wraps the component with a reactive `effect` and manages patching.

---

## DOM Diffing and Patching

The framework compares a virtual node tree with the real DOM using `patch` and `updateElement`.

### Key Concepts:

- **Initial Mount:** If there's no previous DOM, create new elements.
- **Replacement:** If the tag type or content differs, replace the node.
- **Update in Place:** If the tag is the same, reuse the element and update its attributes/children.
- **Children Reconciliation:** The framework uses a keyed diffing strategy if `key` attributes are present.

Example:

```js
const view = () => Vnode("div", {}, [
  Vnode("h1", {}, "Welcome"),
  Vnode("ul", {}, items.map(item => Vnode("li", { key: item.id }, item.text)))
]);
```

### Keyed Diffing

When `key` attributes are present on children, the framework:

1. Caches existing DOM nodes by key.
2. Reuses nodes in the new order.
3. Reorders or removes nodes as necessary.
4. Falls back to index-based diffing if no key is provided.

---

## Event Handling

To bind events, use attributes like `"on:click"` in the vnode:

```js
Vnode("button", { "on:click": () => alert("Clicked!") }, "Click Me")
```

The framework converts this into DOM event listeners like `element.onclick`.

---

## Input Binding

Inputs can be controlled using the `value` attribute:

```js
const [getInput, setInput] = createState("");

Vnode("input", {
  type: "text",
  value: getInput(),
  "on:input": e => setInput(e.target.value)
})
```

This pattern keeps your UI and state in sync without external libraries.

---

## Routing Support

Hash-based routing is built in.

### `startRouter(routes, container, fallback?)`

- `routes`: an object mapping paths (e.g. `"/about"`) to component functions.
- `container`: where to render the view.
- `fallback`: optional component if no match is found.

Example:

```js
const Home = () => Vnode("div", {}, "Welcome Home");
const Todo = () => Vnode("div", {}, "Your Todos");

startRouter({
  "/": Home,
  "/todo": Todo
}, document.getElementById("app"));
```

This listens to `window.location.hash` and updates the UI when it changes.

---

## Summary

This framework gives you:

- A virtual DOM abstraction.
- A reactive state system.
- A component model based on pure functions.
- Keyed diffing for efficient DOM updates.
- Hash-based routing out of the box.

It keeps the implementation simple and comprehensible while covering the essential building blocks for a modern UI system.