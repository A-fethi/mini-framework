# Native Framework Documentation

A lightweight, reactive JavaScript framework for building user interfaces with a clean, functional approach.

## Core Concepts

The Native Framework is built around three key concepts:

1. **Element Creation** - Functional elements that wrap DOM nodes
2. **References** - Reactive state management
3. **Conditional Rendering** - Dynamic UI based on state changes

## Installation

```javascript
// Import the core modules
import { ce, q, div, button } from "./core/native.js";
```

## Basic Usage

### Element Selection

```javascript
// Select existing elements from the DOM
const container = q("#app");
```

### Element Creation

```javascript
// Create elements with the functional API
const header = div("header", "My App");
const paragraph = ce("p", "paragraph", "Welcome to my app");

// Append children to parent elements
container.append(header, paragraph);
```

## State Management with References

References are reactive values that trigger UI updates when changed.

```javascript
import { useReference } from "./core/reference.js";

// Create a reference with a default value
const count = useReference(0, "count");

// Get the current value
console.log(count()); // 0

// Set a new value
count(1);

// Update based on current value
count(v => v + 1);

// Add a trigger that runs when the value changes
count.addTrigger(value => console.log("Count changed to:", value));
```

## Conditional Rendering

The `When` utility allows conditional rendering based on state:

```javascript
import { When } from "./core/states.js";

const isLoggedIn = useReference(false, "isLoggedIn");

// Render different UI based on state
const authUI = When(isLoggedIn).show(
  div("welcome", "Welcome back!"),
  div("login-prompt", "Please log in")
);

// Can also transform values conditionally
const greeting = When(isLoggedIn).do(
  "Welcome back!",
  "Hello, guest!"
);
```

## Event Handling

The framework provides utilities for handling DOM events:

```javascript
import { button, onclick } from "./core/native.js";

// Create a button with a click handler
const incrementBtn = button("Increment", 
  onclick(() => count(v => v + 1))
);
```

## Form Elements

### Inputs

```javascript
import { input, oninput } from "./core/native.js";

// Create an input with an input handler
const nameInput = input("text", "Enter your name", 
  oninput(e => name(e.target.value))
);
```

### Select Dropdowns

```javascript
import { select, option, onchange } from "./core/native.js";

// Create a select dropdown
const colorSelect = select("color-selector",
  onchange(e => selectedColor(e.target.value))
);

// Add options
colorSelect.append(
  option("red", "Red"),
  option("blue", "Blue"),
  option("green", "Green")
);
```

## Dependencies

The `useDependency` utility creates derived state:

```javascript
import { useDependency } from "./core/states.js";

const count = useReference(0, "count");
const doubleCount = useDependency(count, value => value * 2);

// doubleCount will automatically update when count changes
```

## Advanced Conditional Rendering

For more complex conditional logic:

```javascript
const WhenFn = WhenFunctionBased(userStatus);

const statusUI = WhenFn(status => {
  if (status === "loading") {
    return div("loading", "Loading...");
  } else if (status === "error") {
    return div("error", "An error occurred");
  } else {
    return div("success", "Welcome, " + status.username);
  }
});
```

## API Reference

### Element Creation

- `ce(tagName, className, textContent, ...eventListeners)` - Create any element
- `div(className, textContent, ...eventListeners)` - Create a div element
- `button(textContent, ...eventListeners)` - Create a button element
- `a(href, child)` - Create an anchor element
- `input(type, placeholder, ...eventListeners)` - Create an input element
- `select(className, ...eventListeners)` - Create a select element
- `option(value, text)` - Create an option element

### Element Selection

- `q(selector)` - Select an element using querySelector

### Event Listeners

- `onclick(callback)` - Handle click events
- `oninput(callback)` - Handle input events
- `onchange(callback)` - Handle change events

### State Management

- `useReference(defaultValue, name)` - Create a reactive reference
- `isReference(value)` - Check if a value is a reference
- `useDependency(dependency, resolver)` - Create a derived reference

### Conditional Rendering

- `When(reference, condition)` - Conditional rendering based on a reference
- `WhenFunctionBased(reference)` - Advanced conditional rendering with functions
