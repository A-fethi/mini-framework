let currentEffect = null;

// Core: VNode and render
export function Vnode(tag, attrs = {}, children = []) {
  return { tag, attrs, children: Array.isArray(children) ? children.flat() : [children] };
}

export function render(component, container) {
  let currentDOM = null;
  effect(() => {
    currentDOM = patch(container, currentDOM, component());
  });
}

// Reactivity
export function createState(initial) {
  let state = initial;
  const listeners = new Set();

  const get = () => {
    if (currentEffect) listeners.add(currentEffect);
    return state;
  };

  const set = (next) => {
    if (state !== next) {
      state = next;
      listeners.forEach((fn) => fn());
    }
  };

  return [get, set];
}

export function effect(fn) {
  const run = () => {
    currentEffect = run;
    fn();
    currentEffect = null;
  };
  run();
}

// DOM Patching
function patch(parent, oldDOM, vnode) {
  if (!vnode) return document.createTextNode('');
  if (!oldDOM) return parent.appendChild(createElement(vnode));

  if (shouldReplace(oldDOM, vnode)) {
    const newDOM = createElement(vnode);
    parent.replaceChild(newDOM, oldDOM);
    return newDOM;
  }

  if (typeof vnode === 'string' || typeof vnode === 'number') {
    if (oldDOM.nodeValue !== String(vnode)) {
      const newText = document.createTextNode(String(vnode));
      parent.replaceChild(newText, oldDOM);
      return newText;
    }
    return oldDOM;
  }

  updateElement(oldDOM, vnode);
  return oldDOM;
}

function shouldReplace(oldDOM, vnode) {
  return typeof vnode === 'object' &&
    (oldDOM.nodeType !== 1 || oldDOM.tagName.toLowerCase() !== vnode.tag);
}

function createElement(vnode) {
  if (typeof vnode !== 'object') return document.createTextNode(String(vnode));
  if (typeof vnode.tag === 'function') return createElement(vnode.tag(vnode.attrs));

  const el = document.createElement(vnode.tag);
  updateElement(el, vnode);
  return el;
}

function updateElement(el, vnode) {
  // Attributes and events
  for (const [key, value] of Object.entries(vnode.attrs || {})) {
    if (key.startsWith('on:')) {
      el[`on${key.slice(3)}`] = value;
    } else if (key === 'value' && el instanceof HTMLInputElement) {
      if (el.value !== value) el.value = value;
    } else if (value === true) {
      el.setAttribute(key, '');
    } else if (value !== false && value != null) {
      el.setAttribute(key, value);
    }
  }

  // Keyed children diffing
  const children = vnode.children || [];
  const oldChildren = Array.from(el.childNodes);
  const keyedMap = new Map();

  oldChildren.forEach((node) => {
    if (node.nodeType === 1) {
      const k = node.getAttribute('key');
      if (k != null) keyedMap.set(k, node);
    }
  });

  const newOrder = [];
  children.forEach((childVNode, idx) => {
    const k = childVNode.attrs && childVNode.attrs.key;
    let node;

    if (k != null && keyedMap.has(String(k))) {
      node = keyedMap.get(String(k));
      keyedMap.delete(String(k));
      patch(el, node, childVNode);
    } else {
      const oldNode = oldChildren[idx];
      node = patch(el, oldNode, childVNode);
    }

    newOrder.push(node);
  });

  newOrder.forEach((node, i) => {
    const ref = el.childNodes[i];
    if (ref !== node) el.insertBefore(node, ref || null);
  });

  keyedMap.forEach((node) => el.removeChild(node));

  const totalNew = children.length;
  Array.from(el.childNodes)
    .slice(totalNew)
    .forEach((node) => el.removeChild(node));
}

// Routing
export function startRouter(routes, container, fallback = () => Vnode('div', {}, 'Not Found')) {
  const [getHash, setHash] = createState(window.location.hash);

  function Router() {
    const path = getHash().slice(1) || '/';
    const view = routes[path] || fallback;
    return view();
  }

  window.addEventListener('hashchange', () => setHash(window.location.hash));
  render(Router, container);
}

export function appendChild(parent, vnode) {
  const el = createElement(vnode);
  parent.appendChild(el);
  return el;
}

export function append(parent, ...vnodes) {
  vnodes.flat().forEach(vnode => {
    const el = createElement(vnode);
    parent.append(el);
  });
}

