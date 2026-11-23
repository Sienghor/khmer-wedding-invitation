import { useSyncExternalStore } from 'react';

const query = '(prefers-reduced-motion: reduce)';
const subscribe = (cb: () => void) => {
  const m = matchMedia(query);
  m.addEventListener('change', cb);
  return () => m.removeEventListener('change', cb);
};

export const prefersReducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia(query).matches;

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
}
