let currentEffect = null;
let batchQueue = [];
let isBatching = false;

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