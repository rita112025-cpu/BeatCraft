// Minimal hook runtime standing in for runtime.js, so App can be rendered without a DOM.
// Function components are expanded eagerly, which works because only App and its custom hooks use hooks.
let state = [];
let refs = [];
let effects = [];
let cursor = 0;

export function reset() {
  state = [];
  refs = [];
  effects = [];
  cursor = 0;
}

export const I = {
  useState(initial) {
    const k = cursor++;
    const store = state;
    if (!(k in store)) store[k] = typeof initial === "function" ? initial() : initial;
    return [store[k], (value) => (store[k] = typeof value === "function" ? value(store[k]) : value)];
  },
  useRef(initial) {
    const k = cursor++;
    return (refs[k] ??= { current: initial });
  },
  useCallback(fn) {
    cursor++;
    return fn;
  },
  useEffect(fn, deps) {
    const k = cursor++;
    const old = effects[k];
    if (!old || deps.some((value, i) => value !== old.deps[i])) {
      old?.cleanup?.();
      effects[k] = { deps, fn };
    }
  },
};

export const h = (type, props = {}) => (typeof type === "function" ? type(props) : { type, props });

export function render(Component) {
  cursor = 0;
  const root = Component({});
  for (const effect of effects) {
    if (!effect?.fn) continue;
    const fn = effect.fn;
    effect.fn = null;
    effect.cleanup = fn();
  }
  return root;
}
