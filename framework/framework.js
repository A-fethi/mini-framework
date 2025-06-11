let currentEffect = null;
let batchQueue = [];
let isBatching = false;

// ========== CORE ==========
export function Vnode(tag, attrs = {}, children = []) {
  return {
    tag,
    attrs,
    children: Array.isArray(children) ? children.flat() : [children],
    hooks: {}
  };
}

export function render(component, container) {
  if (!container) return;
  let currentDOM = null;
  effect(() => {
    currentDOM = patch(container, currentDOM, component());
  });
}

// ========== REACTIVITY ==========
export function createState(initial) {
  let state = initial;
  const listeners = new Set();

  const get = () => {
    if (currentEffect) listeners.add(currentEffect);
    return state;
  };

  const set = (next) => {
    if (Object.is(state, next)) return;
    state = next;
    if (isBatching) {
      listeners.forEach(fn => batchQueue.push(fn));
    } else {
      batch(() => listeners.forEach(fn => fn()));
    }
  };

  return [get, set];
}

export function effect(fn) {
  const execute = () => {
    currentEffect = execute;
    fn();
    currentEffect = null;
  };
  execute();
}

export function batch(fn) {
  if (isBatching) {
    fn();
    return;
  }
  
  isBatching = true;
  const prevQueue = batchQueue;
  batchQueue = [];
  
  try {
    fn();
  } finally {
    isBatching = false;
    const uniqueEffects = [...new Set(batchQueue)];
    batchQueue = prevQueue;
    uniqueEffects.forEach(effect => effect());
  }
}

// ========== DOM PATCHING ==========
function patch(parent, oldNode, newNode) {
  if (!parent) return null;
  
  // Handle empty/array nodes
  if (newNode == null) return document.createTextNode('');
  if (Array.isArray(newNode)) return patchFragment(parent, oldNode, newNode);
  
  // Handle text nodes
  if (typeof newNode !== 'object') return patchText(parent, oldNode, newNode);
  
  // Handle component nodes
  if (typeof newNode.tag === 'function') {
    const componentVNode = newNode.tag(newNode.attrs);
    componentVNode.hooks = newNode.hooks;
    return patch(parent, oldNode, componentVNode);
  }
  
  // Handle element replacement
  if (!oldNode || shouldReplace(oldNode, newNode)) {
    return replaceNode(parent, oldNode, newNode);
  }
  
  // Update existing element
  updateElement(oldNode, newNode);
  return oldNode;
}

function patchFragment(parent, oldNode, children) {
  const fragment = document.createDocumentFragment();
  children.forEach(child => fragment.appendChild(patch(parent, null, child)));
  return fragment;
}

function patchText(parent, oldNode, text) {
  if (oldNode?.nodeValue === String(text)) return oldNode;
  const newText = document.createTextNode(String(text));
  if (oldNode && parent.contains(oldNode)) parent.replaceChild(newText, oldNode);
  else parent.appendChild(newText);
  return newText;
}

function shouldReplace(oldNode, newNode) {
  const isOldText = oldNode.nodeType === 3;
  const isNewText = typeof newNode === 'string' || typeof newNode === 'number';
  if (isOldText !== isNewText) return true;
  return !isNewText && oldNode.tagName.toLowerCase() !== newNode.tag;
}

function replaceNode(parent, oldNode, newNode) {
  const newDOM = createElement(newNode);
  if (oldNode && parent.contains(oldNode)) parent.replaceChild(newDOM, oldNode);
  else parent.appendChild(newDOM);
  return newDOM;
}

function createElement(vnode) {
  if (vnode == null) return document.createTextNode('');
  if (Array.isArray(vnode)) return patchFragment(null, null, vnode);
  if (typeof vnode !== 'object') return document.createTextNode(String(vnode));
  
  const el = document.createElement(vnode.tag);
  if (vnode.hooks.onMount) vnode.hooks.onMount(el);
  updateElement(el, vnode);
  return el;
}

function updateElement(el, vnode) {
  if (!vnode.attrs) return;
  
  for (const [key, value] of Object.entries(vnode.attrs)) {
    if (key === 'ref') value(el);
    else if (key.startsWith('on') && typeof value === 'function') el[key.toLowerCase()] = value;
    else if (key === 'value' && el instanceof HTMLInputElement) el.value = value;
    else if (key === 'checked' && el instanceof HTMLInputElement) el.checked = value; // <-- Added
    else if (value === true) el.setAttribute(key, '');
    else if (value !== false && value != null) el.setAttribute(key, value);
  }

  reconcileChildren(el, vnode.children || []);
}

function reconcileChildren(el, children) {
  const oldChildren = Array.from(el.childNodes);
  const keyedOld = getKeyedNodes(oldChildren);
  const newOrder = [];

  children.forEach((child, i) => {
    // 👇 Skip null/undefined
    if (child == null) return;

    const key = typeof child === 'object' ? child.attrs?.key : null;
    const node = key != null && keyedOld.has(key)
      ? keyedOld.get(key)
      : oldChildren[i];

    newOrder.push(patch(el, node, child));
  });

  // Re-order and cleanup
  newOrder.forEach((node, i) => {
    if (el.childNodes[i] !== node) {
      el.insertBefore(node, el.childNodes[i] || null);
    }
  });

  // Remove excess nodes
  while (el.childNodes.length > newOrder.length) {
    el.removeChild(el.lastChild);
  }
}


function getKeyedNodes(nodes) {
  const keyed = new Map();
  nodes.forEach(node => {
    if (node.nodeType === 1) {
      const key = node.getAttribute('key');
      if (key != null) keyed.set(key, node);
    }
  });
  return keyed;
}

// ========== ROUTER ==========
export function startRouter(routes, container, fallback = () => Vnode('div', {}, 'Not Found')) {
  const [getHash, setHash] = createState(window.location.hash);
  let currentDOM = null;
  
  window.addEventListener('hashchange', () => setHash(window.location.hash));
  
  effect(() => {
    const path = getHash().slice(1) || '/';
    const view = routes[path] || fallback;
    currentDOM = patch(container, currentDOM, view());
  });
}