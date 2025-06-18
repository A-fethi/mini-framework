import { effect } from './reactivity.js';
import { patch } from './dom.js';

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